"use client";

import {
  FiActivity, FiShoppingBag, FiLayers, FiDollarSign, FiClock, FiSettings, FiToggleLeft
} from "react-icons/fi";

interface MetricsPanelProps {
  plantsCount?: number;
  usersCount?: number;
  averagePrice?: string;
  salesTotal?: number;

  // User metrics
  ordersCount?: number;
  totalSpent?: number;
  activePromosCount?: number;

  isAdmin?: boolean;
}

export default function MetricsPanel({
  plantsCount = 0,
  usersCount = 0,
  averagePrice = "0.00",
  salesTotal = 0,
  ordersCount = 0,
  totalSpent = 0,
  activePromosCount = 0,
  isAdmin = false
}: MetricsPanelProps) {
  if (isAdmin) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
            <FiLayers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Total Plants</p>
            <h3 className="text-2xl font-black text-forest-dark">{plantsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
            <FiActivity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Registered Users</p>
            <h3 className="text-2xl font-black text-forest-dark">{usersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
            <FiDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Avg Plant Price</p>
            <h3 className="text-2xl font-black text-forest-dark">${averagePrice}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
            <FiShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Sales Volume</p>
            <h3 className="text-2xl font-black text-forest-dark">${salesTotal.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
          <FiShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">My Orders</p>
          <h3 className="text-2xl font-black text-forest-dark">{ordersCount}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
          <FiDollarSign className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Total Invested</p>
          <h3 className="text-2xl font-black text-forest-dark">${totalSpent.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
          <FiToggleLeft className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-forest-dark/40">Active Coupons</p>
          <h3 className="text-2xl font-black text-forest-dark">{activePromosCount}</h3>
        </div>
      </div>
    </div>
  );
}
