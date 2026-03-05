import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { FinanceProvider } from './context/FinanceContext';
import { RecurringProvider } from './context/RecurringContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import TransactionList from './components/TransactionList';
import CopilotProvider from './components/CopilotProvider';
import AIChatPanel from './components/AIChatPanel';
import { useFinance } from './context/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2, Menu, Sparkles } from 'lucide-react';
import Loader from './components/ui/Loader';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
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
const AIInsights = lazy(() => import('./components/AIInsights'));
const RecurringPage = lazy(() => import('./pages/RecurringPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <Loader fullscreen />;
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
    return <Loader fullscreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Page Component
const Dashboard = () => {
  const { totals, balance, monthlyTrends, isLoading } = useFinance();
  const { t } = useTranslation();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-slate-500 mt-1 text-sm">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalBalance')}
          amount={balance}
          icon={Wallet}
          trend={monthlyTrends.balance.direction}
          trendValue={monthlyTrends.balance.value}
          color="primary"
        />
        <StatCard
          title={t('dashboard.totalIncome')}
          amount={totals.income}
          icon={TrendingUp}
          trend={monthlyTrends.income.direction}
          trendValue={monthlyTrends.income.value}
          color="green"
        />
        <StatCard
          title={t('dashboard.totalExpenses')}
          amount={totals.expense}
          icon={TrendingDown}
          trend={monthlyTrends.expense.direction}
          trendValue={monthlyTrends.expense.value}
          color="red"
        />
        <StatCard
          title={t('dashboard.totalSavings')}
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

      {/* AI Insights Section */}
      <Suspense fallback={
        <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] h-[200px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      }>
        <AIInsights />
      </Suspense>

      {/* Recent Transactions */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{t('dashboard.recentTransactions')}</h3>
            <p className="text-slate-500 text-sm mt-0.5">{t('dashboard.latestActivity')}</p>
          </div>
          <Link to="/transactions" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            {t('common.viewAll')} →
          </Link>
        </div>
        <TransactionList limit={5} />
      </div>
    </div>
  );
};

// Layout Component with dynamic sidebar width
const AppLayout = () => {
  const { isCollapsed, isMobile, setIsMobileOpen, isAiPanelOpen, toggleAiPanel } = useSidebar();
  const [isLargeDesktop, setIsLargeDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      {/* Mobile Top Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#0d0d12] border-b border-white/[0.06] flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">Xpensio</span>
            </div>
          </div>
          <button
            onClick={toggleAiPanel}
            className={`p-2 rounded-lg transition-colors ${
              isAiPanelOpen
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </header>
      )}

      <div 
        className={`transition-all duration-300 ease-in-out ${
          isMobile 
            ? 'pl-0 pt-14'
            : isCollapsed ? 'pl-20' : 'pl-64'
        }`}
        style={{
          paddingRight: isLargeDesktop && isAiPanelOpen ? '400px' : '0',
        }}
      >
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          <Suspense fallback={<Loader size="lg" />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/recurring" element={<RecurringPage />} />
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
    <LanguageProvider>
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <PWAUpdatePrompt />
            <PWAInstallPrompt />
            <Router>
              <Suspense fallback={<Loader fullscreen />}>
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
                      <CopilotKit publicApiKey={import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY} showDevConsole={false}>
                        <FinanceProvider>
                          <RecurringProvider>
                            <CopilotProvider>
                              <SidebarProvider>
                                <AppLayout />
                                <AIChatPanel />
                              </SidebarProvider>
                            </CopilotProvider>
                          </RecurringProvider>
                        </FinanceProvider>
                      </CopilotKit>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}

export default App;
