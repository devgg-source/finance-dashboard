import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const toast = useToast();
  const hasShownLogoutToast = useRef(false);

  // Show logout success message if redirected from logout
  useEffect(() => {
    if (location.state?.loggedOut && !hasShownLogoutToast.current) {
      hasShownLogoutToast.current = true;
      toast.success('Logged out successfully');
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast.error('Login failed', error.message || 'Invalid email or password');
      setIsLoading(false);
      return;
    }
    
    toast.success('Welcome back!', 'You have successfully logged in');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <span className="text-2xl font-bold text-white">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to your Xpensio</p>
        </div>

        {/* Form */}
        <div className="bg-[#12121a] rounded-2xl p-5 sm:p-8 border border-white/[0.06]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.04] border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-rose-500/50 focus:ring-rose-500/20' 
                      : 'border-white/[0.06] focus:border-indigo-500/50 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-white/[0.04] border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-rose-500/50 focus:ring-rose-500/20' 
                      : 'border-white/[0.06] focus:border-indigo-500/50 focus:ring-indigo-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={!isLoading ? ArrowRight : undefined}
              iconPosition="right"
              fullWidth
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#12121a] text-slate-500">New to Xpensio?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/signup"
            className="w-full py-3 border border-white/[0.08] hover:border-white/[0.15] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-white/[0.02]"
          >
            Create an account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
