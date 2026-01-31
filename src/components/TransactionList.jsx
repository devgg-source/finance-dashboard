import { Trash2 } from 'lucide-react';
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

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => {
        const category = getCategoryById(transaction.category);
        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{category?.icon || '💵'}</div>
              <div>
                <p className="font-medium text-white">{transaction.description}</p>
                <p className="text-sm text-slate-400">{category?.name} • {formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-400' : 
                transaction.type === 'savings' ? 'text-sky-400' : 'text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
              </span>
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
