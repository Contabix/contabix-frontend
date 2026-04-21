"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // 🟢 ADDED: For routing
import { 
  Search, 
  Users, 
  ChevronDown, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  Pencil, 
  Trash2,
  ArrowRight // 🟢 ADDED: For onboarding UI
} from "lucide-react";
import CreateCustomerModal from "@/components/CreateCustomerModal";

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export default function CustomersPage() {
  const router = useRouter(); // 🟢 ADDED

  const [hasCompany, setHasCompany] = useState<boolean | null>(null); // 🟢 THE GATEKEEPER STATE
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  /* ================= FETCH ================= */

  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (status !== "ALL") params.append("status", status);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers?${params.toString()}`,
        { credentials: "include" }
      );

      // 🛑 THE BOUNCER: If backend CompanyGuard rejects us, flip the state!
      if (res.status === 403) {
        setHasCompany(false);
        return;
      }

      setHasCompany(true); // ✅ Passed the Guard!
      const data = await res.json();

      // ✅ Array Safety Check (Protects against .map crashes!)
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* ================= DELETE ================= */

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI GATES ================= */

  // ⏳ 1. Loading state while checking with backend Guard
  if (hasCompany === null) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"></div>
      </div>
    );
  }

  // 🛑 2. Blocked by Guard! Show the Onboarding UI
  if (hasCompany === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-500/5">
          <Building2 size={48} className="text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Set up your business first</h2>
        <p className="text-neutral-400 text-lg max-w-md mb-10 leading-relaxed">
          To manage your client directory and contact details, InventoryPro needs your official business details.
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
      {/* CREATE MODAL */}
      {showCreate && (
        <CreateCustomerModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            fetchCustomers();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {editCustomer && (
        <CreateCustomerModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSaved={() => {
            setEditCustomer(null);
            fetchCustomers();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-500">Customer</span> Management
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Manage your client directory and contact details.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Customer
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
            <Search size={18} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, email, or company..."
              className="bg-transparent outline-none text-white w-full placeholder:text-neutral-600"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-full appearance-none bg-neutral-900/50 border border-neutral-800/60 px-4 py-3 pr-10 rounded-xl text-neutral-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Cards Container */}
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-xl min-h-[400px]">
          
          {loading && (
            <div className="h-full flex items-center justify-center py-20">
              <div className="animate-pulse text-neutral-500 font-medium">
                Loading customers...
              </div>
            </div>
          )}

          {!loading && customers.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
              <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4">
                <Users size={32} strokeWidth={1.5} />
              </div>
              <p className="text-lg">No customers found.</p>
              <p className="text-sm mt-1 text-neutral-600">Try adjusting your search or add a new customer.</p>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="group relative bg-neutral-800/40 border border-neutral-700/50 hover:border-amber-500/30 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  {/* Top: Avatar & Name */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg tracking-tight line-clamp-1">
                          {c.name}
                        </p>
                        {c.companyName && (
                          <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-0.5">
                            <Building2 size={14} />
                            <span className="line-clamp-1">{c.companyName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase ${
                        c.status === "INACTIVE"
                          ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {c.status ?? "ACTIVE"}
                    </span>
                  </div>

                  {/* Middle: Contact Info */}
                  <div className="text-sm text-neutral-400 space-y-2.5 mt-2">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-neutral-500" />
                      <span className="truncate">{c.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-neutral-500" />
                      <span>{c.phone || "No phone provided"}</span>
                    </div>
                  </div>

                  {/* Bottom: Actions */}
                  <div className="flex justify-end gap-2 text-sm border-t border-neutral-700/50 pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => setEditCustomer(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCustomer(c.id)}
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