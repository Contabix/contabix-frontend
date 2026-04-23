"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getGSTStateCode } from "@/lib/gstStateCodes";
import { GST_STATES } from "@/lib/gstStates";
import { useAuth } from "@/hooks/useAuth"; 
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  UserCircle, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function CompanyPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, isSyncing } = useAuth(); 

  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [companyExists, setCompanyExists] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    businessCategory: "",
    cin: "",
    pan: "",
    gstin: "",
    email: "",
    phone: "",
    website: "",

    addressLine: "",
    city: "",
    state: "",
    stateCode: "",
    pincode: "",
    country: "India",

    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "state") {
        updated.stateCode = getGSTStateCode(value);
      }
      return updated;
    });

    setIsDirty(true);
    setSuccess(false);
    setError(null);
  };

  /* ===============================
      LOAD EXISTING COMPANY
     =============================== */
  useEffect(() => {
    // 🔥 Auth Guard: Wait until loading and syncing are fully complete
    if (authLoading || isSyncing) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchCompany = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const text = await res.text();
        if (!text) {
          setLoading(false);
          return;
        }

        const data = JSON.parse(text);
        if (data) {
          setCompanyExists(true);
          setForm({
            name: data.name ?? "",
            type: data.type ?? "",
            businessCategory: data.businessCategory ?? "",
            cin: data.cin ?? "",
            pan: data.pan ?? "",
            gstin: data.gstin ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            website: data.website ?? "",

            addressLine: data.addressLine ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            stateCode: data.stateCode ?? "",
            pincode: data.pincode ?? "",
            country: data.country ?? "India",

            ownerFirstName: data.ownerFirstName ?? "",
            ownerLastName: data.ownerLastName ?? "",
            ownerEmail: data.ownerEmail ?? "",
            ownerPhone: data.ownerPhone ?? "",
          });
          setIsDirty(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [router, isAuthenticated, authLoading, isSyncing]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company`, {
        method: companyExists ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save company");
      }

      setCompanyExists(true);
      setSuccess(true);
      setIsDirty(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Prevent UI flickering during Sync OR initial loading
  if (authLoading || isSyncing || (isAuthenticated && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-neutral-500">
        <div className="animate-pulse mb-4 text-amber-500 font-bold">Synchronizing Session...</div>
        <div className="text-sm">Connecting to Contabix Secure Engine</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (isDirty) setShowWarning(true);
            else router.push("/dashboard");
          }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all"
          title="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            <span className="text-amber-500">Company</span> Profile
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Manage your official business identity and invoice settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Company Information Card */}
        <section className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-800/60 pb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <Building2 size={20} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Business Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name *" value={form.name} onChange={(v) => updateForm("name", v)} full />
            <Select
              label="Company Type *"
              value={form.type}
              onChange={(v) => updateForm("type", v)}
              options={[
                { label: "Private Limited", value: "PRIVATE_LIMITED" },
                { label: "Proprietorship", value: "PROPRIETORSHIP" },
                { label: "LLP", value: "LLP" },
                { label: "Partnership", value: "PARTNERSHIP" },
                { label: "OPC", value: "OPC" },
              ]}
            />
            <Input label="Business Category" value={form.businessCategory} onChange={(v) => updateForm("businessCategory", v)} />
            <Input label="CIN" value={form.cin} onChange={(v) => updateForm("cin", v)} />
            <Input label="PAN" value={form.pan} onChange={(v) => updateForm("pan", v)} />
            <Input label="GSTIN (Optional)" value={form.gstin} onChange={(v) => updateForm("gstin", v)} full />
            <Input label="Company Email" value={form.email} onChange={(v) => updateForm("email", v)} />
            <Input label="Company Phone" value={form.phone} onChange={(v) => updateForm("phone", v)} />
            <Input label="Website" value={form.website} onChange={(v) => updateForm("website", v)} full />
          </div>
        </section>

        {/* Address Card */}
        <section className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-800/60 pb-4">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <MapPin size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Registered Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input full label="Street Address" value={form.addressLine} onChange={(v) => updateForm("addressLine", v)} />
            <Input label="City" value={form.city} onChange={(v) => updateForm("city", v)} />
            <Input label="Pincode" value={form.pincode} onChange={(v) => updateForm("pincode", v)} />
            <StateSelector value={form.state} onChange={(v) => updateForm("state", v)} />
            <Input label="State Code (Auto)" value={form.stateCode} disabled />
            <Input label="Country" value="India" disabled />
          </div>
        </section>

        {/* Owner Card */}
        <section className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-800/60 pb-4">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <UserCircle size={20} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Primary Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" value={form.ownerFirstName} onChange={(v) => updateForm("ownerFirstName", v)} />
            <Input label="Last Name" value={form.ownerLastName} onChange={(v) => updateForm("ownerLastName", v)} />
            <Input label="Email Address" value={form.ownerEmail} onChange={(v) => updateForm("ownerEmail", v)} />
            <Input label="Phone Number" value={form.ownerPhone} onChange={(v) => updateForm("ownerPhone", v)} />
          </div>
        </section>
      </div>

      {/* Save Action Bar */}
      <div className="sticky bottom-6 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl shadow-black">
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={16} />
              Profile updated successfully
            </div>
          )}
          {!error && !success && isDirty && (
            <span className="text-sm text-amber-400/80 italic">Unsaved changes...</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (!isDirty && companyExists)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black px-8 py-2.5 rounded-xl font-semibold transition-all"
        >
          <Save size={18} />
          {saving ? "Saving..." : companyExists ? "Save Changes" : "Create Profile"}
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-2 rounded-full text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Discard changes?</h3>
            </div>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              You have unsaved edits to your company profile. If you leave now, your changes will be lost.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="text-sm px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors font-medium"
              >
                Keep Editing
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/20"
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small components ---------- */

function Input({
  label,
  value,
  onChange,
  disabled,
  full,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
      >
        <option value="" disabled>Select {label.replace(' *', '')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = GST_STATES.filter((state) =>
    state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">State</label>

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
        className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-xl max-h-52 overflow-y-auto shadow-xl shadow-black/50 p-1 custom-scrollbar">
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
              className="w-full text-left px-4 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-neutral-200 transition-colors"
            >
              {state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}