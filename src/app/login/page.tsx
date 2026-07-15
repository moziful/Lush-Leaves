"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdErrorOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

import { useToast } from "@/context/ToastContext";

import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (credentials: typeof formData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Strict`;

      showToast(`Welcome back, ${data.user.name || "user"}!`, "success");

      if (data.user.role === "admin") {
        router.push("/items/manage");
      } else {
        router.push("/explore");
      }
      router.refresh();
    } catch (err: any) {
      const errMsg = err.message || "An unexpected error occurred.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyGoogleCredential = async (credential: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google verification failed.");
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Strict`;

      showToast(`Logged in successfully as ${data.user.name || "user"}!`, "success");

      if (data.user.role === "admin") {
        router.push("/items/manage");
      } else {
        router.push("/explore");
      }
      router.refresh();
    } catch (err: any) {
      const errMsg = err.message || "Google sign-in failed.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-sage/30 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-block text-3xl font-black tracking-wider">
            <span className="text-forest-dark">Lush<span className="text-forest">Leaves</span></span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your plants or start shopping
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 animate-fadeIn">
            <MdErrorOutline className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
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
          <div className="space-y-2">
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-forest py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-forest-dark active:scale-[0.98] disabled:opacity-50 shadow-md shadow-forest/10"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Or
          </span>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full max-w-[280px]">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  verifyGoogleCredential(credentialResponse.credential);
                }
              }}
              onError={() => {
                showToast("Google sign-in failed.", "error");
              }}
              theme="outline"
              size="large"
              shape="pill"
              width="280"
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-forest hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
