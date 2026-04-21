"use client";

import { useEffect, useState } from "react";
import { X, Search, CheckCircle2, AlertCircle } from "lucide-react";

/* ================= Types ================= */

type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type Unit = "PIECE" | "KILOGRAM" | "GRAM" | "LITER" | "MILLILITER" | "DOZEN" | "BOX";

/* ================= COMPONENT ================= */

export default function AddPurchaseModal({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Product
    name: "",
    sku: "",
    category: "",
    unit: "PIECE" as Unit,
    hsnSac: "",
    
    // Invoice details
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    remarks: "",
    placeOfSupply: "",
    paymentMode: "CASH", 

    // 100% Manual Entry
    quantity: "",
    purchasePrice: "", // Rate
    taxableValue: "",
    gstPercent: "",
    gstAmount: "",
    total: "",

    // Supplier Info
    supplierEmail: "",
    supplierPhone: "",
    supplierAddress: "",
    supplierGstin: "",
  });

  /* ================= SUPPLIER SEARCH ================= */

  useEffect(() => {
    if (!supplierQuery.trim() || selectedSupplierId) {
      setSupplierResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/suppliers/list`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter((s) => s.name.toLowerCase().includes(supplierQuery.toLowerCase()));
        setSupplierResults(filtered);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [supplierQuery, selectedSupplierId]);

  if (!open) return null;

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          category: form.category,
          unit: form.unit,
          hsnSac: form.hsnSac,
          
          invoiceNo: form.invoiceNo,
          invoiceDate: form.invoiceDate,
          placeOfSupply: form.placeOfSupply,
          paymentMode: form.paymentMode, 
          remarks: form.remarks,

          // Saving exactly what the user typed (converted to numbers for DB)
          quantity: Number(form.quantity) || 0,
          purchasePrice: Number(form.purchasePrice) || 0,
          taxableValue: Number(form.taxableValue) || 0,
          gstPercent: Number(form.gstPercent) || 0,
          gstAmount: Number(form.gstAmount) || 0,
          total: Number(form.total) || 0,

          supplierName: supplierQuery,
          supplierId: selectedSupplierId ?? undefined,
          supplierEmail: form.supplierEmail || undefined,
          supplierPhone: form.supplierPhone || undefined,
          supplierAddress: form.supplierAddress || undefined,
          supplierGstin: form.supplierGstin || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to create purchase");
      }

      onCreated();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Add Purchase Bill</h2>
            <p className="text-xs text-neutral-400 mt-1">Record incoming stock, supplier details, and manual tax entries.</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* Invoice Details */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Invoice Number" value={form.invoiceNo} onChange={(v) => update("invoiceNo", v)} placeholder="e.g. INV-102" />
                  <Input label="Invoice Date" type="date" value={form.invoiceDate} onChange={(v) => update("invoiceDate", v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Place of Supply" value={form.placeOfSupply} onChange={(v) => update("placeOfSupply", v)} placeholder="e.g. Delhi" />
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Payment Mode</label>
                    <select value={form.paymentMode} onChange={(e) => update("paymentMode", e.target.value)} className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white outline-none shadow-inner cursor-pointer">
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                    </select>
                  </div>
                </div>
                <Input label="Remarks / Notes" value={form.remarks} onChange={(v) => update("remarks", v)} placeholder="Any notes..." />
              </section>

              <div className="border-t border-neutral-800/60" />

              {/* Supplier Info */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Supplier Info</h3>
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Supplier Name *</label>
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3 text-neutral-500" />
                    <input
                      value={supplierQuery}
                      onChange={(e) => {
                        setSupplierQuery(e.target.value);
                        setSelectedSupplierId(null);
                      }}
                      placeholder="Search existing or type new supplier..."
                      className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
                    />
                  </div>
                  {selectedSupplierId && <p className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mt-2"><CheckCircle2 size={14} /> Linked to existing supplier</p>}

                  {supplierResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden divide-y divide-neutral-700/50 max-h-48 overflow-y-auto">
                      {supplierResults.map((s) => (
                        <div key={s.id} onClick={() => {
                            setSupplierQuery(s.name);
                            setSelectedSupplierId(s.id);
                            setForm((f) => ({ ...f, supplierEmail: s.email ?? "", supplierPhone: s.phone ?? "", supplierAddress: s.address ?? "", supplierGstin: s.gstin ?? "" }));
                          }}
                          className="px-4 py-3 cursor-pointer hover:bg-amber-500/10 transition-colors group"
                        >
                          <p className="text-white font-medium group-hover:text-amber-400 transition-colors">{s.name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{s.gstin ? `GSTIN: ${s.gstin}` : "No GSTIN"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Input label="Supplier GSTIN" value={form.supplierGstin} onChange={(v) => update("supplierGstin", v)} placeholder="22AAAAA0000A1Z5" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" value={form.supplierEmail} onChange={(v) => update("supplierEmail", v)} placeholder="supplier@example.com" />
                  <Input label="Phone" value={form.supplierPhone} onChange={(v) => update("supplierPhone", v)} placeholder="+91..." />
                </div>
                <Input label="Billing Address" value={form.supplierAddress} onChange={(v) => update("supplierAddress", v)} placeholder="Full address details..." />
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* Product Info */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Item Description</h3>
                <Input label="Product Name *" value={form.name} onChange={(v)=>update("name",v)} placeholder="e.g. Mechanical Keyboard" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU / Barcode *" value={form.sku} onChange={(v)=>update("sku",v)} placeholder="e.g. MK-001" />
                  <Input label="HSN/SAC Code" value={form.hsnSac} onChange={(v)=>update("hsnSac",v)} placeholder="e.g. 8471" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Category" value={form.category} onChange={(v)=>update("category",v)} placeholder="e.g. Electronics" />
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Unit</label>
                    <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all outline-none shadow-inner cursor-pointer">
                      <option value="PIECE">Pieces</option>
                      <option value="KILOGRAM">Kg</option>
                      <option value="GRAM">g</option>
                      <option value="LITER">Litre</option>
                      <option value="BOX">Box</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="border-t border-neutral-800/60" />

              {/* Taxation & Totals (MANUAL ENTRY) */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Pricing & Taxes (Manual)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Quantity *" type="number" value={form.quantity} onChange={(v)=>update("quantity",v)} placeholder="0" />
                  <Input label="Rate (₹) *" type="number" value={form.purchasePrice} onChange={(v)=>update("purchasePrice",v)} placeholder="0.00" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Taxable Value (₹)" type="number" value={form.taxableValue} onChange={(v)=>update("taxableValue",v)} placeholder="0.00" />
                  <Input label="GST %" type="number" value={form.gstPercent} onChange={(v)=>update("gstPercent",v)} placeholder="18" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="GST Amount (₹)" type="number" value={form.gstAmount} onChange={(v)=>update("gstAmount",v)} placeholder="0.00" />
                  <Input label="Invoice Total (₹)" type="number" value={form.total} onChange={(v)=>update("total",v)} placeholder="0.00" />
                </div>

              </section>

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
          <button onClick={onClose} className="px-5 py-2.5 font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">
            {saving ? "Saving..." : "Create Purchase Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner" />
    </div>
  );
}