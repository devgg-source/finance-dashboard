import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

// Configuration constants
const MAX_TOASTS = 5; // Maximum visible toasts (avoid screen overflow)
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

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

// Generate unique ID (more robust than Date.now())
let toastIdCounter = 0;
const generateId = () => `toast-${++toastIdCounter}-${Date.now()}`;

// Individual Toast Component with pause-on-hover
const Toast = ({ id, type, title, message, duration, onClose, onPause, onResume }) => {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => onClose(id), 200);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgColor} ${config.borderColor} shadow-2xl 
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
        transition-all duration-200`}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => onPause(id)}
      onMouseLeave={() => onResume(id)}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.titleColor}`}>{title}</p>
        {message && (
          <p className="text-slate-300 text-sm mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast, pauseToast, resumeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={removeToast}
            onPause={pauseToast}
            onResume={resumeToast}
          />
        </div>
      ))}
    </div>
  );
};

// Toast Provider with advanced queue management
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [queue, setQueue] = useState([]); // Queue for overflow toasts
  const timersRef = useRef(new Map()); // Track timers for pause/resume
  const pausedRef = useRef(new Map()); // Track remaining time when paused

  // Process queue when space becomes available
  useEffect(() => {
    if (queue.length > 0 && toasts.length < MAX_TOASTS) {
      const [nextToast, ...remainingQueue] = queue;
      setQueue(remainingQueue);
      showToast(nextToast);
    }
  }, [toasts.length, queue]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const showToast = useCallback((toastData) => {
    const { id, duration } = toastData;
    
    setToasts((prev) => [...prev, toastData]);

    // Set up auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
      pausedRef.current.set(id, { remaining: duration, startTime: Date.now() });
    }
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = DEFAULT_DURATION, dedupe = false }) => {
    const id = generateId();
    const toastData = { id, type, title, message, duration };

    // Duplicate prevention: check if same title+message exists
    if (dedupe) {
      const isDuplicate = toasts.some(
        (t) => t.title === title && t.message === message && t.type === type
      );
      if (isDuplicate) {
        return null; // Don't add duplicate
      }
    }

    // If at max capacity, queue the toast
    if (toasts.length >= MAX_TOASTS) {
      setQueue((prev) => [...prev, toastData]);
      return id;
    }

    showToast(toastData);
    return id;
  }, [toasts, showToast]);

  const removeToast = useCallback((id) => {
    // Clear timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    pausedRef.current.delete(id);

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Pause timer on hover
  const pauseToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    const pauseData = pausedRef.current.get(id);
    
    if (timer && pauseData) {
      clearTimeout(timer);
      timersRef.current.delete(id);
      
      // Calculate remaining time
      const elapsed = Date.now() - pauseData.startTime;
      const remaining = Math.max(pauseData.remaining - elapsed, 1000);
      pausedRef.current.set(id, { remaining, paused: true });
    }
  }, []);

  // Resume timer on mouse leave
  const resumeToast = useCallback((id) => {
    const pauseData = pausedRef.current.get(id);
    
    if (pauseData && pauseData.paused) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, pauseData.remaining);
      
      timersRef.current.set(id, timer);
      pausedRef.current.set(id, { 
        remaining: pauseData.remaining, 
        startTime: Date.now(),
        paused: false 
      });
    }
  }, [removeToast]);

  // Clear all toasts
  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    pausedRef.current.clear();
    setToasts([]);
    setQueue([]);
  }, []);

  // Convenience methods with deduplication option
  const success = useCallback((title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title, message, options = {}) => {
    return addToast({ type: 'error', title, message, duration: ERROR_DURATION, ...options });
  }, [addToast]);

  const warning = useCallback((title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  // Promise-based toast (useful for async operations)
  const promise = useCallback(async (promiseFn, { loading, success: successMsg, error: errorMsg }) => {
    const id = addToast({ type: 'info', title: loading, duration: 0 }); // No auto-dismiss
    
    try {
      const result = await promiseFn();
      removeToast(id);
      addToast({ type: 'success', title: successMsg });
      return result;
    } catch (err) {
      removeToast(id);
      addToast({ type: 'error', title: errorMsg, message: err.message, duration: ERROR_DURATION });
      throw err;
    }
  }, [addToast, removeToast]);

  const value = {
    toasts,
    queue,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    promise
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast}
        pauseToast={pauseToast}
        resumeToast={resumeToast}
      />
    </ToastContext.Provider>
  );
};
