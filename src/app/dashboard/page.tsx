"use client";

import { useEffect, useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { FiShoppingBag, FiActivity } from "react-icons/fi";
import MetricsPanel from "@/components/MetricsPanel";
import OrdersTable from "@/components/OrdersTable";
import DashboardTabs from "@/components/DashboardTabs";

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
}

type TabType = "metrics" | "orders";

export default function UserDashboardPage() {
  const router = useNextRouter();
  const [activeTab, setActiveTab] = useState<TabType>("metrics");
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [couponsCount, setCouponsCount] = useState(0);

  useEffect(() => {
    // Restore active tab from sessionStorage if present
    const savedTab = sessionStorage.getItem("user_active_tab");
    if (savedTab && ["metrics", "orders"].includes(savedTab)) {
      setActiveTab(savedTab as TabType);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    setAuthChecking(false);
    loadData();
  }, [router, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    sessionStorage.setItem("user_active_tab", tab);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      if (activeTab === "metrics") {
        const [ordersRes, couponsRes] = await Promise.all([
          fetch("/api/orders/my-orders", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
        if (couponsRes && couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCouponsCount(Array.isArray(couponsData) ? couponsData.filter((c: any) => c.isActive).length : 0);
        }
      } else {
        const res = await fetch("/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          throw new Error("Failed to load your order history");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-sage/15 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-tight text-forest-dark flex items-center justify-center sm:justify-start gap-2">
              <FiShoppingBag className="text-forest h-7 w-7" /> My Garden Console
            </h1>
            <p className="text-sm text-forest-dark/50 font-medium">View your botanical purchase history, order delivery statuses, and active savings.</p>
          </div>
        </div>
        <DashboardTabs
          tabs={[
            { id: "metrics", label: "Overview Summary", icon: FiActivity },
            { id: "orders", label: "Order History", icon: FiShoppingBag }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "orders" && (
          <div className="flex justify-end animate-fadeIn">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search orders by status or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 pr-10 text-xs font-bold text-forest-dark outline-none focus:border-forest shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose/10 border border-rose/25 px-4 py-3 text-xs font-bold text-rose animate-fadeIn">
            {error}
          </div>
        )}
        {loading ? (
          <div className="rounded-2xl border border-sage/15 bg-white p-20 flex justify-center items-center shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          </div>
        ) : activeTab === "metrics" ? (
          <div className="space-y-8 animate-fadeIn">
            <MetricsPanel
              isAdmin={false}
              ordersCount={orders.length}
              totalSpent={totalSpent}
              activePromosCount={couponsCount}
            />
            <div className="bg-white border border-sage/15 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40">Recent Transactions</h3>
              <OrdersTable
                orders={orders.slice(0, 3)}
                isAdmin={false}
              />
            </div>
          </div>
        ) : (
          (() => {
            const filteredOrders = orders.filter((o) =>
              o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.items?.some((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            return (
              <OrdersTable
                orders={filteredOrders}
                isAdmin={false}
              />
            );
          })()
        )}
      </div>
    </div>
  );
}
