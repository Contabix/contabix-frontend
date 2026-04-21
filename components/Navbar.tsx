"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Package, LogOut, UserCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth(); // 👈 IMPORTANT

  const handleLogout = async () => {
    await logout();              // 👈 updates context state
    router.replace("/login");    // 👈 force navigation
  };

  if (loading) return null;

  // 🔥 THE FIX: Prioritize the real Database Name first!
  const username = user?.displayName 
    || user?.firstName 
    || (user?.email ? user.email.split('@')[0] : "User");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800/60 transition-all duration-300">
      <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <Package size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Conta<span className="text-amber-500">bix</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 shadow-inner">
                <UserCircle size={18} className="text-amber-500" />
                <span className="text-sm font-medium text-neutral-200 capitalize pr-1">
                  Hello, {username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all duration-300"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              className="bg-amber-500 hover:bg-amber-400 text-black text-sm px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
}