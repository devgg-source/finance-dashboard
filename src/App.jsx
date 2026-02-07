import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TransactionList from './components/TransactionList';
import { useFinance } from './context/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import './index.css';

// Lazy load pages and heavy components
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Charts = lazy(() => import('./components/Charts').then(module => ({
  default: () => (
    <>
      <module.MonthlyOverviewChart />
      <module.ExpenseBreakdownChart />
    </>
  )
})));

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Page Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm">Loading page...</p>
    </div>
  </div>
);

// Full Screen Loading (for auth check)
const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Page Component
const Dashboard = () => {
  const { totals, balance, monthlyTrends, isLoading } = useFinance();

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
          trend={monthlyTrends.balance.direction}
          trendValue={monthlyTrends.balance.value}
          color="primary"
        />
        <StatCard
          title="Total Income"
          amount={totals.income}
          icon={TrendingUp}
          trend={monthlyTrends.income.direction}
          trendValue={monthlyTrends.income.value}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          amount={totals.expense}
          icon={TrendingDown}
          trend={monthlyTrends.expense.direction}
          trendValue={monthlyTrends.expense.value}
          color="red"
        />
        <StatCard
          title="Total Savings"
          amount={totals.savings}
          icon={PiggyBank}
          trend={monthlyTrends.savings.direction}
          trendValue={monthlyTrends.savings.value}
          color="orange"
        />
      </div>

      {/* Charts - Lazy loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={
          <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] h-[340px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        }>
          <Charts />
        </Suspense>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <p className="text-slate-500 text-sm mt-0.5">Your latest financial activity</p>
          </div>
          <Link to="/transactions" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View All →
          </Link>
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <FinanceProvider>
                    <SidebarProvider>
                      <AppLayout />
                    </SidebarProvider>
                  </FinanceProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
