"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // 🔥 Added

export default function LedgerStatementPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth(); // 🔥 Added
  const type = params.type as string;
  const id = params.id as string;

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 Auth Guard
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchStatement = async () => {
      if (!isAuthenticated) return;

      try {
        const res = await fetch(`http://localhost:3000/ledger/statement?type=${type}&id=${id}`, {
          method: "GET",
          credentials: "include", 
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch statement. Status: ${res.status}`);
        }

        const data = await res.json();
        setEntries(data);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (type && id && isAuthenticated) {
      fetchStatement();
    }
  }, [type, id, router, isAuthenticated, authLoading]);

  if (authLoading) return null;

  const currentBalance = entries.length > 0 ? entries[entries.length - 1].runningBalance : 0;
  const isDebit = currentBalance >= 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8">
      {/* Rest of UI remains same... */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.back()} 
            className="mt-1.5 p-2 bg-neutral-900/80 border border-neutral-800/60 hover:bg-neutral-800 hover:border-neutral-700 rounded-xl transition-all shadow-inner"
          >
            <ArrowLeft size={20} className="text-neutral-400" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Account <span className="text-amber-500">Statement</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-lg capitalize">
              {type?.toLowerCase()} Ledger
            </p>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 bg-neutral-900/50 border border-neutral-800/60 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 px-5 py-2.5 rounded-xl font-medium transition-all shadow-inner">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 shadow-inner">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl min-h-[400px] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-neutral-900/30 border-b border-neutral-800/60 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-5 whitespace-nowrap">Date</th>
                <th className="px-6 py-5">Particulars</th>
                <th className="px-6 py-5 whitespace-nowrap">Voucher Type</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">Debit (₹)</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">Credit (₹)</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="animate-pulse text-neutral-500 font-medium">Loading ledger statement...</div>
                  </td>
                </tr>
              ) : entries.map((entry) => {
                const isEntryDebit = entry.runningBalance >= 0;
                return (
                  <tr key={entry.id} className="hover:bg-neutral-800/20 transition-colors duration-200">
                    <td className="px-6 py-4 text-neutral-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString("en-IN", { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-200 flex flex-col items-start gap-1.5">
                      <span className="line-clamp-2">{entry.particular}</span>
                      {entry.voucherType === 'MANUAL' && (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Manual Entry
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                      {entry.voucherId?.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 whitespace-nowrap">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-400 whitespace-nowrap">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-white tracking-tight">
                          ₹{Math.abs(entry.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isEntryDebit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isEntryDebit ? 'Dr' : 'Cr'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}