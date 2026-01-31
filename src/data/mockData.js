import { v4 as uuidv4 } from 'uuid';

// Categories for expenses
export const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#14b8a6' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#ef4444' },
  { id: 'income', name: 'Income', icon: '💰', color: '#22c55e' },
  { id: 'savings', name: 'Savings', icon: '🏦', color: '#0ea5e9' },
];

// Mock transactions
export const initialTransactions = [
  { id: uuidv4(), type: 'income', category: 'income', description: 'Monthly Salary', amount: 75000, date: '2025-01-01' },
  { id: uuidv4(), type: 'expense', category: 'food', description: 'Groceries', amount: 3500, date: '2025-01-02' },
  { id: uuidv4(), type: 'expense', category: 'utilities', description: 'Electricity Bill', amount: 2100, date: '2025-01-03' },
  { id: uuidv4(), type: 'expense', category: 'transport', description: 'Fuel', amount: 1800, date: '2025-01-05' },
  { id: uuidv4(), type: 'expense', category: 'shopping', description: 'Clothing', amount: 4500, date: '2025-01-07' },
  { id: uuidv4(), type: 'expense', category: 'entertainment', description: 'Netflix Subscription', amount: 649, date: '2025-01-08' },
  { id: uuidv4(), type: 'expense', category: 'food', description: 'Restaurant', amount: 1200, date: '2025-01-10' },
  { id: uuidv4(), type: 'savings', category: 'savings', description: 'Monthly Savings', amount: 15000, date: '2025-01-11' },
  { id: uuidv4(), type: 'expense', category: 'health', description: 'Gym Membership', amount: 1500, date: '2025-01-12' },
  { id: uuidv4(), type: 'expense', category: 'utilities', description: 'Internet Bill', amount: 999, date: '2025-01-15' },
  { id: uuidv4(), type: 'expense', category: 'transport', description: 'Metro Card Recharge', amount: 500, date: '2025-01-18' },
  { id: uuidv4(), type: 'expense', category: 'food', description: 'Coffee Shop', amount: 350, date: '2025-01-20' },
];

// Monthly data for charts
export const monthlyData = [
  { month: 'Jan', income: 75000, expense: 32000, savings: 15000 },
  { month: 'Feb', income: 75000, expense: 28000, savings: 18000 },
  { month: 'Mar', income: 78000, expense: 35000, savings: 15000 },
  { month: 'Apr', income: 78000, expense: 30000, savings: 20000 },
  { month: 'May', income: 80000, expense: 33000, savings: 17000 },
  { month: 'Jun', income: 80000, expense: 29000, savings: 22000 },
];

// Category-wise expense data
export const categoryExpenses = [
  { name: 'Food & Dining', value: 8500, color: '#f97316' },
  { name: 'Transportation', value: 4500, color: '#3b82f6' },
  { name: 'Shopping', value: 6000, color: '#ec4899' },
  { name: 'Entertainment', value: 2500, color: '#8b5cf6' },
  { name: 'Utilities', value: 5000, color: '#14b8a6' },
  { name: 'Health', value: 3500, color: '#ef4444' },
];
