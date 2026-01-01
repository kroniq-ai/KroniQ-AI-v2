import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Glassmorphism toast styles
const toastStyles = `
  @keyframes toast-slide-in {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes toast-slide-out {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
  }
  
  .toast-enter {
    animation: toast-slide-in 0.3s ease-out forwards;
  }
`;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    description?: string,
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message, description, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    const iconClasses = "w-4 h-4";
    switch (type) {
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check className={`${iconClasses} text-white`} strokeWidth={3} />
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <X className={`${iconClasses} text-white`} strokeWidth={3} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'info':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Info className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
        );
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-600';
      case 'info':
        return 'bg-blue-600';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      <style>{toastStyles}</style>
      {children}

      {/* Toast Container - Top Center */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto toast-enter
              flex items-center gap-3 px-4 py-3 rounded-xl
              ${getBgColor(toast.type)}
              backdrop-blur-xl shadow-2xl
              border border-white/20
              min-w-[200px] max-w-md
            `}
          >
            {/* Icon */}
            {getIcon(toast.type)}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{toast.message}</p>
              {toast.description && (
                <p className="text-white/70 text-xs mt-0.5">{toast.description}</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => hideToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
