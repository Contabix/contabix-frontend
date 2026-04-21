"use client";

import { useState, useEffect } from "react";
import { Search, FileText, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // 🔥 Added

type LedgerAccount = {
  id: string; 
  name: string;
  type: string;
  balance: number;
  lastUpdated: string;
};

export default function LedgerDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth(); // 🔥 Added
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 Only redirect if auth has finished loading and user is not logged in
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchLedgers = async () => {
      if (!isAuthenticated) return; // Wait for auth

      try {
        const res = await fetch("http://localhost:3000/ledger/summaries", {
          method: "GET",
          credentials: "include", 
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Backend refused connection. Status: ${res.status}`);
        }

        const data = await res.json();
        setAccounts(data);
      } catch (error: any) {
        setErrorMsg(`Network Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) fetchLedgers();
  }, [router, isAuthenticated, authLoading]);

  if (authLoading) return null; // Prevent flickering

  const filteredAccounts = accounts.filter(acc => 
    acc.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8">
      {/* Rest of your UI remains exactly the same... */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            <span className="text-amber-500">Ledger</span> Accounts
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Real-time financial balances and automated T-Accounts.
          </p>
        </div>

        <Link href="/dashboard/ledger/manual-entry">
          <button className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300">
            <FileText size={18} strokeWidth={2.5} />
            Manual Entry
          </button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
          <Search size={18} className="text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search ledger accounts by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white w-full placeholder:text-neutral-600"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 shadow-inner">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-xl min-h-[400px]">
        {loading && (
          <div className="h-full flex items-center justify-center py-20">
            <div className="animate-pulse text-neutral-500 font-medium">
              Connecting to Ledger Engine...
            </div>
          </div>
        )}

        {!loading && !errorMsg && filteredAccounts.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
            <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4">
              <BookOpen size={32} strokeWidth={1.5} />
            </div>
            <p className="text-lg">No ledger activity found.</p>
            <p className="text-sm mt-1 text-neutral-600">Create an invoice or purchase to generate ledgers.</p>
          </div>
        )}

        {!loading && filteredAccounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((acc) => {
              const isDebit = (acc.balance || 0) >= 0;
              const balanceStr = Math.abs(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
              
              return (
                <div 
                  key={acc.id} 
                  className="group relative bg-neutral-800/40 border border-neutral-700/50 hover:border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 text-white flex items-center justify-center font-bold text-lg shadow-inner border border-neutral-600/30 group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black group-hover:border-amber-400 transition-all duration-500">
                        {acc.name?.charAt(0).toUpperCase() || "L"}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg tracking-tight line-clamp-1">{acc.name}</h3>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          Updated {acc.lastUpdated ? new Date(acc.lastUpdated).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric'}) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {acc.type}
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    <p className="text-sm text-neutral-500 font-medium">Closing Balance</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold text-white tracking-tight">₹{balanceStr}</h2>
                      <span className={`text-sm font-bold mb-1 px-1.5 py-0.5 rounded ${isDebit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isDebit ? 'Dr' : 'Cr'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-700/50 pt-4 mt-auto">
                    <Link href={`/dashboard/ledger/${acc.type}/${acc.id}`}>
                      <button className="w-full flex items-center justify-between text-neutral-400 hover:text-amber-400 text-sm font-medium transition-colors group/btn">
                        View Full Statement
                        <ArrowRight size={16} className="opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}