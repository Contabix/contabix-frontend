"use client";

import { useEffect, useState } from "react";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Hash, 
  Activity, 
  ChevronDown 
} from "lucide-react";

type Customer = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export default function CreateCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer?: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    taxId: "",
    status: "ACTIVE",
  });

  /* ================= PREFILL FOR EDIT ================= */

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        company: customer.company ?? "",
        address: customer.address ?? "",
        city: customer.city ?? "",
        country: customer.country ?? "",
        postalCode: customer.postalCode ?? "",
        taxId: customer.taxId ?? "",
        status: customer.status ?? "ACTIVE",
      });
    }
  }, [customer]);

  /* ================= SAVE ================= */

  const save = async () => {
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers${customer ? `/${customer.id}` : ""}`,
        {
          method: customer ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) onSaved();
    } catch (error) {
      console.error("Failed to save customer:", error);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {customer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Manage client profiles and contact information.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Basic Information</h3>
            <Input 
              label="Full Name *" 
              icon={<User size={16} />}
              value={form.name} 
              placeholder="e.g. John Doe"
              onChange={(v) => setForm({ ...form, name: v })} 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Email Address" 
                icon={<Mail size={16} />}
                type="email"
                value={form.email || ""} 
                placeholder="john@example.com"
                onChange={(v) => setForm({ ...form, email: v })} 
              />
              <Input 
                label="Phone Number" 
                icon={<Phone size={16} />}
                value={form.phone || ""} 
                placeholder="+91..."
                onChange={(v) => setForm({ ...form, phone: v })} 
              />
            </div>
          </section>

          <div className="border-t border-neutral-800/60" />

          {/* Section 2: Company & Tax */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Business Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Company Name" 
                icon={<Building2 size={16} />}
                value={form.company || ""} 
                placeholder="Optional"
                onChange={(v) => setForm({ ...form, company: v })} 
              />
              <Input 
                label="GSTIN / Tax ID" 
                icon={<Hash size={16} />}
                value={form.taxId || ""} 
                placeholder="e.g. 07AAAAA0000A1Z5"
                onChange={(v) => setForm({ ...form, taxId: v })} 
              />
            </div>
          </section>

          <div className="border-t border-neutral-800/60" />

          {/* Section 3: Address & Status */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Location & Status</h3>
            <Input 
              label="Street Address" 
              icon={<MapPin size={16} />}
              value={form.address || ""} 
              placeholder="Full address details"
              onChange={(v) => setForm({ ...form, address: v })} 
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input 
                label="City" 
                value={form.city || ""} 
                onChange={(v) => setForm({ ...form, city: v })} 
              />
              <Input 
                label="Country" 
                value={form.country || ""} 
                onChange={(v) => setForm({ ...form, country: v })} 
              />
              <Input 
                label="Postal Code" 
                value={form.postalCode || ""} 
                onChange={(v) => setForm({ ...form, postalCode: v })} 
              />
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Account Status</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  <Activity size={16} />
                </div>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-10 py-2.5 text-white transition-all outline-none shadow-inner cursor-pointer appearance-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800/60 bg-neutral-900/50 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? "Saving..." : customer ? "Update Profile" : "Save Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER INPUT COMPONENT ================= */

function Input({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-neutral-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner`}
        />
      </div>
    </div>
  );
}