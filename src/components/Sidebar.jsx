import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Wallet, LogOut, ChevronLeft, ChevronRight, Settings, RefreshCw, X, Sparkles } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/LanguageContext';
import ConfirmDialog from './ui/ConfirmDialog';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobile, isMobileOpen, closeMobileSidebar, isAiPanelOpen, toggleAiPanel } = useSidebar();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Nav items with translations
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('common.dashboard') },
    { path: '/transactions', icon: Receipt, label: t('common.transactions') },
    { path: '/recurring', icon: RefreshCw, label: t('common.recurring') },
    { path: '/analytics', icon: PieChart, label: t('common.analytics') },
    { path: '/settings', icon: Settings, label: t('common.settings') },
  ];

  // Get user display name and initials
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setShowLogoutDialog(false);
      navigate('/login', { state: { loggedOut: true } });
    } catch (error) {
      addToast(t('toast.logoutError'), 'error');
      setIsLoggingOut(false);
    }
  };

  // On mobile, the sidebar is an overlay drawer
  const showSidebar = isMobile ? isMobileOpen : true;
  const sidebarExpanded = isMobile ? true : !isCollapsed; // Always expanded when mobile drawer is open

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-screen bg-[#0d0d12] border-r border-white/[0.06] flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isMobile 
            ? `w-72 px-4 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : isCollapsed ? 'w-20 px-3' : 'w-64 px-4'
        }`}
      >
        {/* Logo Section */}
        <div className={`h-16 flex items-center border-b border-white/[0.04] ${!sidebarExpanded ? 'justify-center' : ''}`}>
          <div className={`flex items-center ${!sidebarExpanded ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-[18px] h-[18px] text-white" />
              </div>
            </div>
            {sidebarExpanded && (
              <div className="flex-1">
                <span className="text-base font-semibold text-white tracking-tight">Xpensio</span>
              </div>
            )}
            {/* Close button for mobile */}
            {isMobile && isMobileOpen && (
              <button
                onClick={closeMobileSidebar}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Button - desktop only */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 w-6 h-6 bg-[#0d0d12] border border-white/[0.1] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-white/[0.2] transition-all duration-200 z-10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {sidebarExpanded && (
            <p className="px-4 mb-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t('common.menu')}</p>
          )}
          <ul className="space-y-1.5">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={isMobile ? closeMobileSidebar : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg transition-all duration-150 ${
                      !sidebarExpanded 
                        ? 'h-11 justify-center' 
                        : 'h-11 px-4'
                    } ${
                      isActive
                        ? 'bg-indigo-500/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                      }`} />
                      {sidebarExpanded && (
                        <>
                          <span className="text-sm font-medium">{label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          )}
                        </>
                      )}
                      {/* Tooltip for collapsed state - desktop only */}
                      {!isMobile && isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1e1e28] text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl z-50">
                          {label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* AI Assistant Button */}
        <div className="px-1 pb-3">
          <button
            onClick={() => {
              toggleAiPanel();
              if (isMobile) closeMobileSidebar();
            }}
            className={`group relative flex items-center gap-3 w-full rounded-xl transition-all duration-200 ${
              !sidebarExpanded 
                ? 'h-11 justify-center' 
                : 'h-11 px-4'
            } ${
              isAiPanelOpen
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className={`w-5 h-5 flex-shrink-0 ${
              isAiPanelOpen ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'
            }`} />
            {sidebarExpanded && (
              <>
                <span className="text-sm font-medium">AI Assistant</span>
                <div className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                  isAiPanelOpen 
                    ? 'bg-indigo-500/30 text-indigo-300' 
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  ⌘/
                </div>
              </>
            )}
            {/* Tooltip for collapsed state */}
            {!isMobile && isCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1e1e28] text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl z-50">
                AI Assistant
              </div>
            )}
          </button>
        </div>

        {/* User Profile Section */}
        <div className="py-4 border-t border-white/[0.04]">
          <div className={`flex items-center ${!sidebarExpanded ? 'justify-center' : 'gap-3'}`}>
            <div className="relative flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d0d12]" />
              {/* Logout tooltip for collapsed state - desktop only */}
              {!isMobile && isCollapsed && (
                <button 
                  onClick={handleLogoutClick}
                  className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1e1e28] text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl z-50 hover:bg-red-500/20 hover:text-red-400"
                >
                  {t('common.logout')}
                </button>
              )}
            </div>
            {sidebarExpanded && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogoutClick}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                  title={t('common.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={handleLogoutConfirm}
          title={t('common.logout')}
          message={t('auth.logoutConfirmMessage')}
          confirmLabel={t('common.logout')}
          cancelLabel={t('common.cancel')}
          confirmVariant="danger"
          isLoading={isLoggingOut}
          icon={LogOut}
        />
      </aside>
    </>
  );
};

export default Sidebar;
