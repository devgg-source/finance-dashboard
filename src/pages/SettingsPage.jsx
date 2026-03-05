import { useState } from 'react';
import { 
  // Bell, 
  // Shield, 
  // Globe, 
  // CreditCard,
  Download,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  // ChevronRight,
  // Moon,
  // Sun,
  // Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/LanguageContext';
import EditProfileForm from '../components/settings/EditProfileForm';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import AppearanceForm from '../components/settings/AppearanceForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';

const SettingsPage = () => {
  const { user } = useAuth();
  const { transactions, clearAllData } = useFinance();
  const toast = useToast();
  const { t } = useTranslation();

  // State
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

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

  // Export transactions as CSV or Excel
  const handleExportData = async () => {
    if (transactions.length === 0) {
      toast.warning(t('settings.noDataToExport'));
      return;
    }

    setIsExporting(true);
    try {
      const rows = transactions.map(t => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        Description: t.description || '',
        Amount: t.amount
      }));

      const dateStr = new Date().toISOString().split('T')[0];

      if (exportFormat === 'csv') {
        // CSV export
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const csvRows = [
          headers.join(','),
          ...rows.map(row =>
            headers.map(h => {
              const val = String(row[h] ?? '');
              // Escape values containing commas, quotes, or newlines
              return val.includes(',') || val.includes('"') || val.includes('\n')
                ? `"${val.replace(/"/g, '""')}"`
                : val;
            }).join(',')
          )
        ];
        // BOM for proper UTF-8 in Excel
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xpensio-transactions-${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Excel export
        const ws = XLSX.utils.json_to_sheet(rows);
        // Set column widths
        ws['!cols'] = [
          { wch: 12 }, // Date
          { wch: 10 }, // Type
          { wch: 16 }, // Category
          { wch: 30 }, // Description
          { wch: 12 }, // Amount
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `xpensio-transactions-${dateStr}.xlsx`);
      }

      toast.success(t('settings.dataExported'));
    } catch (error) {
      toast.error(t('settings.exportFailed'));
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
      toast.success(t('settings.dataDeleted'));
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(t('settings.deleteFailed'));
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
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('settings.title')}</h1>
        <p className="text-slate-500 mt-1 text-sm">{t('settings.subtitle')}</p>
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
        <h3 className="text-lg font-semibold text-white mb-2">{t('settings.dataManagement')}</h3>
        <p className="text-slate-500 text-sm mb-6">{t('settings.exportOrDelete')}</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Export with format selector */}
          <div className="flex items-stretch">
            <Button 
              onClick={handleExportData}
              isLoading={isExporting}
              variant="secondary"
              icon={FileSpreadsheet}
              className="!rounded-r-none border-r-0"
            >
              {t('settings.exportAs')} {exportFormat.toUpperCase()}
            </Button>
            <div className="relative">
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="h-full px-2.5 bg-white/[0.06] border border-white/[0.08] border-l-0 rounded-r-xl text-slate-400 hover:bg-white/[0.1] hover:text-white transition-colors flex items-center"
              >
                <ChevronDown size={16} className={`transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showFormatDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFormatDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a2e] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl shadow-black/40 min-w-[140px]">
                    <button
                      onClick={() => { setExportFormat('csv'); setShowFormatDropdown(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors ${exportFormat === 'csv' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-white/[0.06]'}`}
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() => { setExportFormat('excel'); setShowFormatDropdown(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors ${exportFormat === 'excel' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-white/[0.06]'}`}
                    >
                      <FileSpreadsheet size={14} />
                      Excel (.xlsx)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button 
            onClick={handleDeleteClick}
            variant="danger"
            icon={Trash2}
          >
            {t('settings.deleteData')}
          </Button>
        </div>
      </div>

      {/* Delete Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t('settings.deleteData')}
        message={t('settings.deleteConfirmMessage')}
        confirmLabel={t('settings.deleteAll')}
        cancelLabel={t('common.cancel')}
        confirmVariant="danger"
        isLoading={isDeletingData}
        icon={Trash2}
      />

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-slate-600 text-sm">Xpensio v2.2.0</p>
        <p className="text-slate-600 text-xs mt-1">Made with ❤️ for portfolio</p>
      </div>
    </div>
  );
};

export default SettingsPage;
