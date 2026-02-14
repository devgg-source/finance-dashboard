import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, RefreshCw, Calendar, Clock, AlertTriangle,
  CheckCircle2, XCircle, Trash2, Loader2, Pause, Play,
  Sparkles, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown,
  Eye, X, Zap, BellRing, TrendingDown, TrendingUp, Pencil
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/datepicker.css';
import { useRecurring } from '../context/RecurringContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/LanguageContext';
import { FREQUENCY, getFrequencyLabel, calculateNextDueDate } from '../utils/recurringDetector';
import { v4 as uuidv4 } from 'uuid';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const RecurringPage = () => {
  const {
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
  } = useRecurring();
  const { categories } = useFinance();
  const toast = useToast();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('active');
  const [modalMode, setModalMode] = useState(null); // null = closed, 'add' = new, object = editing
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // truthy = show confirm dialog

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'utilities',
    description: '',
    amount: '',
    frequency: FREQUENCY.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
  });

  const isModalOpen = modalMode !== null;
  const editingRecurring = typeof modalMode === 'object' ? modalMode : null;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  // Helper to get translated category name
  const getCategoryName = (categoryId) => {
    return t(`categories.${categoryId}`) || categoryId;
  };

  // Format amount
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const getStatusBadge = (recurring) => {
    if (!recurring.isActive) {
      return { label: t('recurring.paused'), color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
    if (isOverdue(recurring.nextDueDate)) {
      return { label: t('recurring.overdue'), color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
    if (isDueSoon(recurring.nextDueDate)) {
      return { label: t('recurring.dueSoon'), color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    return { label: t('recurring.upcoming'), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  // Filtered items
  const filteredRecurring = useMemo(() => {
    let items = recurringTransactions;

    if (activeTab === 'active') {
      items = items.filter(r => r.isActive);
    } else if (activeTab === 'paused') {
      items = items.filter(r => !r.isActive);
    }

    if (searchQuery) {
      items = items.filter(r =>
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: overdue first, then due soon, then by next due date
    return items.sort((a, b) => {
      const aOverdue = isOverdue(a.nextDueDate) ? 0 : 1;
      const bOverdue = isOverdue(b.nextDueDate) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return new Date(a.nextDueDate) - new Date(b.nextDueDate);
    });
  }, [recurringTransactions, activeTab, searchQuery]);

  // Reset form and close modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      type: 'expense',
      category: 'utilities',
      description: '',
      amount: '',
      frequency: FREQUENCY.MONTHLY,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingRecurring) {
        await updateRecurring({
          ...editingRecurring,
          ...formData,
          amount: parseFloat(formData.amount),
          nextDueDate: calculateNextDueDate(formData.startDate, formData.frequency),
        });
        toast.success(t('recurring.updated'));
      } else {
        await addRecurring({
          id: uuidv4(),
          ...formData,
          amount: parseFloat(formData.amount),
          nextDueDate: calculateNextDueDate(formData.startDate, formData.frequency),
          lastPaidDate: null,
          isAutoDetected: false,
        });
        toast.success(t('recurring.added'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('recurring.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (recurring) => {
    setFormData({
      type: recurring.type,
      category: recurring.category,
      description: recurring.description,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      startDate: recurring.startDate,
    });
    setModalMode(recurring);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeletingId(deleteTargetId);
    try {
      await deleteRecurring(deleteTargetId);
      toast.success(t('recurring.deleted'));
    } catch (error) {
      toast.error(t('recurring.deleteFailed'));
    } finally {
      setDeletingId(null);
      setDeleteTargetId(null);
    }
  };

  // Handle mark as paid
  const handleMarkPaid = async (id) => {
    try {
      await markAsPaid(id);
      toast.success(t('recurring.markedPaid'));
    } catch (error) {
      toast.error(t('recurring.markPaidFailed'));
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  // Handle accept detected pattern
  const handleAcceptPattern = async (pattern) => {
    try {
      await acceptDetectedPattern(pattern);
      toast.success(t('recurring.patternAccepted'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('recurring.title')}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t('recurring.subtitle')}</p>
        </div>
        <button
          onClick={() => setModalMode('add')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('recurring.addRecurring')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{t('recurring.activeRecurring')}</p>
              <p className="text-xl font-bold text-white">{summary.totalActive}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{t('recurring.monthlyExpenses')}</p>
              <p className="text-xl font-bold text-white">{formatAmount(summary.monthlyExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{t('recurring.monthlyIncome')}</p>
              <p className="text-xl font-bold text-white">{formatAmount(summary.monthlyIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{t('recurring.overdueUpcoming')}</p>
              <p className="text-xl font-bold text-white">
                <span className={summary.overdueCount > 0 ? 'text-rose-400' : ''}>{summary.overdueCount}</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-amber-400">{summary.upcomingCount}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Patterns Section */}
      {detectedPatterns.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl p-6 border border-indigo-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{t('recurring.detectedPatterns')}</h3>
              <p className="text-slate-500 text-xs">{t('recurring.detectedPatternsDesc')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {detectedPatterns.map(pattern => {
              const typeConfig = getTypeConfig(pattern.type);
              return (
                <div
                  key={pattern.id}
                  className="bg-[#12121a]/60 rounded-xl p-4 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{pattern.description}</p>
                      <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {pattern.confidence}% {t('recurring.confidence')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatAmount(pattern.amount)}</span>
                      <span>•</span>
                      <span>{getFrequencyLabel(pattern.frequency)}</span>
                      <span>•</span>
                      <span>{pattern.occurrences} {t('recurring.occurrences')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAcceptPattern(pattern)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('recurring.track')}
                    </button>
                    <button
                      onClick={() => dismissDetectedPattern(pattern.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 text-xs font-medium rounded-lg border border-white/[0.06] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t('recurring.dismiss')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-[#12121a] rounded-xl p-1 border border-white/[0.06]">
          {[
            { id: 'active', label: t('recurring.active') },
            { id: 'paused', label: t('recurring.pausedTab') },
            { id: 'all', label: t('recurring.all') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('recurring.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Recurring Transactions List */}
      <div className="space-y-3">
        {filteredRecurring.length === 0 ? (
          <div className="bg-[#12121a] rounded-2xl p-12 border border-white/[0.06] text-center">
            <RefreshCw className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">{t('recurring.noRecurring')}</h3>
            <p className="text-slate-500 text-sm mb-6">{t('recurring.noRecurringDesc')}</p>
            <button
              onClick={() => setModalMode('add')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('recurring.addFirst')}
            </button>
          </div>
        ) : (
          filteredRecurring.map(recurring => {
            const typeConfig = getTypeConfig(recurring.type);
            const status = getStatusBadge(recurring);
            const category = categories.find(c => c.id === recurring.category);

            return (
              <div
                key={recurring.id}
                className={`bg-[#12121a] rounded-2xl p-5 border transition-colors ${
                  isOverdue(recurring.nextDueDate) && recurring.isActive
                    ? 'border-rose-500/30 bg-rose-500/[0.02]'
                    : 'border-white/[0.06]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate">{recurring.description}</p>
                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                        {recurring.isAutoDetected && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {t('recurring.autoDetected')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{category?.icon} {getCategoryName(recurring.category)}</span>
                        <span>•</span>
                        <span>{getFrequencyLabel(recurring.frequency)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t('recurring.nextDue')}: {formatDate(recurring.nextDueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className={`text-base font-semibold ${typeConfig.color}`}>
                      {typeConfig.sign}{formatAmount(recurring.amount)}
                    </p>

                    <div className="flex items-center gap-1.5">
                      {recurring.isActive && (
                        <button
                          onClick={() => handleMarkPaid(recurring.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          title={t('recurring.markPaid')}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(recurring.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          recurring.isActive
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                        }`}
                        title={recurring.isActive ? t('recurring.pause') : t('recurring.resume')}
                      >
                        {recurring.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(recurring)}
                        className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                        title={t('common.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(recurring.id)}
                        disabled={deletingId === recurring.id}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                        title={t('common.delete')}
                      >
                        {deletingId === recurring.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Last paid info */}
                {recurring.lastPaidDate && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <p className="text-xs text-slate-600">
                      {t('recurring.lastPaid')}: {formatDate(recurring.lastPaidDate)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#12121a] rounded-2xl border border-white/[0.08] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">
                {editingRecurring ? t('recurring.editRecurring') : t('recurring.addRecurring')}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('transactions.type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'expense', label: t('common.expense'), color: 'rose' },
                    { id: 'income', label: t('common.income'), color: 'emerald' },
                    { id: 'savings', label: t('common.savings'), color: 'indigo' },
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        type: type.id,
                        category: type.id === 'income' ? 'income' : type.id === 'savings' ? 'savings' : 'utilities'
                      }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                        formData.type === type.id
                          ? `bg-${type.color}-500/10 text-${type.color}-400 border-${type.color}-500/30`
                          : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.04]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('transactions.description')}</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('recurring.descriptionPlaceholder')}
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('transactions.amount')}</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="1"
                  step="any"
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  required
                />
              </div>

              {/* Category */}
              {formData.type === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('transactions.category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                  >
                    {categories
                      .filter(c => !['income', 'savings'].includes(c.id))
                      .map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#12121a]">
                          {cat.icon} {getCategoryName(cat.id)}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('recurring.frequency')}</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                >
                  {Object.entries(FREQUENCY).map(([key, value]) => (
                    <option key={value} value={value} className="bg-[#12121a]">
                      {getFrequencyLabel(value)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('recurring.startDate')}</label>
                <DatePicker
                  selected={formData.startDate ? new Date(formData.startDate) : new Date()}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    startDate: date.toISOString().split('T')[0]
                  }))}
                  dateFormat="dd MMM yyyy"
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  calendarClassName="dark-datepicker"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-sm font-medium rounded-xl border border-white/[0.06] transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.description || !formData.amount}
                  className="flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingRecurring ? t('common.saveChanges') : t('recurring.addRecurring')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('recurring.deleteTitle')}
        message={t('recurring.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        confirmVariant="danger"
        isLoading={!!deletingId}
        icon={Trash2}
      />
    </div>
  );
};

export default RecurringPage;
