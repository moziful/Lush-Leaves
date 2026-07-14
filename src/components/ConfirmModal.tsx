"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiX } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmModalProps) {
  const confirmClass =
    variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-600 shadow-md"
      : "bg-forest text-white hover:bg-forest-dark shadow-md shadow-forest/15";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-forest-dark/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm bg-cream rounded-2xl shadow-2xl border border-sage/20 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-full bg-white/80 p-1.5 text-forest/60 hover:text-forest hover:bg-white transition-all cursor-pointer"
            >
              <FiX className="h-4 w-4" />
            </button>

            <div className="p-6 space-y-5">
              {/* Icon + Title */}
              <div className="flex items-start gap-3.5 pr-6">
                <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                  variant === "danger" ? "bg-red-50 text-red-500" : "bg-forest/10 text-forest"
                }`}>
                  <FiAlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-forest-dark">{title}</h3>
                  <p className="text-xs text-forest-dark/60 leading-relaxed">{message}</p>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-sage/15" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-bold text-forest-dark/70 bg-white border border-sage/20 rounded-xl hover:bg-slate-50 hover:text-forest-dark transition-all cursor-pointer active:scale-[0.97]"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.97] ${confirmClass}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
