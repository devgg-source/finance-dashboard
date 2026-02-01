import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { initialTransactions, categories } from '../data/mockData';
import dbService from '../services/indexedDB';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Initialize IndexedDB
        await dbService.init();
        
        // Check if we have existing data
        const hasExistingData = await dbService.hasData();
        
        if (hasExistingData) {
          // Load existing transactions from IndexedDB
          const storedTransactions = await dbService.getAllTransactions();
          setTransactions(storedTransactions);
          console.log(`📦 Loaded ${storedTransactions.length} transactions from IndexedDB`);
        } else {
          // First time: seed with mock data
          await dbService.addTransactions(initialTransactions);
          setTransactions(initialTransactions);
          console.log('🌱 Seeded database with initial transactions');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to mock data if IndexedDB fails
        setTransactions(initialTransactions);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add new transaction
  const addTransaction = useCallback(async (transaction) => {
    try {
      // Add to IndexedDB first
      await dbService.addTransaction(transaction);
      
      // Then update state
      setTransactions(prev => [transaction, ...prev]);
      
      console.log('✅ Transaction added successfully');
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    try {
      // Delete from IndexedDB first
      await dbService.deleteTransaction(id);
      
      // Then update state
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      console.log('✅ Transaction deleted successfully');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }, []);

  // Update transaction
  const updateTransaction = useCallback(async (transaction) => {
    try {
      // Update in IndexedDB first
      await dbService.updateTransaction(transaction);
      
      // Then update state
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
      
      console.log('✅ Transaction updated successfully');
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }, []);

  // Clear all data and reset
  const resetData = useCallback(async () => {
    try {
      await dbService.clearAllTransactions();
      await dbService.addTransactions(initialTransactions);
      setTransactions(initialTransactions);
      console.log('🔄 Data reset to initial state');
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else if (t.type === 'expense') acc.expense += t.amount;
      else if (t.type === 'savings') acc.savings += t.amount;
      return acc;
    }, { income: 0, expense: 0, savings: 0 });
  }, [transactions]);

  // Calculate balance
  const balance = totals.income - totals.expense - totals.savings;

  // Get category details
  const getCategoryById = useCallback((id) => categories.find(c => c.id === id), []);

  // Get expenses by category
  const expensesByCategory = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const grouped = expenseTransactions.reduce((acc, t) => {
      const category = getCategoryById(t.category);
      if (!acc[t.category]) {
        acc[t.category] = {
          name: category?.name || t.category,
          value: 0,
          color: category?.color || '#6b7280'
        };
      }
      acc[t.category].value += t.amount;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [transactions, getCategoryById]);

  const value = {
    transactions,
    categories,
    totals,
    balance,
    expensesByCategory,
    isLoading,
    isInitialized,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    resetData,
    getCategoryById
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
