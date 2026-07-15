"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiPlus, FiTrash2, FiSettings, FiDroplet, FiSun, FiUsers, FiLayers, FiShield, FiCalendar, FiActivity, FiTag, FiTrendingUp, FiDollarSign, FiClock, FiFileText, FiShoppingBag, FiToggleLeft
} from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import RoleBadge from "@/components/RoleBadge";
import Button from "@/components/Button";
import MetricsPanel from "@/components/MetricsPanel";
import OrdersTable from "@/components/OrdersTable";
import DashboardTabs from "@/components/DashboardTabs";

interface Plant {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  difficulty: string;
  watering: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string;
  createdAt?: string;
}

interface LogEntry {
  _id: string;
  admin: string;
  action: string;
  timestamp: string;
}

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  userId: string;
  userEmail: string;
  items: { plantId: string; title: string; quantity: number; price: number }[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
}

interface SystemConfig {
  maintenanceMode: boolean;
  checkoutEnabled: boolean;
  freeShippingPromo: boolean;
  freeShippingExpiry: string | null;
  seasonalBanner: boolean;
  seasonalBannerExpiry: string | null;
  emailNotifications: boolean;
  shippingCharge: number;
}

type TabType = "metrics" | "inventory" | "users" | "orders" | "coupons" | "flags" | "logs";

