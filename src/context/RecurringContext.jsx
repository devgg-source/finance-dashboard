import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { recurringService } from '../services/supabase';
import { useFinance } from './FinanceContext';
import { 
  detectRecurringTransactions, 
  calculateNextDueDate, 
  getRecurringSummary,
  isOverdue,
  isDueSoon 
} from '../utils/recurringDetector';
import { v4 as uuidv4 } from 'uuid';

const RecurringContext = createContext();

export const useRecurring = () => {
  const context = useContext(RecurringContext);
  if (!context) {
    throw new Error('useRecurring must be used within a RecurringProvider');
  }
  return context;
};

// Local storage fallback key (used when Supabase table doesn't exist)
const LOCAL_STORAGE_KEY = 'xpensio_recurring_transactions';

const getLocalRecurring = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalRecurring = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save recurring transactions locally:', e);
  }
};

export const RecurringProvider = ({ children }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const { transactions, addTransaction } = useFinance();

  // Load recurring transactions
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await recurringService.getAll();
        setRecurringTransactions(data);
        setUseLocalStorage(false);
      } catch (error) {
        console.warn('Falling back to local storage for recurring transactions:', error);
        const localData = getLocalRecurring();
        setRecurringTransactions(localData);
        setUseLocalStorage(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Detect recurring patterns from transaction history
  useEffect(() => {
    if (transactions.length >= 3) {
      const patterns = detectRecurringTransactions(transactions, recurringTransactions);
      setDetectedPatterns(patterns);
    }
  }, [transactions, recurringTransactions]);

  // Save to local storage when using fallback
  useEffect(() => {
    if (useLocalStorage && recurringTransactions.length > 0) {
      setLocalRecurring(recurringTransactions);
    }
  }, [recurringTransactions, useLocalStorage]);

  // Add a recurring transaction
  const addRecurring = useCallback(async (recurring) => {
    const newRecurring = {
      ...recurring,
      id: recurring.id || uuidv4(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!useLocalStorage) {
        await recurringService.add(newRecurring);
      }
      setRecurringTransactions(prev => [...prev, newRecurring]);
      if (useLocalStorage) {
        setLocalRecurring([...recurringTransactions, newRecurring]);
      }
      return newRecurring;
    } catch (error) {
      // Fallback to local storage
      setRecurringTransactions(prev => [...prev, newRecurring]);
      setLocalRecurring([...recurringTransactions, newRecurring]);
      setUseLocalStorage(true);
      return newRecurring;
    }
  }, [useLocalStorage, recurringTransactions]);

  // Accept a detected pattern (convert to tracked recurring)
  const acceptDetectedPattern = useCallback(async (pattern) => {
    const recurring = {
      ...pattern,
      isAutoDetected: true,
    };
    const result = await addRecurring(recurring);
    // Remove from detected patterns
    setDetectedPatterns(prev => prev.filter(p => p.id !== pattern.id));
    return result;
  }, [addRecurring]);

  // Dismiss a detected pattern
  const dismissDetectedPattern = useCallback((patternId) => {
    setDetectedPatterns(prev => prev.filter(p => p.id !== patternId));
  }, []);

  // Update a recurring transaction
  const updateRecurring = useCallback(async (recurring) => {
    try {
      if (!useLocalStorage) {
        await recurringService.update(recurring);
      }
      setRecurringTransactions(prev =>
        prev.map(r => r.id === recurring.id ? recurring : r)
      );
      if (useLocalStorage) {
        const updated = recurringTransactions.map(r => r.id === recurring.id ? recurring : r);
        setLocalRecurring(updated);
      }
      return recurring;
    } catch (error) {
      throw error;
    }
  }, [useLocalStorage, recurringTransactions]);

  // Delete a recurring transaction
  const deleteRecurring = useCallback(async (id) => {
    try {
      if (!useLocalStorage) {
        await recurringService.delete(id);
      }
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
      if (useLocalStorage) {
        const filtered = recurringTransactions.filter(r => r.id !== id);
        setLocalRecurring(filtered);
      }
    } catch (error) {
      throw error;
    }
  }, [useLocalStorage, recurringTransactions]);

  // Toggle active/inactive
  const toggleActive = useCallback(async (id) => {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (!recurring) return;

    const updated = { ...recurring, isActive: !recurring.isActive };
    return updateRecurring(updated);
  }, [recurringTransactions, updateRecurring]);

  // Mark a recurring transaction as paid — creates an actual transaction
  const markAsPaid = useCallback(async (recurringId) => {
    const recurring = recurringTransactions.find(r => r.id === recurringId);
    if (!recurring) return;

    // Create the actual transaction
    const transaction = {
      id: uuidv4(),
      type: recurring.type,
      category: recurring.category,
      description: recurring.description,
      amount: recurring.amount,
      date: new Date().toISOString().split('T')[0],
    };

    await addTransaction(transaction);

    // Advance the next due date
    const nextDue = calculateNextDueDate(new Date().toISOString().split('T')[0], recurring.frequency);
    const updated = {
      ...recurring,
      lastPaidDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDue,
    };

    try {
      if (!useLocalStorage) {
        await recurringService.markPaid(recurring, nextDue);
      }
      setRecurringTransactions(prev =>
        prev.map(r => r.id === recurringId ? updated : r)
      );
      if (useLocalStorage) {
        const updatedList = recurringTransactions.map(r => r.id === recurringId ? updated : r);
        setLocalRecurring(updatedList);
      }
      return updated;
    } catch (error) {
      // Still update locally
      setRecurringTransactions(prev =>
        prev.map(r => r.id === recurringId ? updated : r)
      );
      return updated;
    }
  }, [recurringTransactions, addTransaction, useLocalStorage]);

  // Get summary stats
  const summary = useMemo(() => {
    return getRecurringSummary(recurringTransactions);
  }, [recurringTransactions]);

  const value = {
    recurringTransactions,
    detectedPatterns,
    summary,
    isLoading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    markAsPaid,
    acceptDetectedPattern,
    dismissDetectedPattern,
    isOverdue,
    isDueSoon,
  };

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
};
