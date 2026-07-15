"use client";

import { useEffect } from "react";
import { FiX, FiClock, FiShoppingBag, FiActivity, FiTag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  plantId: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
  shippingCharge?: number;
  appliedPromo?: string | null;
  discount?: number;
}

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
  isAdmin?: boolean;
}

export default function OrderDetailModal({ order, onClose, onStatusUpdate, isAdmin = false }: OrderDetailModalProps) {
  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [order]);

  if (!order) return null;

  const statusColor = {
    Delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    Shipped: "bg-blue-50 text-blue-600 border border-blue-100",
    Processing: "bg-amber-50 text-amber-600 border border-amber-100",
    Pending: "bg-rose-50 text-rose-600 border border-rose-100",
  };

  const currentStatus = statusColor[order.status] || "bg-slate-50 text-slate-500";

  // Calculations
  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = typeof order.shippingCharge !== "undefined" ? order.shippingCharge : 15;
  const discountVal = order.discount || 0;

  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest-dark/45 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-cream rounded-3xl overflow-hidden shadow-2xl border border-sage/20 flex flex-col z-10 p-6 sm:p-8 space-y-5 max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-sage/15 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Profile</span>
                <h3 className="text-lg font-black text-forest-dark font-mono truncate max-w-[280px] sm:max-w-md">#{order._id}</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/90 p-2 text-forest/70 hover:bg-white hover:text-forest transition-all shadow-md cursor-pointer border border-sage/10"
              >
                <FiX className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Meta values */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-forest-dark">
              <div className="bg-white p-3.5 rounded-xl border border-sage/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1"><FiClock /> Ordered On</span>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-sage/10 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1"><FiActivity /> Delivery State</span>
                  <p className="mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${currentStatus}`}>
                      {order.status}
                    </span>
                  </p>
                </div>
                {isAdmin && onStatusUpdate && (
                  <div className="mt-2.5 pt-2.5 border-t border-sage/10 flex flex-wrap gap-1">
                    {["Pending", "Processing", "Shipped", "Delivered"].map((st) => (
                      <button
                        key={st}
                        onClick={() => onStatusUpdate(order._id, st as any)}
                        className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border transition cursor-pointer ${
                          order.status === st
                            ? "bg-forest text-white border-forest"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[180px] scrollbar-thin pr-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Purchased Botanical Items</span>
              <div className="divide-y divide-sage/10 bg-white rounded-2xl border border-sage/10 overflow-hidden">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center text-xs font-bold text-forest-dark hover:bg-cream/10 transition">
                    <div className="space-y-0.5">
                      <p className="font-extrabold">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p>Qty: x{item.quantity}</p>
                      <p className="text-forest font-black">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-sage/10 space-y-2.5 text-xs font-bold text-forest-dark shadow-sm shrink-0">
              <div className="flex justify-between">
                <span className="text-slate-400 font-extrabold">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-extrabold">Shipping Fee</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-forest">
                  <span className="font-extrabold flex items-center gap-1">
                    <FiTag /> Promo Code {order.appliedPromo ? `(${order.appliedPromo})` : ""}
                  </span>
                  <span>-${discountVal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Grand Total summary */}
            <div className="border-t border-sage/15 pt-4 flex justify-between items-center text-forest-dark shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grand Total Paid</span>
              </div>
              <span className="text-2xl font-black text-forest">${order.total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
