import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast types with their configurations
const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-950',
    borderColor: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-rose-950',
    borderColor: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-300'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-950',
    borderColor: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300'
  },
  info: {
    icon: Info,
    bgColor: 'bg-indigo-950',
    borderColor: 'border-indigo-500/40',
    iconColor: 'text-indigo-400',
    titleColor: 'text-indigo-300'
  }
};

// Individual Toast Component
const Toast = ({ id, type, title, message, onClose }) => {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgColor} ${config.borderColor} shadow-2xl animate-slide-in`}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.titleColor}`}>{title}</p>
        {message && (
          <p className="text-slate-300 text-sm mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((title, message) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title, message) => {
    return addToast({ type: 'error', title, message, duration: 6000 }); // Errors stay longer
  }, [addToast]);

  const warning = useCallback((title, message) => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title, message) => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
