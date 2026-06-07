'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="toast-message-content">{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        .toast-message-content {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .toast-close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          padding: 0.25rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .toast-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #64748b;
        }

        @media (min-width: 640px) {
          .toast-message-content {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .toast-message-content {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
