import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TransactionList from './components/TransactionList';
import { MonthlyOverviewChart, ExpenseBreakdownChart } from './components/Charts';
import { useFinance } from './context/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import './index.css';

// Dashboard Page Component
const Dashboard = () => {
  const { totals, balance } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={balance}
          icon={Wallet}
          trend="up"
          trendValue={12}
          color="primary"
        />
        <StatCard
          title="Total Income"
          amount={totals.income}
          icon={TrendingUp}
          trend="up"
          trendValue={8}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          amount={totals.expense}
          icon={TrendingDown}
          trend="down"
          trendValue={5}
          color="red"
        />
        <StatCard
          title="Total Savings"
          amount={totals.savings}
          icon={PiggyBank}
          trend="up"
          trendValue={15}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyOverviewChart />
        <ExpenseBreakdownChart />
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <a href="/transactions" className="text-sky-400 hover:text-sky-300 text-sm">View All</a>
        </div>
        <TransactionList limit={5} />
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <FinanceProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Sidebar />
          <main className="ml-64 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<div className="text-white">Transactions Page (Coming Soon)</div>} />
              <Route path="/analytics" element={<div className="text-white">Analytics Page (Coming Soon)</div>} />
              <Route path="/settings" element={<div className="text-white">Settings Page (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  );
}

export default App;
