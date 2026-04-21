"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialYear } from "@/context/FinancialYearContext"; // 🟢 ADDED CONTEXT
import { 
  Building2, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  ArrowRight,
  CalendarDays, // 🟢 Added for UI
  Lock          // 🟢 Added for UI
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  
  // 🟢 FY Context & State
  const { startDate, endDate, setFinancialYear, isReady } = useFinancialYear();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // Sync local state when context loads
  useEffect(() => {
    if (isReady) {
      if (startDate) setStart(startDate);
      if (endDate) setEnd(endDate);
    }
  }, [isReady, startDate, endDate]);

  const handleSaveFY = () => {
    if (start && end) {
      setFinancialYear(start, end);
    }
  };

  const isFySet = !!(startDate && endDate);

  const handleNavigate = (path: string) => {
    if (!isAuthenticated) {
      router.push("/signup");
    } else {
      router.push(path);
    }
  };

  if (loading || !isReady) return null;

  const dashboardCards = [
    {
      title: "Company Profile",
      description: "Register & manage your company identity and bank details.",
      icon: Building2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      borderHover: "group-hover:border-amber-500/50",
      path: "/dashboard/company",
      requiresFY: false, // 🟢 Unlocked by default
    },
    {
      title: "Purchase Management",
      description: "Manage products, track incoming stock, and supplier bills.",
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      borderHover: "group-hover:border-blue-400/50",
      path: "/dashboard/purchase",
      requiresFY: true, // 🟢 Locked until FY is set
    },
    {
      title: "Sales Invoices",
      description: "Create GST-ready invoices, manage drafts, and track payments.",
      icon: FileText,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      borderHover: "group-hover:border-emerald-400/50",
      path: "/dashboard/invoices",
      requiresFY: true, // 🟢 Locked until FY is set
    },
    {
      title: "Business Reports",
      description: "Overview of customer, supplier, and inventory performance.",
      icon: BarChart3,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      borderHover: "group-hover:border-purple-400/50",
      path: "/dashboard/business",
      requiresFY: true, // 🟢 Locked until FY is set
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-10 px-6 space-y-12">
      
      {/* Header & FY Selector */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Welcome to <span className="text-amber-500">Contabix</span>
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Here's an overview of your business operations today.
          </p>
        </div>

        {/* 🟢 Inline Financial Year Filter */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 backdrop-blur-md shadow-xl w-full xl:w-auto">
          <div className="flex items-center gap-2 px-2 text-amber-500 w-full sm:w-auto justify-center">
            <CalendarDays size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider whitespace-nowrap">Active FY:</span>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="date" 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
            />
            <span className="text-neutral-600 font-medium">to</span>
            <input 
              type="date" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
            />
          </div>

          <button 
            onClick={handleSaveFY}
            disabled={!start || !end || (start === startDate && end === endDate)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black px-6 py-2 rounded-xl text-sm font-bold transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardCards.map((card, index) => {
          const isLocked = card.requiresFY && !isFySet;
          
          return (
            <ActionCard
              key={index}
              title={card.title}
              description={card.description}
              Icon={card.icon}
              color={card.color}
              bg={card.bg}
              borderHover={card.borderHover}
              onClick={() => handleNavigate(card.path)}
              locked={isLocked} // 🟢 Pass locked state
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

function ActionCard({
  title,
  description,
  Icon,
  color,
  bg,
  borderHover,
  onClick,
  locked,
}: {
  title: string;
  description: string;
  Icon: any;
  color: string;
  bg: string;
  borderHover: string;
  onClick: () => void;
  locked: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      className={`group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-left transition-all duration-300 flex flex-col justify-between min-h-[220px] ${
        locked 
          ? "opacity-50 cursor-not-allowed" 
          : `hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${borderHover}`
      }`}
    >
      {/* Subtle Background Glow Effect */}
      <div
        className={`absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full ${bg} blur-3xl opacity-40 ${
          !locked && "group-hover:opacity-80"
        } transition-opacity duration-500`}
      />

      <div>
        <div
          className={`w-14 h-14 rounded-xl ${bg} ${color} flex items-center justify-center mb-6 ring-1 ring-white/5 ${
            locked ? "grayscale" : ""
          }`}
        >
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2 tracking-wide">
          {title}
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-[90%]">
          {description}
        </p>
      </div>

      {/* Hover Action / Lock Indicator */}
      {locked ? (
        <div className="mt-8 flex items-center gap-2 text-sm font-medium text-rose-400 bg-rose-500/10 w-fit px-3 py-1.5 rounded-lg border border-rose-500/20">
          <Lock size={14} /> Set Financial Year Above
        </div>
      ) : (
        <div className="mt-8 flex items-center text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
          Open Module
          <ArrowRight
            size={16}
            className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          />
        </div>
      )}
    </button>
  );
}