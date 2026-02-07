import { useState } from 'react';
import { 
  // Bell, 
  // Shield, 
  // Globe, 
  // CreditCard,
  Download,
  Trash2,
  // ChevronRight,
  // Moon,
  // Sun,
  // Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import EditProfileForm from '../components/settings/EditProfileForm';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import AppearanceForm from '../components/settings/AppearanceForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';

const SettingsPage = () => {
  const { user } = useAuth();
  const { transactions, clearAllData } = useFinance();
  const toast = useToast();

  // State
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get display name for export
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  /* TODO: Implement these features in future versions
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
  */

  // Export transactions as JSON
  const handleExportData = async () => {
    if (transactions.length === 0) {
      toast.warning('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        user: {
          email: user?.email,
          name: displayName
        },
        transactions: transactions.map(t => ({
          type: t.type,
          category: t.category,
          description: t.description,
          amount: t.amount,
          date: t.date
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Delete all user data
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeletingData(true);
    try {
      await clearAllData();
      toast.success('All data deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete data');
    } finally {
      setIsDeletingData(false);
    }
  };

  /* TODO: Implement Toggle components in future versions
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
  */

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Section - TODO: Implement profile update
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-6">Profile</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600">Email cannot be changed. Contact support for assistance.</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-slate-600">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
          <button 
            disabled={isSavingProfile}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
      */}

      {/* Profile Section */}
      <EditProfileForm />

      {/* Change Password Section */}
      <ChangePasswordForm />

      {/* Appearance Section */}
      <AppearanceForm />

      {/* TODO: Notifications Section - Implement notification system
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
      */}

      {/* TODO: Privacy & Security Section - Implement 2FA and connected accounts
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
      */}

      {/* Data Management Section */}
      <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-2">Data Management</h3>
        <p className="text-slate-500 text-sm mb-6">Export or delete your data</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExportData}
            isLoading={isExporting}
            variant="secondary"
            icon={Download}
          >
            Export All Data
          </Button>
          <Button 
            onClick={handleDeleteClick}
            variant="danger"
            icon={Trash2}
          >
            Delete All Data
          </Button>
        </div>
      </div>

      {/* Delete Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete All Data"
        message="Are you sure you want to delete all your transaction data? This action cannot be undone and all your financial records will be permanently removed."
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isLoading={isDeletingData}
        icon={Trash2}
      />

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-slate-600 text-sm">Finance Dashboard v2.0.0</p>
        <p className="text-slate-600 text-xs mt-1">Made with ❤️ for portfolio</p>
      </div>
    </div>
  );
};

export default SettingsPage;
