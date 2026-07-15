"use client";

import { FiClock, FiShoppingBag } from "react-icons/fi";

interface OrderItem {
  plantId: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId?: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
  shippingCharge?: number;
  appliedPromo?: string | null;
  discount?: number;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate?: (orderId: string, status: string) => void;
  onRowClick?: (order: Order) => void;
  isAdmin?: boolean;
}

const statusStyle = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    case "Shipped":
      return "bg-blue-50 text-blue-600 border border-blue-100";
    case "Processing":
      return "bg-amber-50 text-amber-600 border border-amber-100";
    default:
      return "bg-rose-50 text-rose-600 border border-rose-100";
  }
};

export default function OrdersTable({ orders, onStatusUpdate, onRowClick, isAdmin = false }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-sage/15 bg-white py-20 px-4 text-center shadow-sm animate-fadeIn">
        <p className="text-base font-bold text-forest-dark/70">No customer checkout orders recorded.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Mobile Card Layout */}
      <div className="md:hidden rounded-2xl border border-sage/15 bg-white shadow-sm overflow-hidden divide-y divide-sage/25">
        {orders.map((o) => (
          <div
            key={o._id}
            onClick={() => onRowClick && onRowClick(o)}
            className={`p-4 space-y-3 ${onRowClick ? "cursor-pointer active:bg-cream/60" : ""} transition-all`}
          >
            {/* Top Row: ID + Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-bold">#{o._id.slice(-8)}</span>
              <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyle(o.status)}`}>
                {o.status || "Pending"}
              </span>
            </div>

            {/* Email (admin) or Items (user) */}
            {isAdmin ? (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Customer</span>
                <p className="text-xs font-bold text-forest-dark truncate">{o.userEmail}</p>
              </div>
            ) : null}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Items</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {o.items?.map((item) => `${item.title} (x${item.quantity})`).join(", ") || "No items"}
              </p>
            </div>

            {/* Bottom Row: Date + Total */}
            <div className="flex items-center justify-between pt-1 border-t border-sage/10">
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <span className="text-sm font-black text-forest">${(o.total || 0).toFixed(2)}</span>
            </div>

            {/* Admin Status Buttons */}
            {isAdmin && onStatusUpdate && (
              <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                {["Pending", "Processing", "Shipped", "Delivered"].map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusUpdate(o._id, st)}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                      o.status === st
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
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
            <thead>
              <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10">
                <th className="py-4 px-5 w-[12%]">Order ID</th>
                {!isAdmin && <th className="py-4 px-5 w-[13%]">Date</th>}
                <th className={`py-4 px-5 ${isAdmin ? "w-[20%]" : "w-[45%]"}`}>
                  {isAdmin ? "Customer Email" : "Items Purchased"}
                </th>
                {isAdmin && <th className="py-4 px-5 w-[25%]">Purchased Items</th>}
                <th className="py-4 px-5 w-[12%]">Total</th>
                <th className="py-4 px-5 w-[13%] text-center">Status</th>
                {isAdmin && <th className="py-4 px-5 w-[18%] text-center">Change State</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/20 text-forest-dark text-sm">
              {orders.map((o) => (
                <tr
                  key={o._id}
                  onClick={() => onRowClick && onRowClick(o)}
                  className={`hover:bg-cream/40 transition ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  <td className="py-4 px-5 text-xs text-slate-400 font-mono font-bold">#{o._id.slice(-8)}</td>
                  {!isAdmin && (
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  )}
                  <td className="py-4 px-5 font-bold text-forest-dark truncate">
                    {isAdmin ? o.userEmail : o.items?.map((item) => `${item.title} (x${item.quantity})`).join(", ") || "No items"}
                  </td>
                  {isAdmin && (
                    <td className="py-4 px-5 text-xs text-slate-500 truncate">
                      {o.items?.map((item) => `${item.title} (x${item.quantity})`).join(", ") || "No items"}
                    </td>
                  )}
                  <td className="py-4 px-5 font-black text-forest">${(o.total || 0).toFixed(2)}</td>
                  <td className="py-4 px-5 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyle(o.status)}`}>
                      {o.status || "Pending"}
                    </span>
                  </td>
                  {isAdmin && onStatusUpdate && (
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1">
                        {["Pending", "Processing", "Shipped", "Delivered"].map((st) => (
                          <button
                            key={st}
                            onClick={() => onStatusUpdate(o._id, st)}
                            className={`px-1.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                              o.status === st
                                ? "bg-forest text-white border-forest"
                                : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {st.slice(0, 4)}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
