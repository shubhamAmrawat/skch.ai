import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'success';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  createdAt: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

const ICONS = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
} as const;

const STYLES = {
  error: {
    accent: 'bg-rose-500',
    bg: 'bg-white/95 backdrop-blur-md border-rose-200',
    text: 'text-rose-800',
    icon: 'text-rose-500',
  },
  warning: {
    accent: 'bg-amber-500',
    bg: 'bg-white/95 backdrop-blur-md border-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-500',
  },
  success: {
    accent: 'bg-emerald-500',
    bg: 'bg-white/95 backdrop-blur-md border-emerald-200',
    text: 'text-emerald-800',
    icon: 'text-emerald-500',
  },
} as const;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const { type, message, id } = toast;
  const Icon = ICONS[type];
  const style = STYLES[type];

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 pl-5 pr-3 py-3 rounded-2xl border shadow-lg shadow-slate-200/50
        min-w-[280px] max-w-[420px] animate-toast-in
        ${style.bg}
      `}
    >
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-l-2xl ${style.accent}`}
        aria-hidden
      />
      <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <p className={`flex-1 text-sm font-medium ${style.text} leading-relaxed`}>
        {message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const t = timeoutRefs.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = { id, type, message, duration, createdAt: Date.now() };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const t = setTimeout(() => {
          removeToast(id);
          timeoutRefs.current.delete(id);
        }, duration);
        timeoutRefs.current.set(id, t);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    setToastInstance({ toasts, addToast, removeToast });
    return () => setToastInstance(null);
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <div className="flex flex-col gap-3 pointer-events-auto">
          {toasts.map((t) => (
            <div key={t.id} className="relative">
              <ToastItem toast={t} onDismiss={removeToast} />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

/** Imperative API for use outside React (e.g. in catch blocks). Call initToast() first from App. */
let toastInstance: ToastContextValue | null = null;

export function setToastInstance(instance: ToastContextValue | null) {
  toastInstance = instance;
}

export const toast = {
  error: (message: string, duration?: number) =>
    toastInstance?.addToast('error', message, duration),
  warning: (message: string, duration?: number) =>
    toastInstance?.addToast('warning', message, duration),
  success: (message: string, duration?: number) =>
    toastInstance?.addToast('success', message, duration),
};
