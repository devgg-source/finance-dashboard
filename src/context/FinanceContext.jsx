import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { categories } from '../data/mockData';
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
        
        // Load existing transactions from IndexedDB
        const storedTransactions = await dbService.getAllTransactions();
        setTransactions(storedTransactions);
        
        setIsInitialized(true);
      } catch (error) {
        // Start with empty state if IndexedDB fails
        setTransactions([]);
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      throw error;
    }
  }, []);

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      await dbService.clearAllTransactions();
      setTransactions([]);
    } catch (error) {
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

  // Calculate monthly trends (current month vs last month)
  const monthlyTrends = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get last month (handle January -> December of previous year)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter transactions by month
    const currentMonthTxns = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthTxns = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Calculate totals for each month
    const calcTotals = (txns) => txns.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else if (t.type === 'expense') acc.expense += t.amount;
      else if (t.type === 'savings') acc.savings += t.amount;
      return acc;
    }, { income: 0, expense: 0, savings: 0 });

    const currentTotals = calcTotals(currentMonthTxns);
    const lastTotals = calcTotals(lastMonthTxns);

    // Calculate percentage change
    const calcTrend = (current, last) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - last) / last) * 100);
    };

    // Balance trends
    const currentBalance = currentTotals.income - currentTotals.expense - currentTotals.savings;
    const lastBalance = lastTotals.income - lastTotals.expense - lastTotals.savings;

    return {
      income: {
        value: calcTrend(currentTotals.income, lastTotals.income),
        direction: currentTotals.income >= lastTotals.income ? 'up' : 'down'
      },
      expense: {
        value: Math.abs(calcTrend(currentTotals.expense, lastTotals.expense)),
        direction: currentTotals.expense <= lastTotals.expense ? 'down' : 'up' // Down is good for expenses
      },
      savings: {
        value: calcTrend(currentTotals.savings, lastTotals.savings),
        direction: currentTotals.savings >= lastTotals.savings ? 'up' : 'down'
      },
      balance: {
        value: Math.abs(calcTrend(currentBalance, lastBalance)),
        direction: currentBalance >= lastBalance ? 'up' : 'down'
      }
    };
  }, [transactions]);

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

  // Calculate monthly data for charts (last 6 months)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      // Filter transactions for this month
      const monthTxns = transactions.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate.getMonth() === month && txnDate.getFullYear() === year;
      });

      // Calculate totals
      const totals = monthTxns.reduce((acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else if (t.type === 'expense') acc.expense += t.amount;
        else if (t.type === 'savings') acc.savings += t.amount;
        return acc;
      }, { income: 0, expense: 0, savings: 0 });

      result.push({
        month: months[month],
        income: totals.income,
        expense: totals.expense,
        savings: totals.savings
      });
    }

    return result;
  }, [transactions]);

  const value = {
    transactions,
    categories,
    totals,
    balance,
    expensesByCategory,
    monthlyData,
    monthlyTrends,
    isLoading,
    isInitialized,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    clearAllData,
    getCategoryById
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
