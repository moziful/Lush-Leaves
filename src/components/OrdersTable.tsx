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

export default function OrdersTable({ orders, onStatusUpdate, onRowClick, isAdmin = false }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-sage/15 bg-white py-20 px-4 text-center shadow-sm animate-fadeIn">
        <p className="text-base font-bold text-forest-dark/70">No customer checkout orders recorded.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse flex flex-col">
          <thead>
            <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10 flex w-full">
              <th className="py-4 px-6 w-2/12 shrink-0">Order ID</th>
              {!isAdmin && <th className="py-4 px-6 w-2/12 shrink-0">Date</th>}
              <th className={`py-4 px-6 shrink-0 ${isAdmin ? "w-4/12" : "w-4/12"}`}>Customer / Items Purchased</th>
              {isAdmin && <th className="py-4 px-6 w-2/12 shrink-0">Purchased Items</th>}
              <th className="py-4 px-6 w-2/12 shrink-0">Total Amount</th>
              <th className="py-4 px-6 w-2/12 shrink-0">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/10 text-forest-dark text-sm max-h-[500px] overflow-y-auto flex flex-col w-full">
            {orders.map((o) => (
              <tr
                key={o._id}
                onClick={() => onRowClick && onRowClick(o)}
                className={`hover:bg-cream/40 transition flex w-full items-center ${onRowClick ? "cursor-pointer" : ""}`}
              >
                <td className="py-4 px-6 w-2/12 shrink-0 text-xs text-slate-400 font-mono font-bold">#{o._id.slice(-8)}</td>
                {!isAdmin && (
                  <td className="py-4 px-6 w-2/12 shrink-0 text-xs text-slate-500 font-medium">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                )}
                <td className={`py-4 px-6 shrink-0 font-bold text-forest-dark truncate ${isAdmin ? "w-4/12" : "w-4/12"}`}>
                  {isAdmin ? o.userEmail : o.items?.map((item) => `${item.title} (x${item.quantity})`).join(", ") || "No items"}
                </td>
                {isAdmin && (
                  <td className="py-4 px-6 w-2/12 shrink-0 text-xs text-slate-500 truncate">
                    {o.items?.map((item) => `${item.title} (x${item.quantity})`).join(", ") || "No items"}
                  </td>
                )}
                <td className="py-4 px-6 w-2/12 shrink-0 font-black text-forest">${(o.total || 0).toFixed(2)}</td>
                <td className="py-4 px-6 w-2/12 shrink-0">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    o.status === "Delivered"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : o.status === "Shipped"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : o.status === "Processing"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                    {o.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
