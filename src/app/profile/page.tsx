"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiEdit2,
  FiX,
  FiSave,
  FiMail,
  FiUser,
  FiShield,
  FiCalendar,
  FiImage,
  FiCamera,
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import RoleBadge from "@/components/RoleBadge";
import ConfirmModal from "@/components/ConfirmModal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Pre-populate from localStorage immediately so UI isn't blank
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const cached = JSON.parse(storedUser);
        setProfile((prev) => prev ?? {
          id: cached.id || "",
          name: cached.name || "",
          email: cached.email || "",
          role: cached.role || "user",
          imageUrl: cached.imageUrl || "",
          createdAt: cached.createdAt,
        });
        setEditName(cached.name || "");
        setEditImageUrl(cached.imageUrl || "");
      } catch { /* ignore */ }
    }

    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditName(data.name);
          setEditImageUrl(data.imageUrl);
        } else if (res.status === 401) {
          router.replace("/login");
        }
      } catch {
        setErrorMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleDiscard = () => {
    if (profile) {
      setEditName(profile.name);
      setEditImageUrl(profile.imageUrl);
    }
    setIsEditing(false);
    setErrorMessage("");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setEditImageUrl(data.url);
      } else {
        setErrorMessage(data.message || "Image upload failed.");
      }
    } catch {
      setErrorMessage("Network error during photo upload.");
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleSaveRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setIsSaving(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, imageUrl: editImageUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        // Update localStorage so Navbar reflects instantly
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, name: updated.name, imageUrl: updated.imageUrl })
        );
        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Failed to save changes.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/");
  };

  const getInitials = (name = "", email = "") => {
    const displayName = name || email;
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return displayName.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <p className="text-sm font-bold text-forest">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-sage/15 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
            My <span className="text-forest">Profile</span>
          </h1>
          <p className="mt-1.5 text-sm text-forest/60 font-medium">
            Manage your account details and preferences.
          </p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl bg-forest/10 border border-forest/20 px-4 py-3">
            <span className="text-xs font-extrabold text-forest">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <span className="text-xs font-extrabold text-red-600">{errorMessage}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-sage/20 shadow-sm p-6 flex flex-col items-center text-center gap-4">
            <div className="relative">
              {(isEditing ? editImageUrl : profile.imageUrl) ? (
                <Image
                  src={isEditing ? editImageUrl : profile.imageUrl}
                  alt={profile.name || profile.email}
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-forest/20"
                  onError={() => setEditImageUrl("")}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-forest/10 ring-4 ring-forest/20">
                  <span className="text-2xl font-black text-forest">
                    {getInitials(profile.name, profile.email)}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    title="Change profile photo"
                    className="absolute -bottom-1 -right-1 bg-forest text-white rounded-full p-1.5 shadow-md hover:bg-forest-dark transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingPhoto
                      ? <span className="block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <FiCamera className="h-3 w-3" />}
                  </button>
                </>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-forest-dark">
                {profile.name || profile.email.split("@")[0]}
              </p>
              <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
            </div>
            <RoleBadge role={profile.role} />
            <hr className="w-full border-sage/15" />
            <div className="flex items-center gap-2 text-xs text-forest-dark/60 font-medium">
              <FiCalendar className="text-forest shrink-0" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-black text-red-600 hover:bg-red-100 transition-all cursor-pointer mt-2 active:scale-[0.98]"
            >
              <MdLogout className="text-sm" />
              Sign Out
            </button>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-sage/20 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-sage/10 bg-sage/5">
              <div>
                <h2 className="text-sm font-black text-forest-dark uppercase tracking-wider">
                  Account Details
                </h2>
                <p className="text-[11px] text-forest-dark/45 font-medium mt-0.5">
                  {isEditing ? "You are in editing mode" : "Click the pencil to edit your profile"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleDiscard}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-forest-dark/70 bg-white border border-sage/20 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <FiX className="h-3.5 w-3.5" /> Discard
                    </button>
                    <button
                      onClick={handleSaveRequest}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-forest rounded-xl hover:bg-forest-dark transition-all cursor-pointer shadow-md shadow-forest/10 disabled:opacity-60 active:scale-[0.97]"
                    >
                      <FiSave className="h-3.5 w-3.5" />
                      {isSaving ? "Saving…" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-forest bg-forest/10 border border-forest/15 rounded-xl hover:bg-forest/15 transition-all cursor-pointer"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest-dark/40">
                  <FiUser className="text-forest" /> Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full rounded-xl border border-sage/25 bg-cream px-4 py-3 text-sm font-bold text-forest-dark outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                ) : (
                  <p className="text-sm font-bold text-forest-dark px-1">
                    {profile.name || <span className="text-forest-dark/40 italic">No name set</span>}
                  </p>
                )}
              </div>
              <hr className="border-sage/10" />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest-dark/40">
                  <FiMail className="text-forest" /> Email Address
                  <span className="text-[10px] normal-case font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">Read Only</span>
                </label>
                <p className="text-sm font-bold text-forest-dark px-1">{profile.email}</p>
              </div>
              <hr className="border-sage/10" />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest-dark/40">
                  <FiShield className="text-forest" /> Account Role
                  <span className="text-[10px] normal-case font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">Read Only</span>
                </label>
                <div className="px-1">
                  <RoleBadge role={profile.role} />
                </div>
              </div>
              <hr className="border-sage/10" />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest-dark/40">
                  <FiImage className="text-forest" /> Profile Photo URL
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="w-full rounded-xl border border-sage/25 bg-cream px-4 py-3 text-sm font-bold text-forest-dark outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/15"
                  />
                ) : (
                  <p className="text-sm font-bold text-forest-dark px-1 break-all">
                    {profile.imageUrl || <span className="text-forest-dark/40 italic">No photo URL set</span>}
                  </p>
                )}
              </div>
              <hr className="border-sage/10" />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-forest-dark/40">
                  <FiCalendar className="text-forest" /> Member Since
                </label>
                <p className="text-sm font-bold text-forest-dark px-1">
                  {formatDate(profile.createdAt)}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Save Profile Changes?"
        message="Are you sure you want to update your profile information? This will be reflected across the site immediately."
        confirmLabel="Yes, Save Changes"
        cancelLabel="Go Back"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
