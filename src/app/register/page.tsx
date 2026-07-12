"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdErrorOutline } from "react-icons/md";
import { FiUser, FiCamera } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Profile Image Upload State
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // local preview
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    setError("");

    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to upload image.");
      }

      setUploadedImageUrl(resData.url);
    } catch (err: any) {
      setError(err.message || "Image upload failed. You can still register without an image.");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length === 0) {
      setError("Name is required.");
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 32) {
      setError("Password must be between 8 and 32 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(true);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Strict`;

      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-6 rounded-2xl border border-sage/30 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-block text-3xl font-black tracking-wider text-forest">
            Lush<span className="text-sage">Leaves</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Create Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Join our premium indoor plant platform
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 animate-fadeIn">
            <MdErrorOutline className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-sage bg-cream p-4 text-forest text-center font-medium animate-fadeIn">
            Registration successful! Redirecting to profile...
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" onSubmit={handleSubmit}>
          {/* Left side */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest" htmlFor="name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-4 h-5 w-5 text-forest/70" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-cream/30 py-3 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <MdEmail className="absolute left-4 h-5 w-5 text-forest/70" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="plantlover@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-cream/30 py-3 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <MdLock className="absolute left-4 h-5 w-5 text-forest/70" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={32}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-cream/30 py-3 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-forest/70 hover:text-forest"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="h-5 w-5" />
                  ) : (
                    <MdVisibility className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <MdLock className="absolute left-4 h-5 w-5 text-forest/70" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  maxLength={32}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-cream/30 py-3 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-forest/70 hover:text-forest"
                >
                  {showConfirmPassword ? (
                    <MdVisibilityOff className="h-5 w-5" />
                  ) : (
                    <MdVisibility className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest">
                Profile Photo (Optional)
              </label>
              <label
                htmlFor="profile-upload"
                className="group flex items-center gap-4 rounded-xl border border-dashed border-sage bg-cream/50 p-4 transition duration-200 hover:bg-sage/5 hover:border-forest cursor-pointer"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-inner">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-xl font-bold uppercase">
                      <FiCamera />
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    {uploadingImage
                      ? "Uploading image..."
                      : uploadedImageUrl
                        ? "Upload completed!"
                        : "Add profile picture"}
                  </p>
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                  <span
                    className="inline-block rounded-lg bg-forest/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-forest transition duration-200 group-hover:bg-forest group-hover:text-white"
                  >
                    {uploadedImageUrl ? "Change Photo" : "Choose File"}
                  </span>
                </div>
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-forest" htmlFor="role">
                Account Role (For Evaluation)
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-4 h-5 w-5 text-forest/70" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 pl-12 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15 appearance-none"
                >
                  <option value="user">Standard User (Plant Browser)</option>
                  <option value="admin">Administrator (Inventory Manager)</option>
                </select>
              </div>
            </div>
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex w-full items-center justify-center rounded-xl bg-forest py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-forest-dark active:scale-[0.98] disabled:opacity-50 shadow-md shadow-forest/10"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Register & Sign In"
                )}
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Or
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <FcGoogle className="h-5 w-5" />
                Continue with Google
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
