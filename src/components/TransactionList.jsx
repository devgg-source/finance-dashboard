import { useState } from 'react';
import { Trash2, Pencil, ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

const TransactionList = ({ limit, onEdit }) => {
  const { transactions, deleteTransaction, getCategoryById } = useFinance();
  const toast = useToast();
  const { formatCurrency } = useSettings();
  const [deletingId, setDeletingId] = useState(null);
  
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const handleDelete = async (id, description) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted', `${description} has been removed`);
    } catch (error) {
      toast.error('Failed to delete', 'Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'income':
        return {
          icon: ArrowUpRight,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          sign: '+'
        };
      case 'savings':
        return {
          icon: Wallet,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          sign: '-'
        };
      default:
        return {
          icon: ArrowDownRight,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          sign: '-'
        };
    }
  };

  return (
    <div className="space-y-2">
      {displayTransactions.map((transaction) => {
        const category = getCategoryById(transaction.category);
        const typeConfig = getTypeConfig(transaction.type);
        
        return (
          <div
            key={transaction.id}
            className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
          >
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl">
                {category?.icon || '💵'}
              </div>
              {/* Type indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${typeConfig.bg} flex items-center justify-center`}>
                <typeConfig.icon className={`w-3 h-3 ${typeConfig.color}`} />
              </div>
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{transaction.description}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {category?.name} <span className="text-slate-600">•</span> {formatDate(transaction.date)}
              </p>
            </div>
            
            {/* Amount */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className={`font-semibold text-sm ${typeConfig.color}`}>
                  {typeConfig.sign}{formatCurrency(transaction.amount)}
                </p>
              </div>
              
              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Edit transaction"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              
              {/* Delete button */}
              <button
                onClick={() => handleDelete(transaction.id, transaction.description)}
                disabled={deletingId === transaction.id}
                className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                title="Delete transaction"
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
      
      {displayTransactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No transactions yet</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
