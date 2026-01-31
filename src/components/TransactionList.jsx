import { Trash2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const TransactionList = ({ limit }) => {
  const { transactions, deleteTransaction, getCategoryById } = useFinance();
  
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-semibold text-sm ${typeConfig.color}`}>
                  {typeConfig.sign}{formatAmount(transaction.amount)}
                </p>
              </div>
              
              {/* Delete button */}
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
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
