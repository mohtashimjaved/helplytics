'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, HelpCircle, X } from 'lucide-react';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    setDialog({ ...options, type: 'confirm' });
    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  }, []);

  const alert = useCallback((options: DialogOptions): Promise<void> => {
    setDialog({ ...options, type: 'alert' });
    return new Promise((resolve) => {
      setResolver({ resolve: () => resolve() });
    });
  }, []);

  const handleConfirm = () => {
    resolver?.resolve(true);
    setDialog(null);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.resolve(false);
    setDialog(null);
    setResolver(null);
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog && (
        <div className="dialog-overlay">
          <div className="dialog-card glass-card">
            <div className="dialog-icon">
              {dialog.type === 'confirm' ? (
                <HelpCircle size={32} className="text-warning" />
              ) : (
                <AlertCircle size={32} className="text-primary" />
              )}
            </div>
            <h2 className="dialog-title">{dialog.title}</h2>
            <p className="dialog-message">{dialog.message}</p>
            <div className="dialog-actions">
              {dialog.type === 'confirm' && (
                <button className="btn btn-secondary" onClick={handleCancel}>
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}
              <button 
                className={`btn ${dialog.type === 'confirm' ? 'btn-danger' : 'btn-primary'}`} 
                onClick={handleConfirm}
              >
                {dialog.confirmText || (dialog.type === 'confirm' ? 'Confirm' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .dialog-card {
          width: 100%;
          max-width: 450px;
          padding: 1.5rem;
          background: white;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0,0,0,0.15);
          animation: dialogIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        @keyframes dialogIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .dialog-icon {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .dialog-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }
        
        .dialog-message {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        
        .dialog-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-direction: column;
        }
        
        .dialog-actions .btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
        }

        @media (min-width: 480px) {
          .dialog-overlay {
            padding: 2rem;
          }
          .dialog-card {
            padding: 2.5rem;
          }
          .dialog-title {
            font-size: 1.75rem;
          }
          .dialog-message {
            font-size: 1.05rem;
            margin-bottom: 2.5rem;
          }
          .dialog-actions {
            flex-direction: row;
          }
          .dialog-actions .btn {
            width: auto;
            min-width: 120px;
          }
        }

        .btn-danger {
          background: var(--danger);
          color: white;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
        }
        
        .btn-danger:hover {
          background: #dc2626;
          transform: translateY(-4px);
        }

        .text-warning { color: var(--warning); }
        .text-primary { color: var(--primary); }
      `}</style>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
