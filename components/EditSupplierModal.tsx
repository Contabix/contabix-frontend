"use client";

import { useState } from "react";
import { X, Truck, Mail, Phone, MapPin, AlertCircle, Hash, Building, Map } from "lucide-react";
import { GST_STATES } from "@/lib/gstStates";
import { getGSTStateCode } from "@/lib/gstStateCodes";

type Supplier = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // 🔥 Added to type
  gstin?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
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
  
  // 🔥 New state fields
  const [gstin, setGstin] = useState(supplier.gstin || "");
  const [city, setCity] = useState(supplier.city || "");
  const [state, setState] = useState(supplier.state || "");
  const [stateCode, setStateCode] = useState(supplier.stateCode || "");
  const [postalCode, setPostalCode] = useState(supplier.postalCode || "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStateChange = (val: string) => {
  setState(val);
  setStateCode(getGSTStateCode(val));
};
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
            gstin,
            city,
            state,
            stateCode,
            postalCode
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
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Core Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Supplier Name" icon={<Truck size={16} />} value={name} placeholder="e.g. Acme Corp" onChange={setName} />
              <Input label="GSTIN" icon={<Hash size={16} />} value={gstin} placeholder="22AAAAA0000A1Z5" onChange={setGstin} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email Address" icon={<Mail size={16} />} type="email" value={email} placeholder="vendor@example.com" onChange={setEmail} />
              <Input label="Phone Number" icon={<Phone size={16} />} value={phone} placeholder="+91..." onChange={setPhone} />
            </div>
          </div>

          <div className="border-t border-neutral-800/60" />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Location & Compliance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="City" icon={<Building size={16} />} value={city} placeholder="e.g. Mumbai" onChange={setCity} />
              <Input label="Postal/PIN Code" icon={<MapPin size={16} />} value={postalCode} placeholder="e.g. 400001" onChange={setPostalCode} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <StateSelector
    value={state}
    onChange={handleStateChange}
  />

  <Input
    label="State Code"
    icon={<Hash size={16} />}
    value={stateCode}
    placeholder="Auto-filled"
    onChange={setStateCode}
  />
</div>

            <div className="relative pt-2">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">
                Full Street Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-neutral-500">
                  <MapPin size={16} />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, building, floor..."
                  rows={2}
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

function Input({ label, value, onChange, icon, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode; type?: string; placeholder?: string; }) {
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
function StateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useState(() => {
    setQuery(value);
  });

  const filtered = GST_STATES.filter((state) =>
    state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">
        State
      </label>

      <input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        placeholder="Search state..."
        className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-neutral-800 border border-neutral-700 rounded-xl max-h-52 overflow-y-auto shadow-xl shadow-black/50 p-1 custom-scrollbar">
          {filtered.map((state) => (
            <button
              key={state}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(state);
                onChange(state);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 rounded-lg text-sm text-neutral-200 transition-colors"
            >
              {state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}