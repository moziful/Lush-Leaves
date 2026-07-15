"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiPlus, FiTrash2, FiSettings, FiDroplet, FiSun, FiUsers, FiLayers, FiShield, FiCalendar, FiActivity, FiTag, FiTrendingUp, FiDollarSign, FiClock, FiFileText, FiShoppingBag, FiToggleLeft,
  FiChevronLeft, FiUpload, FiAlertTriangle, FiImage, FiInfo
} from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import RoleBadge from "@/components/RoleBadge";
import Button from "@/components/Button";
import MetricsPanel from "@/components/MetricsPanel";
import OrdersTable from "@/components/OrdersTable";
import DashboardTabs from "@/components/DashboardTabs";
import OrderDetailModal from "@/components/OrderDetailModal";
import SuggestionInput from "@/components/SuggestionInput";
import CustomSelect from "@/components/CustomSelect";

interface CommonProblem { problem: string; solution: string; }

const CATEGORIES = ["Foliage", "Succulents", "Flowers", "Pet Friendly"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

const SUGGESTIONS = {
  watering: [
    "Once a week", "Every 2 weeks", "Every 2–3 weeks",
    "Once a month", "Keep moist", "When soil is dry",
  ],
  sunlight: [
    "Full Sun", "Bright Indirect", "Low to Bright Indirect",
    "Partial Shade", "Full Shade", "Filtered Light",
  ],
  temperature: [
    "10°C – 20°C", "15°C – 25°C", "15°C – 29°C",
    "18°C – 27°C", "20°C – 30°C", "Above 15°C",
  ],
};

const addPlantInputClass =
  "w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-sm font-medium text-forest-dark outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15 placeholder:text-slate-400";
const addPlantLabelClass =
  "block text-[11px] font-black uppercase tracking-wider text-forest-dark/40 mb-1.5";

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-sage/15 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sage/10 bg-sage/5">
        <Icon className="h-4 w-4 text-forest" />
        <h2 className="text-xs font-black uppercase tracking-widest text-forest-dark/60">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

interface Plant {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  watering: string;
  scientificName?: string;
  short?: string;
  description?: string;
  sunlight?: string;
  temperature?: string;
  detailedCare?: string[];
  commonProblems?: CommonProblem[];
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
  userId?: string;
  userEmail: string;
  items: { plantId: string; title: string; quantity: number; price: number }[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
  shippingCharge?: number;
  appliedPromo?: string | null;
  discount?: number;
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

  // Add Plant form states
  const [addForm, setAddForm] = useState({
    title: "",
    scientificName: "",
    category: "Foliage",
    short: "",
    description: "",
    price: "",
    image: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    watering: "",
    sunlight: "",
    temperature: "",
  });
  const [addDetailedCare, setAddDetailedCare] = useState<string[]>([""]);
  const [addCommonProblems, setAddCommonProblems] = useState<CommonProblem[]>([
    { problem: "", solution: "" },
  ]);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addUploadingPhoto, setAddUploadingPhoto] = useState(false);
  const [addShowConfirm, setAddShowConfirm] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  // Action confirmations
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [userToPromote, setUserToPromote] = useState<{ user: User; targetRole: string } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit Plant Mode state
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);

  useEffect(() => {
    // Restore active tab from sessionStorage if present
    const savedTab = sessionStorage.getItem("admin_active_tab");
    if (savedTab && ["metrics", "inventory", "users", "orders", "coupons", "flags", "logs", "add-plant"].includes(savedTab)) {
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
    setPlantToEdit(null);
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

  const handleAddPlantField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (addError) setAddError("");
  };

  const handleAddPlantPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddUploadingPhoto(true);
    setAddError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setAddForm((prev) => ({ ...prev, image: data.url }));
      } else {
        setAddError(data.message || "Image upload failed.");
      }
    } catch { setAddError("Network error during photo upload."); }
    finally {
      setAddUploadingPhoto(false);
      if (addPhotoInputRef.current) addPhotoInputRef.current.value = "";
    }
  };

  const updateAddPlantCare = (i: number, val: string) =>
    setAddDetailedCare((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  const addAddPlantCare = () => setAddDetailedCare((prev) => [...prev, ""]);
  const removeAddPlantCare = (i: number) => setAddDetailedCare((prev) => prev.filter((_, idx) => idx !== i));

  const updateAddPlantProblem = (i: number, field: keyof CommonProblem, val: string) =>
    setAddCommonProblems((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  const addAddPlantProblem = () => setAddCommonProblems((prev) => [...prev, { problem: "", solution: "" }]);
  const removeAddPlantProblem = (i: number) => setAddCommonProblems((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddPlantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.image) { setAddError("Please upload or enter a plant image."); return; }
    setAddShowConfirm(true);
  };

  const startEditPlant = (plant: Plant) => {
    setPlantToEdit(plant);
    setAddForm({
      title: plant.title,
      scientificName: plant.scientificName || "",
      category: plant.category,
      short: plant.short || "",
      description: plant.description || "",
      price: plant.price.toString(),
      image: plant.image,
      difficulty: plant.difficulty,
      watering: plant.watering || "",
      sunlight: plant.sunlight || "",
      temperature: plant.temperature || "",
    });
    setAddDetailedCare(plant.detailedCare && plant.detailedCare.length > 0 ? plant.detailedCare : [""]);
    setAddCommonProblems(plant.commonProblems && plant.commonProblems.length > 0 ? plant.commonProblems : [{ problem: "", solution: "" }]);
    setActiveTab("add-plant");
    sessionStorage.setItem("admin_active_tab", "add-plant");
  };

  const handleAddPlantConfirmSubmit = async () => {
    setAddShowConfirm(false);
    setAddSubmitting(true);
    setAddError("");
    const token = localStorage.getItem("token");
    try {
      const url = plantToEdit ? `/api/plants/${plantToEdit.id}` : "/api/plants";
      const method = plantToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...addForm,
          price: parseFloat(addForm.price),
          detailedCare: addDetailedCare.filter(Boolean),
          commonProblems: addCommonProblems.filter((p) => p.problem || p.solution),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${plantToEdit ? "update" : "create"} plant.`);
      setAddSuccess(`Plant ${plantToEdit ? "updated" : "added"} successfully!`);
      
      setAddForm({
        title: "",
        scientificName: "",
        category: "Foliage",
        short: "",
        description: "",
        price: "",
        image: "",
        difficulty: "Easy" as "Easy" | "Medium" | "Hard",
        watering: "",
        sunlight: "",
        temperature: "",
      });
      setAddDetailedCare([""]);
      setAddCommonProblems([{ problem: "", solution: "" }]);
      setPlantToEdit(null);
      
      setTimeout(() => {
        setAddSuccess("");
        loadData();
        setActiveTab("inventory");
        sessionStorage.setItem("admin_active_tab", "inventory");
      }, 1500);
    } catch (err: any) {
      setAddError(err.message || "Something went wrong.");
    } finally { setAddSubmitting(false); }
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
        </div>

        <DashboardTabs
          tabs={[
            { id: "metrics", label: "Metrics", icon: FiActivity },
            { id: "inventory", label: "Inventory", icon: FiLayers },
            { id: "add-plant", label: plantToEdit ? "Edit Plant" : "Add Plant", icon: FiPlus },
            { id: "users", label: "Users", icon: FiUsers },
            { id: "orders", label: "Orders", icon: FiShoppingBag },
            { id: "coupons", label: "Promo Codes", icon: FiTag },
            { id: "flags", label: "Feature Flags", icon: FiToggleLeft },
            { id: "logs", label: "Audit Logs", icon: FiClock }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Search Bar Input Panel (Shown on all tabs except Metrics, Flags, and Add Plant) */}
        {!["metrics", "flags", "add-plant"].includes(activeTab) && (
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
              <div className="animate-fadeIn">
                {/* Mobile Card Layout */}
                <div className="md:hidden rounded-2xl border border-sage/15 bg-white shadow-sm overflow-hidden divide-y divide-sage/25">
                  {filteredPlants.map((plant) => (
                    <div key={plant.id} className="p-4 space-y-3 transition-all">
                      {/* Row 1: Image + Title + Price */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-sage/15 bg-sage/5 shrink-0">
                          <Image src={plant.image} alt={plant.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-forest-dark truncate">{plant.title}</p>
                          <p className="text-xs text-slate-500 font-medium">{plant.watering || "—"}</p>
                        </div>
                        <span className="text-sm font-black text-forest shrink-0">${plant.price.toFixed(2)}</span>
                      </div>
                      {/* Row 2: Badges + Delete */}
                      <div className="flex items-center justify-between pt-1 border-t border-sage/10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-sage/10 px-2.5 py-1 text-[10px] font-bold text-forest border border-sage/20">
                            {plant.category}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                            difficultyColor[plant.difficulty as "Easy" | "Medium" | "Hard"] || "text-slate-600 bg-slate-50 border-slate-100"
                          }`}>
                            {plant.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditPlant(plant)}
                            className="rounded-lg p-2 text-slate-400 hover:text-forest hover:bg-forest/5 transition cursor-pointer"
                            title="Edit Plant"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setPlantToDelete(plant)}
                            className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                            title="Delete Plant"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                      <thead>
                        <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10">
                          <th className="py-4 px-6 w-[8%]">Image</th>
                          <th className="py-4 px-6 w-[25%]">Title</th>
                          <th className="py-4 px-6 w-[15%]">Category</th>
                          <th className="py-4 px-6 w-[15%]">Difficulty</th>
                          <th className="py-4 px-6 w-[17%]">Watering</th>
                          <th className="py-4 px-6 w-[10%]">Price</th>
                          <th className="py-4 px-6 w-[10%] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage/10 text-forest-dark text-sm">
                        {filteredPlants.map((plant) => (
                          <tr key={plant.id} className="hover:bg-cream/40 transition">
                            <td className="py-4 px-6">
                              <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-sage/15 bg-sage/5">
                                <Image src={plant.image} alt={plant.title} fill className="object-cover" />
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-forest-dark truncate">{plant.title}</td>
                            <td className="py-4 px-6">
                              <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-bold text-forest border border-sage/20">
                                {plant.category}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                                difficultyColor[plant.difficulty as "Easy" | "Medium" | "Hard"] || "text-slate-600 bg-slate-50 border-slate-100"
                              }`}>
                                {plant.difficulty}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-500 font-medium truncate">{plant.watering || "—"}</td>
                            <td className="py-4 px-6 font-black text-forest">${plant.price.toFixed(2)}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => startEditPlant(plant)}
                                  className="rounded-lg p-2 text-slate-400 hover:text-forest hover:bg-forest/5 transition cursor-pointer"
                                  title="Edit Plant"
                                >
                                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
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
              <div className="animate-fadeIn">
                {/* Mobile Card Layout */}
                <div className="md:hidden rounded-2xl border border-sage/15 bg-white shadow-sm overflow-hidden divide-y divide-sage/25">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 space-y-3">
                      {/* Row 1: Avatar + Name + Role Badge */}
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-sage/15 bg-sage/5 shrink-0">
                            <Image src={user.imageUrl} alt={user.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 border border-sage/20 text-xs font-black text-forest shrink-0">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-forest-dark truncate">{user.name || "—"}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                        </div>
                        <RoleBadge role={user.role} />
                      </div>
                      {/* Row 2: Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-sage/10">
                        <div className="flex-1">
                          {user.role === "admin" ? (
                            <button
                              onClick={() => setUserToPromote({ user, targetRole: "user" })}
                              className="w-full flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                            >
                              Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() => setUserToPromote({ user, targetRole: "admin" })}
                              className="w-full flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-forest bg-forest/5 hover:bg-forest hover:text-white border border-forest/15 transition cursor-pointer"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="rounded-lg p-2.5 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer border border-sage/15"
                          title="Delete Account"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                      <thead>
                        <tr className="bg-sage/5 text-[10px] font-black uppercase tracking-widest text-forest-dark/45 border-b border-sage/10">
                          <th className="py-4 px-6 w-[8%]">Profile</th>
                          <th className="py-4 px-6 w-[17%]">Name</th>
                          <th className="py-4 px-6 w-[25%]">Email Address</th>
                          <th className="py-4 px-6 w-[15%]">Access Level</th>
                          <th className="py-4 px-6 w-[25%] text-center">Change Role</th>
                          <th className="py-4 px-6 w-[10%] text-center">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage/10 text-forest-dark text-sm">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-cream/40 transition">
                            <td className="py-4 px-6">
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
                            <td className="py-4 px-6 font-bold text-forest-dark truncate">{user.name || "—"}</td>
                            <td className="py-4 px-6 text-slate-500 font-medium truncate">{user.email}</td>
                            <td className="py-4 px-6">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="py-4 px-6">
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
                            <td className="py-4 px-6">
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
            <div className="lg:col-span-2">
              {(() => {
                const filteredCoupons = coupons.filter((c) =>
                  c.code.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filteredCoupons.length === 0 ? (
                  <div className="rounded-2xl border border-sage/15 bg-white py-8 px-6 text-center text-xs font-bold text-slate-400 shadow-sm">
                    {coupons.length === 0 ? "No promo codes defined yet." : "No matching promo codes found."}
                  </div>
                ) : (
                  <div>
                    {/* Mobile Card Layout */}
                    <div className="md:hidden rounded-2xl border border-sage/15 bg-white shadow-sm overflow-hidden divide-y divide-sage/25">
                      {filteredCoupons.map((c) => (
                        <div key={c._id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono font-black text-forest-dark">{c.code}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                c.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500"
                              }`}>
                                {c.isActive ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <button
                              onClick={() => setCouponToDelete(c)}
                              className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                              title="Delete Coupon"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-sage/10">
                            <span className="text-xs font-extrabold text-forest">${c.discount.toFixed(2)} OFF</span>
                            <span className="text-[10px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-sage/15 bg-white shadow-sm">
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
                            {filteredCoupons.map((c) => (
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
        ) : activeTab === "add-plant" ? (
          /* Add Plant Tab Form */
          <div className="space-y-6 animate-fadeIn">
            {addError && (
              <div className="rounded-xl bg-rose/10 border border-rose/20 px-4 py-3 text-xs font-bold text-rose">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="rounded-xl bg-forest/10 border border-forest/20 px-4 py-3 text-xs font-bold text-forest">
                {addSuccess}
              </div>
            )}

            <form onSubmit={handleAddPlantSubmit} className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column: Image and Care Snapshot */}
                <div className="xl:col-span-1 space-y-6">
                  <SectionCard icon={FiImage} title="Plant Image">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-sage/25 bg-sage/5 flex items-center justify-center">
                      {addForm.image ? (
                        <img src={addForm.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-forest/30 p-6 text-center">
                          <FiImage className="h-12 w-12" />
                          <span className="text-xs font-bold">No image yet</span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={addPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddPlantPhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => addPhotoInputRef.current?.click()}
                      disabled={addUploadingPhoto}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-sage/25 bg-sage/10 px-4 py-3 text-sm font-bold text-forest hover:bg-sage/20 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {addUploadingPhoto ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                      ) : (
                        <FiUpload className="h-4 w-4" />
                      )}
                      {addUploadingPhoto ? "Uploading…" : "Upload from Device"}
                    </button>

                    <div className="relative">
                      <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/30" />
                      <input
                        name="image"
                        type="url"
                        value={addForm.image}
                        onChange={handleAddPlantField}
                        placeholder="…or paste image URL"
                        className={addPlantInputClass + " pl-10"}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard icon={FiDroplet} title="Care Snapshot">
                    <div>
                      <label className={addPlantLabelClass}>💧 Watering</label>
                      <SuggestionInput
                        name="watering"
                        value={addForm.watering}
                        onChange={(val) => setAddForm((p) => ({ ...p, watering: val }))}
                        suggestions={SUGGESTIONS.watering}
                        placeholder="e.g. Every 2–3 weeks"
                        className={addPlantInputClass}
                      />
                    </div>
                    <div>
                      <label className={addPlantLabelClass}>☀️ Sunlight</label>
                      <SuggestionInput
                        name="sunlight"
                        value={addForm.sunlight}
                        onChange={(val) => setAddForm((p) => ({ ...p, sunlight: val }))}
                        suggestions={SUGGESTIONS.sunlight}
                        placeholder="e.g. Low to Bright Indirect"
                        className={addPlantInputClass}
                      />
                    </div>
                    <div>
                      <label className={addPlantLabelClass}>🌡️ Temperature</label>
                      <SuggestionInput
                        name="temperature"
                        value={addForm.temperature}
                        onChange={(val) => setAddForm((p) => ({ ...p, temperature: val }))}
                        suggestions={SUGGESTIONS.temperature}
                        placeholder="e.g. 15°C – 29°C"
                        className={addPlantInputClass}
                      />
                    </div>
                  </SectionCard>
                </div>

                {/* Right Column: Basic Info, Care Tips, Common Problems */}
                <div className="xl:col-span-2 space-y-6">
                  <SectionCard icon={FiInfo} title="Basic Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={addPlantLabelClass}>Plant Title *</label>
                        <input
                          name="title"
                          required
                          value={addForm.title}
                          onChange={handleAddPlantField}
                          placeholder="e.g. Snake Plant Laurentii"
                          className={addPlantInputClass}
                        />
                      </div>
                      <div>
                        <label className={addPlantLabelClass}>Scientific Name</label>
                        <input
                          name="scientificName"
                          value={addForm.scientificName}
                          onChange={handleAddPlantField}
                          placeholder="e.g. Sansevieria trifasciata"
                          className={addPlantInputClass}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className={addPlantLabelClass}>Category</label>
                        <CustomSelect
                          name="category"
                          value={addForm.category}
                          onChange={(val) => setAddForm((p) => ({ ...p, category: val }))}
                          options={CATEGORIES}
                          className={addPlantInputClass}
                        />
                      </div>
                      <div>
                        <label className={addPlantLabelClass}>Difficulty</label>
                        <CustomSelect
                          name="difficulty"
                          value={addForm.difficulty}
                          onChange={(val) => setAddForm((p) => ({ ...p, difficulty: val as "Easy" | "Medium" | "Hard" }))}
                          options={DIFFICULTIES}
                          className={`${addPlantInputClass} font-bold ${difficultyColor[addForm.difficulty]}`}
                          optionClassName={(opt) => difficultyColor[opt as "Easy" | "Medium" | "Hard"] || ""}
                        />
                      </div>
                      <div>
                        <label className={addPlantLabelClass}>Price (USD) *</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={addForm.price}
                          onChange={handleAddPlantField}
                          placeholder="29.99"
                          className={addPlantInputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={addPlantLabelClass}>
                        Short Description <span className="normal-case text-slate-400">(shown on card — max 120 chars)</span>
                      </label>
                      <input
                        name="short"
                        value={addForm.short}
                        onChange={handleAddPlantField}
                        maxLength={120}
                        placeholder="One-line summary shown under the plant name on cards…"
                        className={addPlantInputClass}
                      />
                      <p className="mt-1 text-right text-[10px] text-slate-400">{addForm.short.length}/120</p>
                    </div>

                    <div>
                      <label className={addPlantLabelClass}>Full Description</label>
                      <textarea
                        name="description"
                        value={addForm.description}
                        onChange={handleAddPlantField}
                        rows={5}
                        placeholder="Detailed overview — origin, toxicity, potting needs, growth habits…"
                        className={addPlantInputClass + " resize-none"}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard icon={FiSun} title="Detailed Care Tips">
                    <div className="space-y-3">
                      {addDetailedCare.map((tip, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-forest/10 text-[10px] font-black text-forest">
                            {i + 1}
                          </span>
                          <input
                            value={tip}
                            onChange={(e) => updateAddPlantCare(i, e.target.value)}
                            placeholder={`Care tip ${i + 1}…`}
                            className={addPlantInputClass}
                          />
                          {addDetailedCare.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddPlantCare(i)}
                              className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition-all cursor-pointer"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addAddPlantCare}
                      className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition-colors cursor-pointer"
                    >
                      <FiPlus className="h-3.5 w-3.5" /> Add Care Tip
                    </button>
                  </SectionCard>

                  <SectionCard icon={FiAlertTriangle} title="Common Problems">
                    <div className="space-y-4">
                      {addCommonProblems.map((p, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-sage/5 border border-sage/15 relative">
                          {addCommonProblems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddPlantProblem(i)}
                              className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:text-rose hover:bg-rose/10 transition-all cursor-pointer"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <div>
                            <label className={addPlantLabelClass}>Problem</label>
                            <input
                              value={p.problem}
                              onChange={(e) => updateAddPlantProblem(i, "problem", e.target.value)}
                              placeholder="e.g. Mushy leaves or yellowing base"
                              className={addPlantInputClass}
                            />
                          </div>
                          <div>
                            <label className={addPlantLabelClass}>Solution</label>
                            <input
                              value={p.solution}
                              onChange={(e) => updateAddPlantProblem(i, "solution", e.target.value)}
                              placeholder="e.g. Stop watering, improve drainage"
                              className={addPlantInputClass}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addAddPlantProblem}
                      className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition-colors cursor-pointer"
                    >
                      <FiPlus className="h-3.5 w-3.5" /> Add Problem
                    </button>
                  </SectionCard>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-sage/10">
                <button
                  type="button"
                  onClick={() => {
                    setAddForm({
                      title: "",
                      scientificName: "",
                      category: "Foliage",
                      short: "",
                      description: "",
                      price: "",
                      image: "",
                      difficulty: "Easy" as "Easy" | "Medium" | "Hard",
                      watering: "",
                      sunlight: "",
                      temperature: "",
                    });
                    setAddDetailedCare([""]);
                    setAddCommonProblems([{ problem: "", solution: "" }]);
                    setPlantToEdit(null);
                    setActiveTab("inventory");
                    sessionStorage.setItem("admin_active_tab", "inventory");
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-forest-dark/60 bg-white border border-sage/20 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-forest rounded-xl hover:bg-forest-dark shadow-sm shadow-forest/20 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                >
                  {plantToEdit ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <FiPlus className="h-4 w-4" />
                  )}
                  {addSubmitting ? (plantToEdit ? "Saving…" : "Adding…") : (plantToEdit ? "Save Changes" : "Add Plant")}
                </button>
              </div>
            </form>
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

      {/* Add/Edit Plant Submission Confirmation */}
      <ConfirmModal
        isOpen={addShowConfirm}
        title={plantToEdit ? "Save changes to this plant?" : "Add this plant?"}
        message={plantToEdit ? "This will update the plant catalog details immediately." : "This will publish the plant to the catalog immediately and it will be visible to all users."}
        confirmLabel={plantToEdit ? "Yes, Save Changes" : "Yes, Add Plant"}
        cancelLabel="Review Again"
        onConfirm={handleAddPlantConfirmSubmit}
        onCancel={() => setAddShowConfirm(false)}
      />

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
        isAdmin={true}
        onStatusUpdate={(orderId, status) => {
          handleOrderStatusUpdate(orderId, status);
          // Sync state locally to update details modal view immediately
          if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: status as any });
          }
        }}
      />
    </div>
  );
}
