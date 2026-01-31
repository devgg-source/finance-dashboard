import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Check,
  Camera
} from 'lucide-react';

const SettingsPage = () => {
  // Settings state
  const [settings, setSettings] = useState({
    theme: 'dark',
    currency: 'INR',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      weekly: true,
      monthly: false
    },
    privacy: {
      showBalance: true,
      twoFactor: false
    }
  });

  // Notification toggle handler
  const toggleNotification = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  // Privacy toggle handler
  const togglePrivacy = (key) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-indigo-500' : 'bg-white/[0.08]'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Setting Row Component
  const SettingRow = ({ icon: Icon, title, description, action, last = false }) => (
    <div className={`flex items-center justify-between py-4 ${!last ? 'border-b border-white/[0.06]' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-6">Profile</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">JD</span>
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.06] flex justify-end">
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
        
        {/* Theme Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Globe }
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  settings.theme === theme.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.1]'
                }`}
              >
                <theme.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{theme.label}</span>
                {settings.theme === theme.id && (
                  <Check className="w-4 h-4 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Currency & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
        <p className="text-slate-500 text-sm mb-6">Manage how you receive notifications</p>
        
        <div>
          <SettingRow
            icon={Bell}
            title="Email Notifications"
            description="Receive transaction updates via email"
            action={
              <ToggleSwitch 
                enabled={settings.notifications.email} 
                onChange={() => toggleNotification('email')} 
              />
            }
          />
          <SettingRow
            icon={Bell}
            title="Push Notifications"
            description="Get instant alerts on your device"
            action={
              <ToggleSwitch 
                enabled={settings.notifications.push} 
                onChange={() => toggleNotification('push')} 
              />
            }
          />
          <SettingRow
            icon={Bell}
            title="Weekly Summary"
            description="Receive a weekly financial summary"
            action={
              <ToggleSwitch 
                enabled={settings.notifications.weekly} 
                onChange={() => toggleNotification('weekly')} 
              />
            }
          />
          <SettingRow
            icon={Bell}
            title="Monthly Reports"
            description="Get detailed monthly financial reports"
            action={
              <ToggleSwitch 
                enabled={settings.notifications.monthly} 
                onChange={() => toggleNotification('monthly')} 
              />
            }
            last
          />
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-2">Privacy & Security</h3>
        <p className="text-slate-500 text-sm mb-6">Protect your account and data</p>
        
        <div>
          <SettingRow
            icon={Shield}
            title="Show Balance on Dashboard"
            description="Display your current balance prominently"
            action={
              <ToggleSwitch 
                enabled={settings.privacy.showBalance} 
                onChange={() => togglePrivacy('showBalance')} 
              />
            }
          />
          <SettingRow
            icon={Shield}
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            action={
              <ToggleSwitch 
                enabled={settings.privacy.twoFactor} 
                onChange={() => togglePrivacy('twoFactor')} 
              />
            }
          />
          <SettingRow
            icon={CreditCard}
            title="Connected Accounts"
            description="Manage linked bank accounts"
            action={
              <button className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                <span className="text-sm">Manage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            }
            last
          />
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-2">Data Management</h3>
        <p className="text-slate-500 text-sm mb-6">Export or delete your data</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export All Data
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-slate-600 text-sm">Finance Dashboard v1.0.0</p>
        <p className="text-slate-600 text-xs mt-1">Made with ❤️ for portfolio</p>
      </div>
    </div>
  );
};

export default SettingsPage;
