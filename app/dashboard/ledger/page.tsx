// app/dashboard/ledger/page.tsx
import Link from "next/link";
import { Wrench, ArrowLeft, Hammer } from "lucide-react";

export default function LedgerMaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      
      {/* Icon Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
        <div className="relative h-24 w-24 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 shadow-2xl">
          <Wrench size={48} strokeWidth={1.5} />
          {/* Small accent icon */}
          <div className="absolute -bottom-2 -right-2 bg-[#050505] p-2 rounded-xl border border-neutral-800 text-neutral-400">
            <Hammer size={20} />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
        Ledger Module is <span className="text-amber-500">Under Construction</span>
      </h1>
      
      <p className="text-neutral-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
        We're currently rewiring the financial engines and upgrading the general ledger systems. This section will be unlocked soon!
      </p>

      {/* Action Button */}
      <Link 
        href="/dashboard/company" 
        className="group inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3.5 rounded-2xl border border-neutral-800 transition-all font-medium hover:border-neutral-700"
      >
        <ArrowLeft size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
        Back to Dashboard
      </Link>

    </div>
  );
}