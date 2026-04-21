"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

/* ================= TYPES ================= */

type Purchase = {
  id: string;
  quantity: number;
  purchasePrice: number;
  taxableValue: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  paymentMode: string;
  invoiceNo: string;
  invoiceDate: string;
  supplierGstin: string;
  placeOfSupply: string;
  hsnSac: string;
  remarks: string;

  product: {
    name: string;
    sku: string;
    category: string;
    unit: string;
  };
  supplier: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
};

type Props = {
  purchase: Purchase;
  onClose: () => void;
  onUpdated: () => void;
};

/* ================= COMPONENT ================= */

export default function EditPurchaseModal({ purchase, onClose, onUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: purchase.product.name,
    sku: purchase.product.sku,
    category: purchase.product.category,
    unit: purchase.product.unit,
    hsnSac: purchase.hsnSac || "",
    
    invoiceNo: purchase.invoiceNo || "",
    invoiceDate: purchase.invoiceDate ? purchase.invoiceDate.slice(0,10) : "",
    remarks: purchase.remarks || "",
    placeOfSupply: purchase.placeOfSupply || "",
    paymentMode: purchase.paymentMode || "CASH",

    // Manual Manual Entry (pre-filled with existing)
    quantity: purchase.quantity ? String(purchase.quantity) : "",
    purchasePrice: purchase.purchasePrice ? String(purchase.purchasePrice) : "",
    taxableValue: purchase.taxableValue ? String(purchase.taxableValue) : "",
    gstPercent: purchase.gstPercent ? String(purchase.gstPercent) : "",
    gstAmount: purchase.gstAmount ? String(purchase.gstAmount) : "",
    total: purchase.total ? String(purchase.total) : "",

    supplierName: purchase.supplier.name,
    supplierEmail: purchase.supplier.email || "",
    supplierPhone: purchase.supplier.phone || "",
    supplierAddress: purchase.supplier.address || "",
    supplierGstin: purchase.supplierGstin || purchase.supplier.gstin || "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${purchase.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Converted exactly as user entered them
          quantity: Number(form.quantity) || 0,
          purchasePrice: Number(form.purchasePrice) || 0,
          taxableValue: Number(form.taxableValue) || 0,
          gstPercent: Number(form.gstPercent) || 0,
          gstAmount: Number(form.gstAmount) || 0,
          total: Number(form.total) || 0,
        }),
      });

      if(!res.ok) throw new Error("Update failed");

      onUpdated();
      onClose();
    } catch(err) {
      setError("Failed to update purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Edit Purchase Bill</h2>
            <p className="text-xs text-neutral-400 mt-1">Update invoice details, stock, and manual tax entries.</p>
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
              
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Invoice Number" value={form.invoiceNo} onChange={(v) => update("invoiceNo", v)} />
                  <Input label="Invoice Date" type="date" value={form.invoiceDate} onChange={(v) => update("invoiceDate", v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Place of Supply" value={form.placeOfSupply} onChange={(v) => update("placeOfSupply", v)} />
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Payment Mode</label>
                    <select value={form.paymentMode} onChange={(e) => update("paymentMode", e.target.value)} className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-white outline-none">
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                    </select>
                  </div>
                </div>
                <Input label="Remarks / Notes" value={form.remarks} onChange={(v) => update("remarks", v)} />
              </section>

              <div className="border-t border-neutral-800/60" />

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Supplier Info</h3>
                <Input label="Supplier Name" value={form.supplierName} onChange={(v) => update("supplierName", v)} />
                <Input label="Supplier GSTIN" value={form.supplierGstin} onChange={(v) => update("supplierGstin", v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" value={form.supplierEmail} onChange={(v) => update("supplierEmail", v)} />
                  <Input label="Phone" value={form.supplierPhone} onChange={(v) => update("supplierPhone", v)} />
                </div>
                <Input label="Billing Address" value={form.supplierAddress} onChange={(v) => update("supplierAddress", v)} />
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Item Description</h3>
                <Input label="Product Name" value={form.name} onChange={(v)=>update("name",v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" value={form.sku} onChange={(v)=>update("sku",v)} />
                  <Input label="HSN/SAC Code" value={form.hsnSac} onChange={(v)=>update("hsnSac",v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Category" value={form.category} onChange={(v)=>update("category",v)} />
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Unit</label>
                    <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full bg-neutral-900/50 border border-neutral-700/50 rounded-xl px-4 py-2.5 text-white outline-none">
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

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Pricing & Taxes (Manual)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Quantity" type="number" value={form.quantity} onChange={(v)=>update("quantity",v)} />
                  <Input label="Rate (₹)" type="number" value={form.purchasePrice} onChange={(v)=>update("purchasePrice",v)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Taxable Value (₹)" type="number" value={form.taxableValue} onChange={(v)=>update("taxableValue",v)} />
                  <Input label="GST %" type="number" value={form.gstPercent} onChange={(v)=>update("gstPercent",v)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="GST Amount (₹)" type="number" value={form.gstAmount} onChange={(v)=>update("gstAmount",v)} />
                  <Input label="Invoice Total (₹)" type="number" value={form.total} onChange={(v)=>update("total",v)} />
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
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
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