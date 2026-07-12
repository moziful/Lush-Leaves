"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  FiMenu, 
  FiX, 
  FiPlus, 
  FiSettings, 
  FiHome, 
  FiCompass, 
  FiInfo, 
  FiBookOpen 
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";

// Inline RoleBadge component matching LushLeaves aesthetics
function RoleBadge({ role }: { role: string }) {
  const isColor =
    role === "admin"
      ? "bg-forest/10 text-forest border-forest/20"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isColor}`}
    >
      {role}
    </span>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    email: string;
    role: string;
    name?: string;
    imageUrl?: string;
  } | null>(null);

  useEffect(() => {
    // Read user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const baseNavItems = [
    { href: "/", label: "Home", icon: <FiHome className="text-lg" /> },
    { href: "/explore", label: "Explore Plants", icon: <FiCompass className="text-lg" /> },
    { href: "/about", label: "About Us", icon: <FiInfo className="text-lg" /> },
    { href: "/care-guide", label: "Care Guide", icon: <FiBookOpen className="text-lg" /> },
  ];

  const navItems = user && user.role === "admin"
    ? [
        ...baseNavItems,
        { href: "/items/add", label: "Add Plant", icon: <FiPlus className="text-lg" /> },
        { href: "/items/manage", label: "Dashboard", icon: <FiSettings className="text-lg" /> },
      ]
    : baseNavItems;

  const linkClass = (href: string) => {
    const isActive = pathname === href;
    return `px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 border ${
      isActive
        ? "bg-forest/5 text-forest border-forest/10 shadow-sm"
        : "border-transparent text-slate-500 hover:text-forest hover:bg-slate-50"
    }`;
  };

  const getInitials = (name = "") => {
    const displayName = name || user?.email || "";
    if (!displayName) return "U";
    return displayName
      .split("@")[0]
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-2xl font-black tracking-wider text-forest shrink-0">
            Lush<span className="text-sage">Leaves</span>
          </Link>

          {/* Desktop Nav Links & Auth (Grouped in a single pill container separated by a vertical line) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-100/80">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1.5" />

            <div className="flex items-center pl-1">
              {user ? (
                <div className="flex items-center gap-2 group relative mr-1">
                  <button className="flex items-center gap-2 focus:outline-none cursor-pointer">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.name || user.email}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-forest/30"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 ring-2 ring-forest/20">
                        <span className="text-xs font-black text-forest">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-xs font-bold text-slate-800">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu on Hover */}
                  <div className="absolute top-full right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col gap-3">
                    <div className="flex flex-col border-b border-slate-100 pb-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {user.name || user.email.split("@")[0]}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {user.email}
                      </span>
                      <div className="mt-2">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-2 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-500/20 cursor-pointer"
                    >
                      <MdLogout className="text-sm" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-600 hover:text-forest transition-colors px-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white shadow-md shadow-forest/10 transition-all hover:bg-forest-dark"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-forest focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-cream px-4 py-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col gap-1.5 bg-slate-100/50 p-2 rounded-xl border border-slate-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`${linkClass(item.href)} w-full py-3`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <hr className="border-slate-100 my-2" />
          
          {user ? (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.name || user.email}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-forest/30"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 ring-2 ring-forest/20">
                    <span className="text-xs font-black text-forest">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex flex-col items-start">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-sm font-black text-red-600 transition-all duration-200 hover:bg-red-500/20 cursor-pointer"
              >
                <MdLogout className="text-lg" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-lg bg-forest py-2 text-center text-sm font-semibold text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
