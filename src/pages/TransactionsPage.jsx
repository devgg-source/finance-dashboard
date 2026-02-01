import { useState, useMemo } from 'react';
import { Plus, Search, Filter, X, Calendar, ArrowUpRight, ArrowDownRight, Wallet, Trash2, Loader2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { v4 as uuidv4 } from 'uuid';

const TransactionsPage = () => {
  const { transactions, categories, addTransaction, deleteTransaction, getCategoryById, isLoading } = useFinance();
  const toast = useToast();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // State for new transaction form
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: 'food',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  // Format helpers
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'income':
        return { icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sign: '+' };
      case 'savings':
        return { icon: Wallet, color: 'text-indigo-400', bg: 'bg-indigo-500/10', sign: '-' };
      default:
        return { icon: ArrowDownRight, color: 'text-rose-400', bg: 'bg-rose-500/10', sign: '-' };
    }
  };

  // Handle form submission (async)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        id: uuidv4(),
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });

      toast.success('Transaction added', `${newTransaction.description} has been saved`);

      // Reset form
      setNewTransaction({
        type: 'expense',
        category: 'food',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete (async)
  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted', 'The transaction has been removed');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete', 'Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Get relevant categories based on transaction type
  const getRelevantCategories = (type) => {
    if (type === 'income') return categories.filter(c => c.id === 'income');
    if (type === 'savings') return categories.filter(c => c.id === 'savings');
    return categories.filter(c => !['income', 'savings'].includes(c.id));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and track all your transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#12121a] rounded-2xl p-4 border border-white/[0.06]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
            <span className="text-xs text-slate-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs capitalize">
                {typeFilter}
                <button onClick={() => setTypeFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs">
                {getCategoryById(categoryFilter)?.name}
                <button onClick={() => setCategoryFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-[#12121a] rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-white/[0.04]">
          {filteredTransactions.map((transaction) => {
            const category = getCategoryById(transaction.category);
            const typeConfig = getTypeConfig(transaction.type);
            
            return (
              <div
                key={transaction.id}
                className="group grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Description with icon */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg">
                      {category?.icon || '💵'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${typeConfig.bg} flex items-center justify-center`}>
                      <typeConfig.icon className={`w-2.5 h-2.5 ${typeConfig.color}`} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{transaction.description}</p>
                    <p className={`text-xs ${typeConfig.color} capitalize`}>{transaction.type}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-slate-400">{category?.name}</span>
                </div>

                {/* Date */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-slate-400">{formatDate(transaction.date)}</span>
                </div>

                {/* Amount */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className={`font-semibold text-sm ${typeConfig.color}`}>
                    {typeConfig.sign}{formatAmount(transaction.amount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    {deletingId === transaction.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No transactions found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm text-slate-500">
            Showing <span className="text-white font-medium">{filteredTransactions.length}</span> of{' '}
            <span className="text-white font-medium">{transactions.length}</span> transactions
          </p>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-[#12121a] rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['income', 'expense', 'savings'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setNewTransaction(prev => ({
                          ...prev,
                          type,
                          category: type === 'income' ? 'income' : type === 'savings' ? 'savings' : 'food'
                        }));
                      }}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium capitalize transition-all ${
                        newTransaction.type === type
                          ? type === 'income'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : type === 'savings'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-white/[0.04] text-slate-400 border border-transparent hover:border-white/[0.06]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                  {getRelevantCategories(newTransaction.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description..."
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
