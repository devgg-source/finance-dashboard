import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/supabase';
import Button from '../ui/Button';

const ChangePasswordForm = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await authService.updatePassword(formData.newPassword);
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to change password', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Reusable password input component
  const PasswordInput = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border rounded-xl text-white text-sm focus:outline-none transition-all ${
            errors[field] 
              ? 'border-rose-500/50 focus:border-rose-500/50' 
              : 'border-white/[0.06] focus:border-indigo-500/50'
          }`}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[field] && (
        <p className="mt-1 text-xs text-rose-400">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
      <h3 className="text-lg font-semibold text-white mb-2">Change Password</h3>
      <p className="text-slate-500 text-sm mb-6">Update your password to keep your account secure</p>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PasswordInput 
          field="currentPassword" 
          label="Current Password" 
          placeholder="Enter current password" 
        />
        
        <PasswordInput 
          field="newPassword" 
          label="New Password" 
          placeholder="Enter new password" 
        />
        
        <PasswordInput 
          field="confirmPassword" 
          label="Confirm New Password" 
          placeholder="Confirm new password" 
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
