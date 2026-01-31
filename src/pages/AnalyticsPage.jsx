import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Calendar,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { monthlyData } from '../data/mockData';

const AnalyticsPage = () => {
  const { transactions, totals, balance, expensesByCategory, categories } = useFinance();

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0, savings: 0 };
      }
      acc[month][t.type] += t.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expense - data.savings
    }));
  }, [transactions]);

  // Calculate spending by day of week
  const spendingByDay = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const day = days[new Date(t.date).getDay()];
        acc[day] = (acc[day] || 0) + t.amount;
        return acc;
      }, {});
    
    return days.map(day => ({
      day,
      amount: grouped[day] || 0
    }));
  }, [transactions]);

  // Calculate average transaction amounts
  const averages = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    return {
      avgIncome: incomeTransactions.length 
        ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length 
        : 0,
      avgExpense: expenseTransactions.length 
        ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length 
        : 0,
      totalTransactions: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length
    };
  }, [transactions]);

  // Top spending categories
  const topCategories = useMemo(() => {
    return [...expensesByCategory]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [expensesByCategory]);

  // Format helpers
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompact = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  // Savings rate
  const savingsRate = totals.income > 0 
    ? ((totals.savings / totals.income) * 100).toFixed(1) 
    : 0;

  // Expense ratio
  const expenseRatio = totals.income > 0 
    ? ((totals.expense / totals.income) * 100).toFixed(1) 
    : 0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm">Deep insights into your financial health</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Savings Rate */}
        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              +2.5%
            </span>
          </div>
          <p className="text-slate-500 text-sm">Savings Rate</p>
          <p className="text-2xl font-bold text-white mt-1">{savingsRate}%</p>
        </div>

        {/* Expense Ratio */}
        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">
              -3.2%
            </span>
          </div>
          <p className="text-slate-500 text-sm">Expense Ratio</p>
          <p className="text-2xl font-bold text-white mt-1">{expenseRatio}%</p>
        </div>

        {/* Avg Income */}
        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Avg Income</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCompact(averages.avgIncome)}</p>
        </div>

        {/* Avg Expense */}
        <div className="bg-[#12121a] rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Avg Expense</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCompact(averages.avgExpense)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expenses Trend */}
        <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Income vs Expenses</h3>
            <p className="text-slate-500 text-sm mt-0.5">6-month trend overview</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCompact} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Income"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Expense"
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  fill="url(#expenseGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Day */}
        <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Spending by Day</h3>
            <p className="text-slate-500 text-sm mt-0.5">Your weekly spending pattern</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCompact} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  name="Spending"
                  fill="#818cf8" 
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown */}
        <div className="lg:col-span-1 bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Expense Breakdown</h3>
            <p className="text-slate-500 text-sm mt-0.5">By category</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="lg:col-span-2 bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Top Spending Categories</h3>
            <p className="text-slate-500 text-sm mt-0.5">Where your money goes</p>
          </div>
          <div className="space-y-4">
            {topCategories.map((category, index) => {
              const percentage = totals.expense > 0 
                ? ((category.value / totals.expense) * 100).toFixed(1) 
                : 0;
              const cat = categories.find(c => c.name === category.name);
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {cat?.icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">{category.name}</span>
                      <span className="text-sm font-medium text-white">{formatAmount(category.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">Financial Health Summary</h3>
          <p className="text-slate-500 text-sm mt-0.5">Your overall financial snapshot</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Wallet className="w-4 h-4" />
              Current Balance
            </div>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatAmount(balance)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              Total Income
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatAmount(totals.income)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <TrendingDown className="w-4 h-4" />
              Total Expenses
            </div>
            <p className="text-2xl font-bold text-rose-400">{formatAmount(totals.expense)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <PiggyBank className="w-4 h-4" />
              Total Savings
            </div>
            <p className="text-2xl font-bold text-indigo-400">{formatAmount(totals.savings)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
