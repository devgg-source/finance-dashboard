import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { monthlyData } from '../data/mockData';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 shadow-2xl backdrop-blur-sm">
        <p className="text-white font-semibold mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 text-sm">{entry.name}:</span>
              <span className="text-white text-sm font-medium">₹{entry.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 text-xs font-medium capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Area Chart for monthly overview
export const MonthlyOverviewChart = () => {
  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Monthly Overview</h3>
          <p className="text-slate-500 text-sm mt-0.5">Income vs Expenses trend</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value/1000}k`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGradient)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="savings" stroke="#6366f1" fill="url(#savingsGradient)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Pie Chart for expense breakdown
export const ExpenseBreakdownChart = () => {
  const { expensesByCategory } = useFinance();

  // Calculate total for percentage
  const total = expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Expense Breakdown</h3>
          <p className="text-slate-500 text-sm mt-0.5">By category this month</p>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-500/10">
          <PieChartIcon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="h-56 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{ 
                  backgroundColor: '#1a1a24', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="space-y-3">
          {expensesByCategory.map((category, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{category.name}</p>
                <p className="text-xs text-slate-500">
                  {((category.value / total) * 100).toFixed(0)}% • ₹{category.value.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
