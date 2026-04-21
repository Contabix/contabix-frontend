"use client";

import { useState } from "react";
import { X, Truck, Mail, Phone, MapPin, AlertCircle } from "lucide-react";

type Supplier = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Props = {
  supplier: Supplier;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditSupplierModal({
  supplier,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(supplier.name || "");
  const [email, setEmail] = useState(supplier.email || "");
  const [phone, setPhone] = useState(supplier.phone || "");
  const [address, setAddress] = useState(supplier.address || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError("Supplier name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isNew = !supplier.id;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier${isNew ? "" : `/${supplier.id}`}`,
        {
          method: isNew ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            address,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save supplier information");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {supplier.id ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Manage vendor contact and supply details.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="space-y-4">
            <Input 
              label="Supplier Name" 
              icon={<Truck size={16} />}
              value={name} 
              placeholder="e.g. Acme Corp"
              onChange={setName} 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Email Address" 
                icon={<Mail size={16} />}
                type="email"
                value={email} 
                placeholder="vendor@example.com"
                onChange={setEmail} 
              />
              <Input 
                label="Phone Number" 
                icon={<Phone size={16} />}
                value={phone} 
                placeholder="+91..."
                onChange={setPhone} 
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">
                Office Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-neutral-500">
                  <MapPin size={16} />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full business address..."
                  rows={3}
                  className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800/60 bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? "Saving..." : "Save Supplier"}
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
          className={`w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner`}
        />
      </div>
    </div>
  );
}