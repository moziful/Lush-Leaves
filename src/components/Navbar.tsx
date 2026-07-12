"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiX, FiLogOut, FiPlus, FiSettings } from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Plants", href: "/explore" },
    { name: "About Us", href: "/about" },
    { name: "Care Guide", href: "/care-guide" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-2xl font-black tracking-wider text-forest">
            Lush<span className="text-sage">Leaves</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1.5 text-sm font-bold transition-colors duration-200 ${isActive ? "text-forest" : "text-slate-500 hover:text-forest"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-forest" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <>
                    <Link
                      href="/items/add"
                      className="flex items-center gap-1.5 rounded-lg border border-forest px-3.5 py-1.5 text-xs font-semibold text-forest transition-all hover:bg-forest/5"
                    >
                      <FiPlus /> Add Plant
                    </Link>
                    <Link
                      href="/items/manage"
                      className="flex items-center gap-1.5 rounded-lg bg-forest px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-forest-dark"
                    >
                      <FiSettings /> Dashboard
                    </Link>
                  </>
                )}
                <span className="text-xs text-slate-500 max-w-[120px] truncate" title={user.email}>
                  {user.email.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-terracotta transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-forest transition-colors"
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

          {/* Mobile Menue */}
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-semibold ${pathname === link.href ? "bg-forest/5 text-forest" : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-100 my-2" />
          {user ? (
            <div className="space-y-2 px-3">
              <div className="text-xs text-slate-400 pb-1">Logged in as {user.email}</div>
              {user.role === "admin" && (
                <>
                  <Link
                    href="/items/add"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg py-2 text-sm font-semibold text-forest"
                  >
                    <FiPlus /> Add Plant
                  </Link>
                  <Link
                    href="/items/manage"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg py-2 text-sm font-semibold text-forest"
                  >
                    <FiSettings /> Admin Dashboard
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg py-2 text-sm font-semibold text-terracotta"
              >
                <FiLogOut /> Logout
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
