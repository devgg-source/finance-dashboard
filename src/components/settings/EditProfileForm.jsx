import { useState, useEffect } from 'react';
import { User, Mail, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';
import { authService } from '../../services/supabase';
import Button from '../ui/Button';

const EditProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original values for comparison
  const originalName = user?.user_metadata?.full_name || '';
  const originalEmail = user?.email || '';

  // Initialize form with user data
  useEffect(() => {
    setDisplayName(originalName);
    setEmail(originalEmail);
  }, [originalName, originalEmail]);

  // Check if there are changes
  useEffect(() => {
    const nameChanged = displayName.trim() !== originalName;
    const emailChanged = email.trim() !== originalEmail;
    setHasChanges(nameChanged || emailChanged);
  }, [displayName, email, originalName, originalEmail]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) {
      toast.info(t('settings.noChanges'));
      return;
    }

    // Validation
    if (!displayName.trim()) {
      toast.error(t('settings.nameRequired'));
      return;
    }

    if (!email.trim()) {
      toast.error(t('settings.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('settings.invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const nameChanged = displayName.trim() !== originalName;
      const emailChanged = email.trim() !== originalEmail;

      // Update display name if changed
      if (nameChanged) {
        await authService.updateProfile({ full_name: displayName.trim() });
      }

      // Update email if changed (requires confirmation)
      if (emailChanged) {
        await authService.updateEmail(email.trim());
        toast.success(t('settings.emailConfirmSent'));
      } else if (nameChanged) {
        toast.success(t('settings.profileUpdated'));
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || t('settings.profileUpdateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
      <h3 className="text-lg font-semibold text-white mb-6">{t('settings.profile')}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {getInitials(displayName || originalName)}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {t('settings.displayName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('settings.yourName')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {t('settings.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                {t('settings.emailChangeNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-slate-600">
            {t('settings.memberSince')} {user?.created_at 
              ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
              : 'N/A'}
          </p>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!hasChanges || isSubmitting}
            icon={hasChanges ? Check : null}
          >
            {isSubmitting ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
