import { createContext, useContext, useState, useMemo } from 'react';
import { initialTransactions, categories } from '../data/mockData';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(initialTransactions);

  // Add new transaction
  const addTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

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
  const getCategoryById = (id) => categories.find(c => c.id === id);

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
  }, [transactions]);

  const value = {
    transactions,
    categories,
    totals,
    balance,
    expensesByCategory,
    addTransaction,
    deleteTransaction,
    getCategoryById
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
