// inventory/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { 
  Package, 
  AlertTriangle, 
  Search, 
  ChevronDown, 
  Layers,
  Building2, 
  ArrowRight,
  CheckCircle2 // 🟢 ADDED: Fixed the crashing <HEALTHY /> bug
} from "lucide-react";
import { useFinancialYear } from "@/context/FinancialYearContext"; // 🟢 ADDED: Financial Year Hook

type Item = {
  id: string;
  name: string;
  sku: string;
  category: string;
  sold: number;
  unit: string;
  supplier?: { name: string };
  stock?: {
    quantity: number;
    lowStock: number;
  };
};

export default function InventoryPage() {
  const router = useRouter(); 
  const { startDate, endDate } = useFinancialYear(); // 🟢 ADDED: Extract the dates
  
  const [hasCompany, setHasCompany] = useState<boolean | null>(null); 
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (category) params.append("category", category);
    
    // 🟢 ADDED: Pass the financial year boundaries to the backend!
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/inventory?${params.toString()}`,
      { credentials: "include" }
    )
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company");
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, [search, category, startDate, endDate]); // 🟢 ADDED: Added dates to dependencies

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/categories`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company Profile");
        }
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        setHasCompany(true); 
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      })
      .catch((e) => {
        console.log(e);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (hasCompany === true) {
      const timeout = setTimeout(() => {
        load();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, category, load, hasCompany, startDate, endDate]); // 🟢 Make sure it refetches when FY changes

  const formatUnit = (u: string) => {
    const map: any = { PIECE: 'Pcs', KILOGRAM: 'Kg', GRAM: 'g', LITER: 'Litre', BOX: 'Box' };
    return map[u] || u;
  };

  /* ================= UI GATES ================= */

  if (hasCompany === null) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"></div>
      </div>
    );
  }

  if (hasCompany === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-500/5">
          <Building2 size={48} className="text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Set up your business first</h2>
        <p className="text-neutral-400 text-lg max-w-md mb-10 leading-relaxed">
          To manage inventory and track your products, InventoryPro needs your official business details and address.
        </p>
        <button 
          onClick={() => router.push('/dashboard/company')}
          className="flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-2xl font-bold hover:bg-amber-400 hover:scale-105 shadow-xl shadow-amber-500/20 transition-all duration-300"
        >
          Create Company Profile <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-500">Inventory</span> Dashboard
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Track stock levels, sales velocity, and product categories.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
            <Search size={18} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder:text-neutral-600"
              placeholder="Search products by name or SKU..."
            />
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-full w-full appearance-none bg-neutral-900/50 border border-neutral-800/60 px-4 py-3 pr-10 rounded-xl text-neutral-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl min-h-[400px]">
          
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 px-6 py-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/60 bg-neutral-900/30">
            <div className="col-span-2">Product</div>
            <div>SKU</div>
            <div>Category</div>
            <div>Supplier</div>
            <div className="text-center">Stock</div>
            <div className="text-center">Status</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-24 flex justify-center text-neutral-500">
              <div className="animate-pulse font-medium">Loading inventory...</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
              <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4">
                <Layers size={32} strokeWidth={1.5} />
              </div>
              <p className="text-lg">No products found.</p>
              <p className="text-sm mt-1 text-neutral-600">Try adjusting your search filters.</p>
            </div>
          )}

          {/* Table Rows */}
          {!loading && (
            <div className="divide-y divide-neutral-800/60">
              {items?.map((p) => {
                const qty = p.stock?.quantity ?? 0;
                const low = p.stock?.lowStock ?? 5;
                const isLow = qty <= low;

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-neutral-800/20 transition-colors duration-200 group"
                  >
                    {/* Product Name */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Package size={18} className="text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-neutral-500 mt-0.5">
                          {p.sold} units sold
                        </span>
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="text-neutral-400 font-mono text-sm truncate">
                      {p.sku}
                    </div>

                    {/* Category */}
                    <div className="text-neutral-300 truncate">
                      <span className="bg-neutral-800/50 px-2.5 py-1 rounded-md text-xs border border-neutral-700/50">
                        {p.category}
                      </span>
                    </div>

                    {/* Supplier */}
                    <div className="text-neutral-400 text-sm truncate">
                      {p.supplier?.name ?? "-"}
                    </div>

                    {/* Stock Quantity */}
                    <div className="text-center font-medium">
                      <span className={isLow ? "text-amber-400" : "text-white"}>
                        {qty}
                      </span>
                      <span className="text-neutral-500 text-xs ml-1 font-normal">
                        {formatUnit(p.unit)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                      {isLow ? (
                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                          <AlertTriangle size={12} strokeWidth={3} />
                          LOW STOCK
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          HEALTHY
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}