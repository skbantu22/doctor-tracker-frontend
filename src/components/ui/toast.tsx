"use client";

import { AlertCircle, Check, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => setToast({ id: Date.now(), message, tone }), []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // The context value is the stable `notify` callback, so consumers never re-render when a toast changes.
  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="toast-region">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
            <span className="toast-check">{toast.tone === "success" ? <Check size={14} /> : <AlertCircle size={14} />}</span>
            {toast.message}
            <button onClick={() => setToast(null)} aria-label="Dismiss"><X size={15} /></button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
