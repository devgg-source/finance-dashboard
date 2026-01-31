import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings, Wallet, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/analytics', icon: PieChart, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#0d0d12] border-r border-white/[0.06] flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className={`p-4 ${isCollapsed ? 'px-4' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-30" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-semibold text-white tracking-tight">FinanceApp</span>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Personal</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 w-6 h-6 bg-[#1a1a24] border border-white/[0.08] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#252530] transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4">
        {!isCollapsed && (
          <p className="px-4 mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
        )}
        <ul className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
                title={isCollapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25' 
                        : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium text-sm">{label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 mt-auto">
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/20">
                K
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d0d12]" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Karthik</p>
                  <p className="text-xs text-slate-500">Premium Plan</p>
                </div>
                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
