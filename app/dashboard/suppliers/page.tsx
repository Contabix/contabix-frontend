"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Truck, 
  ChevronDown, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Pencil, 
  Trash2,
  Building2, 
  ArrowRight 
} from "lucide-react";
import EditSupplierModal from "@/components/EditSupplierModal";

type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export default function SuppliersPage() {
  const router = useRouter();

  const [hasCompany, setHasCompany] = useState<boolean | null>(null); // 🟢 THE GATEKEEPER
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  /* ================= 1. THE BOUNCER ================= */
  // We hit the invoice bootstrap first because we KNOW it is guarded correctly!
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/bootstrap`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company Profile");
        }
        if (!r.ok) throw new Error("Failed to fetch guard");
        return r.json();
      })
      .then(() => {
        setHasCompany(true); // ✅ Passed the Guard!
      })
      .catch((e) => console.log(e));
  }, []);

  /* ================= 2. THE FETCHER ================= */
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase/suppliers/list`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only run the fetcher IF the bouncer approved us
  useEffect(() => {
    if (hasCompany === true) {
      fetchSuppliers();
    }
  }, [hasCompany, fetchSuppliers]);

  /* ================= DELETE ================= */

  const deleteSupplier = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supplier/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTER ================= */

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();

    const matchesSearch =
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q);

    const matchesStatus =
      status === "ALL" || (s.status ?? "ACTIVE") === status;

    return matchesSearch && matchesStatus;
  });

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
          To manage your vendors and supply chain contacts, InventoryPro needs your official business details.
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
      {editing && (
        <EditSupplierModal
          supplier={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchSuppliers();
          }}
        />
      )}

      {showCreate && (
        <EditSupplierModal
          supplier={{ name: "" } as Supplier}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            fetchSuppliers();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-500">Supplier</span> Management
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Manage your vendors and supply chain contacts.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Supplier
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
            <Search size={18} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers by name, email, or phone..."
              className="bg-transparent outline-none text-white w-full placeholder:text-neutral-600"
            />
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-full w-full appearance-none bg-neutral-900/50 border border-neutral-800/60 px-4 py-3 pr-10 rounded-xl text-neutral-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-xl min-h-[400px]">
          
          {loading && (
            <div className="h-full flex items-center justify-center py-20">
              <div className="animate-pulse text-neutral-500 font-medium">
                Loading suppliers...
              </div>
            </div>
          )}

          {!loading && filteredSuppliers.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
              <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4">
                <Truck size={32} strokeWidth={1.5} />
              </div>
              <p className="text-lg">No suppliers found.</p>
              <p className="text-sm mt-1 text-neutral-600">Try adjusting your search or add a new supplier.</p>
            </div>
          )}

          {!loading && filteredSuppliers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  className="group relative bg-neutral-800/40 border border-neutral-700/50 hover:border-amber-500/30 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg tracking-tight line-clamp-1">
                          {s.name}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase ${
                        s.status === "INACTIVE"
                          ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {s.status ?? "ACTIVE"}
                    </span>
                  </div>

                  <div className="text-sm text-neutral-400 space-y-2.5 mt-2">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-neutral-500 flex-shrink-0" />
                      <span className="truncate">{s.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-neutral-500 flex-shrink-0" />
                      <span>{s.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-neutral-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">
                        {s.address || "No address provided"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-sm border-t border-neutral-700/50 pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => setEditing(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSupplier(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}