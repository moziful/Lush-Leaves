"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const icons = {
    success: <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <FiXCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    info: <FiInfo className="h-5 w-5 text-blue-600 shrink-0" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
  };

  const borderThemes = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-900 shadow-emerald-900/5",
    error: "border-rose-100 bg-rose-50 text-rose-900 shadow-rose-900/5",
    info: "border-blue-100 bg-blue-50 text-blue-900 shadow-blue-900/5",
    warning: "border-amber-100 bg-amber-50 text-amber-900 shadow-amber-900/5",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container: top-middle on mobile (under 640px), top-right on desktop (640px+) */}
      <div className="fixed z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm w-full px-4 top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-md transition-all duration-300 animate-slideIn ${
              borderThemes[toast.type]
            }`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
              title="Close Notification"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