export default function ManageDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("metrics");
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [plants, setPlants] = useState<Plant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    checkoutEnabled: true,
    freeShippingPromo: false,
    freeShippingExpiry: null,
    seasonalBanner: false,
    seasonalBannerExpiry: null,
    emailNotifications: true,
    shippingCharge: 15
  });

  // Coupon form state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  // Action confirmations
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [userToPromote, setUserToPromote] = useState<{ user: User; targetRole: string } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Restore active tab from sessionStorage if present
    const savedTab = sessionStorage.getItem("admin_active_tab");
    if (savedTab && ["metrics", "inventory", "users", "orders", "coupons", "flags", "logs"].includes(savedTab)) {
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

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        router.replace("/explore");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setAuthChecking(false);
    loadData();
  }, [router, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    sessionStorage.setItem("admin_active_tab", tab);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      if (activeTab === "metrics") {
        const [plantsRes, usersRes, ordersRes] = await Promise.all([
          fetch("/api/plants"),
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (plantsRes.ok && usersRes.ok && ordersRes.ok) {
          setPlants(await plantsRes.json());
          setUsers(await usersRes.json());
          setOrders(await ordersRes.json());
        } else {
          throw new Error("Failed to load metrics data");
        }
      } else if (activeTab === "inventory") {
        const res = await fetch("/api/plants");
        if (res.ok) setPlants(await res.json());
      } else if (activeTab === "users") {
        const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } else if (activeTab === "orders") {
        const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setOrders(await res.json());
      } else if (activeTab === "coupons") {
        const res = await fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setCoupons(await res.json());
      } else if (activeTab === "flags") {
        const res = await fetch("/api/admin/config");
        if (res.ok) setConfig(await res.json());
      } else if (activeTab === "logs") {
        const res = await fetch("/api/admin/logs", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setLogs(await res.json());
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlantDelete = async () => {
    if (!plantToDelete) return;
    const token = localStorage.getItem("token");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/plants/${plantToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlants((prev) => prev.filter((p) => p.id !== plantToDelete.id));
        setPlantToDelete(null);
      }
    } catch {
      setError("Could not delete plant.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserDelete = async () => {
    if (!userToDelete) return;
    const token = localStorage.getItem("token");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } catch {
      setError("Could not delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserRoleChange = async () => {
    if (!userToPromote) return;
    const token = localStorage.getItem("token");
    const { user, targetRole } = userToPromote;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: targetRole } : u))
        );
        setUserToPromote(null);
      }
    } catch {
      setError("Could not change role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCouponDelete = async () => {
    if (!couponToDelete) return;
    const token = localStorage.getItem("token");
    const id = couponToDelete._id;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
        setCouponToDelete(null);
      } else {
        throw new Error("Failed to delete promo code");
      }
    } catch (err: any) {
      setError(err.message || "Could not delete promo code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: status as any } : o))
        );
      }
    } catch {
      setError("Failed to update status");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: newCouponCode, discount: parseFloat(newCouponDiscount), isActive: true }),
      });
      if (res.ok) {
        setNewCouponCode("");
        setNewCouponDiscount("");
        loadData();
      }
    } catch {
      setError("Failed to create promo code");
    }
  };

  const handleSaveConfig = async (newConfig: SystemConfig) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        setConfig(newConfig);
      }
    } catch {
      setError("Failed to save feature flags");
    }
  };

  // Calculations
  const salesTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averagePrice = plants.length > 0 ? (plants.reduce((sum, p) => sum + p.price, 0) / plants.length).toFixed(2) : "0.00";
  const newestUser = users.length > 0 ? users[users.length - 1] : null;

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
      </div>
    );
  }

  const difficultyColor = {
    Easy: "text-emerald-600 bg-emerald-50 border-emerald-100",
    Medium: "text-amber-600 bg-amber-50 border-amber-100",
    Hard: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-sage/15 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-tight text-forest-dark flex items-center justify-center sm:justify-start gap-2">
              <FiSettings className="text-forest h-7 w-7 animate-spin-slow" /> Admin Console
            </h1>
            <p className="text-sm text-forest-dark/50 font-medium">Control botanical listings, inventory catalogs, system accounts, and configuration boards.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === "inventory" && (
              <Link
                href="/items/add"
                className="flex items-center gap-1.5 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm shadow-forest/20 hover:bg-forest-dark transition-all active:scale-95 cursor-pointer"
              >
                <FiPlus className="h-4.5 w-4.5" /> Add Plant
              </Link>
            )}
          </div>
        </div>

        <DashboardTabs
          tabs={[
            { id: "metrics", label: "Metrics", icon: FiActivity },
            { id: "inventory", label: "Inventory", icon: FiLayers },
            { id: "users", label: "Users", icon: FiUsers },
            { id: "orders", label: "Orders", icon: FiShoppingBag },
            { id: "coupons", label: "Promo Codes", icon: FiTag },
            { id: "flags", label: "Feature Flags", icon: FiToggleLeft },
            { id: "logs", label: "Audit Logs", icon: FiClock }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Search Bar Input Panel (Shown on all tabs except Metrics and Flags) */}
        {!["metrics", "flags"].includes(activeTab) && (
          <div className="flex justify-end animate-fadeIn">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 pr-10 text-xs font-bold text-forest-dark outline-none focus:border-forest shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                  title="Clear Search"
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

        {/* Main Panel View */}
        {loading ? (
          <div className="rounded-2xl border border-sage/15 bg-white p-20 flex justify-center items-center shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          </div>
        ) : activeTab === "metrics" ? (
          <div className="space-y-8 animate-fadeIn">
            <MetricsPanel
              isAdmin={true}
              plantsCount={plants.length}
              usersCount={users.length}
              averagePrice={averagePrice}
              salesTotal={salesTotal}
            />

            {/* Grid 2: Side Cards (Recent Activity summary) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-forest-dark/40">Newest Addition</h4>
                {plants.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-sage/15 bg-sage/5 shrink-0">
                      <Image src={plants[0].image} alt={plants[0].title} fill className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-sm font-black text-forest-dark">{plants[0].title}</h5>
                      <span className="inline-block rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-forest border border-sage/20">
                        {plants[0].category}
                      </span>
                      <p className="text-xs text-forest font-extrabold pt-0.5">${plants[0].price.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No plants listed yet.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-forest-dark/40">Newest Member</h4>
                {newestUser ? (
                  <div className="flex items-center gap-4">
                    {newestUser.imageUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border border-sage/15 bg-sage/5 shrink-0">
                        <Image src={newestUser.imageUrl} alt={newestUser.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest/10 border border-sage/20 text-sm font-black text-forest">
                        {newestUser.name ? newestUser.name.slice(0, 2).toUpperCase() : newestUser.email.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-forest-dark">{newestUser.name || "Unnamed User"}</h5>
                      <p className="text-xs text-slate-500 font-medium">{newestUser.email}</p>
                      <RoleBadge role={newestUser.role} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No registered users found.</p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "inventory" ? (
          (() => {
            const filteredPlants = plants.filter((plant) =>
              plant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              plant.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              plant.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return filteredPlants.length === 0 ? (
              <div className="rounded-2xl border border-sage/15 bg-white py-20 px-4 text-center space-y-4 shadow-sm animate-fadeIn">
                <p className="text-base font-bold text-forest-dark/70">
                  {plants.length === 0 ? "The catalog is empty." : "No matching plants found."}
                </p>
                {plants.length === 0 && (
                  <Link href="/items/add" className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white cursor-pointer">
                    <FiPlus /> Add Plant
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse flex flex-col">
                    <thead>
                      <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10 flex w-full">
                        <th className="py-4 px-6 w-1/12 shrink-0">Image</th>
                        <th className="py-4 px-6 w-3/12 shrink-0">Title</th>
                        <th className="py-4 px-6 w-2/12 shrink-0">Category</th>
                        <th className="py-4 px-6 w-2/12 shrink-0">Difficulty</th>
                        <th className="py-4 px-6 w-2/12 shrink-0">Watering</th>
                        <th className="py-4 px-6 w-1/12 shrink-0">Price</th>
                        <th className="py-4 px-6 w-1/12 shrink-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage/10 text-forest-dark text-sm max-h-[500px] overflow-y-auto flex flex-col w-full">
                      {filteredPlants.map((plant) => (
                        <tr key={plant.id} className="hover:bg-cream/40 transition flex w-full items-center">
                          <td className="py-4 px-6 w-1/12 shrink-0">
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-sage/15 bg-sage/5">
                              <Image src={plant.image} alt={plant.title} fill className="object-cover" />
                            </div>
                          </td>
                          <td className="py-4 px-6 w-3/12 shrink-0 font-bold text-forest-dark truncate">{plant.title}</td>
                          <td className="py-4 px-6 w-2/12 shrink-0">
                            <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-bold text-forest border border-sage/20">
                              {plant.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 w-2/12 shrink-0">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                              difficultyColor[plant.difficulty as "Easy" | "Medium" | "Hard"] || "text-slate-600 bg-slate-50 border-slate-100"
                            }`}>
                              {plant.difficulty}
                            </span>
                          </td>
                          <td className="py-4 px-6 w-2/12 shrink-0 text-xs text-slate-500 font-medium truncate">{plant.watering || "—"}</td>
                          <td className="py-4 px-6 w-1/12 shrink-0 font-black text-forest">${plant.price.toFixed(2)}</td>
                          <td className="py-4 px-6 w-1/12 shrink-0">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => setPlantToDelete(plant)}
                                className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                                title="Delete Plant"
                              >
                                <FiTrash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()
        ) : activeTab === "users" ? (
          (() => {
            const filteredUsers = users.filter((u) =>
              (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-sage/15 bg-white py-20 px-4 text-center shadow-sm animate-fadeIn">
                <p className="text-base font-bold text-forest-dark/70">
                  {users.length === 0 ? "No registered user accounts found." : "No matching user accounts found."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse flex flex-col">
                    <thead>
                      <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10 flex w-full">
                        <th className="py-4 px-6 w-1/12 shrink-0">Profile</th>
                        <th className="py-4 px-6 w-2/12 shrink-0">Name</th>
                        <th className="py-4 px-6 w-3/12 shrink-0">Email Address</th>
                        <th className="py-4 px-6 w-2/12 shrink-0">Access Level</th>
                        <th className="py-4 px-6 w-3/12 shrink-0 text-center">Change Role</th>
                        <th className="py-4 px-6 w-1/12 shrink-0 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage/10 text-forest-dark text-sm max-h-[500px] overflow-y-auto flex flex-col w-full">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-cream/40 transition flex w-full items-center">
                          <td className="py-4 px-6 w-1/12 shrink-0">
                            {user.imageUrl ? (
                              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-sage/15 bg-sage/5">
                                <Image src={user.imageUrl} alt={user.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 border border-sage/20 text-xs font-black text-forest">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 w-2/12 shrink-0 font-bold text-forest-dark truncate">{user.name || "—"}</td>
                          <td className="py-4 px-6 w-3/12 shrink-0 text-slate-500 font-medium truncate">{user.email}</td>
                          <td className="py-4 px-6 w-2/12 shrink-0">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="py-4 px-6 w-3/12 shrink-0">
                            <div className="flex justify-center gap-1.5">
                              {user.role === "admin" ? (
                                <button
                                  onClick={() => setUserToPromote({ user, targetRole: "user" })}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                                >
                                  Demote to User
                                </button>
                              ) : (
                                <button
                                  onClick={() => setUserToPromote({ user, targetRole: "admin" })}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-forest bg-forest/5 hover:bg-forest hover:text-white border border-forest/15 transition cursor-pointer"
                                >
                                  Promote to Admin
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 w-1/12 shrink-0">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setUserToDelete(user)}
                                className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                                title="Delete Account"
                              >
                                <FiTrash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()
        ) : activeTab === "orders" ? (
          (() => {
            const filteredOrders = orders.filter((o) =>
              o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.status.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return (
              <OrdersTable
                orders={filteredOrders}
                isAdmin={true}
                onStatusUpdate={handleOrderStatusUpdate}
                onRowClick={(order) => setSelectedOrder(order)}
              />
            );
          })()
        ) : activeTab === "coupons" ? (
          /* Promo Codes Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Create Code Form */}
            <div className="lg:col-span-1 bg-white border border-sage/15 p-6 rounded-2xl shadow-sm h-fit">
              <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider mb-4">Create Promo Code</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPRING30"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-sage/20 px-3.5 py-2.5 text-xs font-bold text-forest-dark outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Discount Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 10"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-full rounded-xl border border-sage/20 px-3.5 py-2.5 text-xs font-bold text-forest-dark outline-none focus:border-forest"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full py-2.5 text-xs uppercase tracking-widest font-black">
                  Create Code
                </Button>
              </form>
            </div>

            {/* Coupons List */}
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10">
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Discount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Created At</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/10 text-forest-dark text-sm">
                    {(() => {
                      const filteredCoupons = coupons.filter((c) =>
                        c.code.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      return filteredCoupons.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-6 text-center text-xs font-bold text-slate-400">
                            {coupons.length === 0 ? "No promo codes defined yet." : "No matching promo codes found."}
                          </td>
                        </tr>
                      ) : (
                        filteredCoupons.map((c) => (
                          <tr key={c._id}>
                            <td className="py-4 px-6 font-mono font-black text-forest-dark">{c.code}</td>
                            <td className="py-4 px-6 font-extrabold text-forest">${c.discount.toFixed(2)} OFF</td>
                            <td className="py-4 px-6">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                c.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500"
                              }`}>
                                {c.isActive ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => setCouponToDelete(c)}
                                  className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                                  title="Delete Coupon"
                                >
                                  <FiTrash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "flags" ? (
          /* System Config / Feature Flags Tab */
          <div className="bg-white border border-sage/15 p-6 rounded-2xl shadow-sm max-w-xl animate-fadeIn space-y-6">
            <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider border-b border-sage/10 pb-3">System Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-sage/5 border border-sage/10">
                <div>
                  <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Maintenance Mode</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Block storefront browse actions and display maintenance banner.</p>
                </div>
                <button
                  onClick={() => handleSaveConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.maintenanceMode ? "bg-forest" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-sage/5 border border-sage/10">
                <div>
                  <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Enable Checkout</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Allow standard user sessions to submit checkout purchases.</p>
                </div>
                <button
                  onClick={() => handleSaveConfig({ ...config, checkoutEnabled: !config.checkoutEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.checkoutEnabled ? "bg-forest" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.checkoutEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Free Shipping Switch & Timer */}
              <div className="p-4 rounded-xl bg-sage/5 border border-sage/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Free Shipping Promo</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Automatically overrides checkout deliveries to $0.00.</p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig({ ...config, freeShippingPromo: !config.freeShippingPromo })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.freeShippingPromo ? "bg-forest" : "bg-slate-200"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.freeShippingPromo ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
                {config.freeShippingPromo && (
                  <div className="pt-2 border-t border-sage/10 flex items-center gap-4">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 shrink-0">Auto-Turn Off Expiry</label>
                    <input
                      type="datetime-local"
                      value={config.freeShippingExpiry ? new Date(new Date(config.freeShippingExpiry).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                      onChange={(e) => handleSaveConfig({ ...config, freeShippingExpiry: e.target.value || null })}
                      className="rounded-lg border border-sage/20 bg-white px-2 py-1 text-xs font-bold text-forest-dark outline-none focus:border-forest"
                    />
                  </div>
                )}
              </div>

              {/* Seasonal Banner Switch & Timer */}
              <div className="p-4 rounded-xl bg-sage/5 border border-sage/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Seasonal Marketing Banner</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Display active sale notification strip at page header bars.</p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig({ ...config, seasonalBanner: !config.seasonalBanner })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.seasonalBanner ? "bg-forest" : "bg-slate-200"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.seasonalBanner ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
                {config.seasonalBanner && (
                  <div className="pt-2 border-t border-sage/10 flex items-center gap-4">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 shrink-0">Auto-Turn Off Expiry</label>
                    <input
                      type="datetime-local"
                      value={config.seasonalBannerExpiry ? new Date(new Date(config.seasonalBannerExpiry).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                      onChange={(e) => handleSaveConfig({ ...config, seasonalBannerExpiry: e.target.value || null })}
                      className="rounded-lg border border-sage/20 bg-white px-2 py-1 text-xs font-bold text-forest-dark outline-none focus:border-forest"
                    />
                  </div>
                )}
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sage/5 border border-sage/10">
                <div>
                  <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Dispatch System Emails</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Trigger confirmation receipt emails on transactions.</p>
                </div>
                <button
                  onClick={() => handleSaveConfig({ ...config, emailNotifications: !config.emailNotifications })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config.emailNotifications ? "bg-forest" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Shipping Fee Config */}
              <div className="p-4 rounded-xl bg-sage/5 border border-sage/10 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-forest-dark uppercase tracking-wider">Standard Shipping Fee ($)</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Base shipping delivery rate applied to checkout carts.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={config.shippingCharge || 0}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        setConfig({ ...config, shippingCharge: val });
                      }}
                      className="w-20 rounded-lg border border-sage/20 bg-white px-2 py-1.5 text-xs font-bold text-forest-dark outline-none focus:border-forest text-center"
                    />
                    <button
                      onClick={() => handleSaveConfig(config)}
                      className="rounded-lg bg-forest px-3 py-1.5 text-[10px] font-black uppercase text-white hover:bg-forest-dark cursor-pointer transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Audit Logs Tab */
          <div className="bg-white border border-sage/15 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-sage/10 bg-sage/5 flex items-center gap-2 text-forest-dark/70">
              <FiClock />
              <h3 className="text-xs font-black uppercase tracking-wider">Administrative Event Log</h3>
            </div>
            <div className="divide-y divide-sage/10 max-h-[500px] overflow-y-auto">
              {(() => {
                const filteredLogs = logs.filter((log) =>
                  log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.action.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filteredLogs.length === 0 ? (
                  <div className="py-8 px-6 text-center text-xs font-bold text-slate-400">
                    {logs.length === 0 ? "No actions recorded in logs database yet." : "No matching event logs found."}
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    let logText = "";
                    if (log.admin === "system") {
                      logText = log.action; // Leave "system turned off ..." intact
                    } else {
                      const adminName = log.admin.split("@")[0];
                      const capitalizedAdmin = adminName.charAt(0).toUpperCase() + adminName.slice(1);
                      logText = `${capitalizedAdmin} ${log.action.charAt(0).toLowerCase() + log.action.slice(1)}`;
                    }
                    return (
                      <div key={log._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-cream/20 transition">
                        <div className="space-y-0.5">
                          <p className="text-xs font-extrabold text-forest-dark">
                            {logText}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Logged by: {log.admin}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Delete Plant Confirmation */}
      <ConfirmModal
        isOpen={!!plantToDelete}
        title="Confirm Plant Deletion"
        message={`Are you sure you want to delete "${plantToDelete?.title}"? This will permanently remove it from the explore catalog.`}
        confirmLabel="Delete Listing"
        cancelLabel="Cancel"
        onConfirm={handlePlantDelete}
        onCancel={() => setPlantToDelete(null)}
      />

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Confirm Account Deletion"
        message={`Are you sure you want to delete the user account "${userToDelete?.name || userToDelete?.email}"? This action cannot be undone.`}
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        onConfirm={handleUserDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Role Change Confirmation */}
      <ConfirmModal
        isOpen={!!userToPromote}
        title="Change Access Role"
        message={`Are you sure you want to change "${userToPromote?.user.name || userToPromote?.user.email}"'s role to ${userToPromote?.targetRole.toUpperCase()}?`}
        confirmLabel="Change Role"
        cancelLabel="Cancel"
        onConfirm={handleUserRoleChange}
        onCancel={() => setUserToPromote(null)}
      />

      {/* Delete Coupon Confirmation */}
      <ConfirmModal
        isOpen={!!couponToDelete}
        title="Confirm Coupon Deletion"
        message={`Are you sure you want to delete promo code "${couponToDelete?.code}"?`}
        confirmLabel="Delete Coupon"
        cancelLabel="Cancel"
        onConfirm={handleCouponDelete}
        onCancel={() => setCouponToDelete(null)}
      />

      {/* Detailed Order Profile Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
