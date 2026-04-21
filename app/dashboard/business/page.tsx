"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Package, 
  Truck, 
  BookOpen, 
  ArrowRight 
} from "lucide-react";

export default function BusinessPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const handleNavigate = (path: string) => {
    if (!isAuthenticated) {
      router.push("/signup");
    } else {
      router.push(path);
    }
  };

  if (loading) return null;

  const businessCards = [
    {
      title: "Customer List",
      description: "View & manage your customer directory and contact details.",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      borderHover: "group-hover:border-purple-400/50",
      path: "/dashboard/customers",
    },
    {
      title: "Product Inventory",
      description: "View & manage your product catalog, stock levels, and pricing.",
      icon: Package,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      borderHover: "group-hover:border-rose-400/50",
      path: "/dashboard/inventory",
    },
    {
      title: "Supplier List",
      description: "View & manage your vendors and supply chain contacts.",
      icon: Truck,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      borderHover: "group-hover:border-orange-400/50",
      path: "/dashboard/suppliers",
    },
    {
      title: "General Ledger",
      description: "Maintain and track all automated accounting ledger accounts.",
      icon: BookOpen,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      borderHover: "group-hover:border-pink-400/50",
      path: "/dashboard/ledger",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-10 px-6 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            <span className="text-amber-500">Business</span> Reports
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Manage your core business data and accounting.
          </p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {businessCards.map((card, index) => (
          <ActionCard
            key={index}
            title={card.title}
            description={card.description}
            Icon={card.icon}
            color={card.color}
            bg={card.bg}
            borderHover={card.borderHover}
            onClick={() => handleNavigate(card.path)}
          />
        ))}
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
}: {
  title: string;
  description: string;
  Icon: any;
  color: string;
  bg: string;
  borderHover: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${borderHover} flex flex-col justify-between min-h-[220px]`}
    >
      {/* Subtle Background Glow Effect */}
      <div
        className={`absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full ${bg} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-500`}
      />

      <div>
        <div
          className={`w-14 h-14 rounded-xl ${bg} ${color} flex items-center justify-center mb-6 ring-1 ring-white/5`}
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

      {/* Hover Action Indicator */}
      <div className="mt-8 flex items-center text-sm font-medium text-neutral-500 group-hover:text-white transition-colors">
        Open Module
        <ArrowRight
          size={16}
          className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        />
      </div>
    </button>
  );
}