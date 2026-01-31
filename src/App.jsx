import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyOverviewChart />
        <ExpenseBreakdownChart />
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <p className="text-slate-500 text-sm mt-0.5">Your latest financial activity</p>
          </div>
          <a href="/transactions" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View All →
          </a>
        </div>
        <TransactionList limit={5} />
      </div>
    </div>
  );
};

// Layout Component with dynamic sidebar width
const AppLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <main className="min-h-screen p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={
                <div className="text-white">
                  <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                  <p className="text-slate-500 mt-1 text-sm">Coming Soon</p>
                </div>
              } />
              <Route path="/analytics" element={
                <div className="text-white">
                  <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                  <p className="text-slate-500 mt-1 text-sm">Coming Soon</p>
                </div>
              } />
              <Route path="/settings" element={
                <div className="text-white">
                  <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                  <p className="text-slate-500 mt-1 text-sm">Coming Soon</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <FinanceProvider>
      <SidebarProvider>
        <Router>
          <AppLayout />
        </Router>
      </SidebarProvider>
    </FinanceProvider>
  );
}

export default App;
