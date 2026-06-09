"use client";

import { useState } from "react";
import { X, AlertCircle, Plus, Trash2 } from "lucide-react";

type Unit =
  | "PIECE"
  | "KILOGRAM"
  | "GRAM"
  | "LITER"
  | "MILLILITER"
  | "DOZEN"
  | "BOX"
  | "BAG"
  | "TON"
  | "QTL"
  | "PKT";

type Purchase = {
  id: string;
  total: number;
  taxableValue: number;
  gstAmount: number;
  paymentMode: string;
  invoiceNo: string;
  invoiceDate: string;
  supplierGstin: string;
  placeOfSupply: string;
  remarks: string;

  items: Array<{
    quantity: number;
    purchasePrice: number;
    taxableValue: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
    hsnSac: string | null;
    product: {
      name: string;
      sku: string;
      category: string;
      unit: string;
    };
  }>;

  supplier: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    postalCode?: string;
  };
};

type Props = {
  purchase: Purchase;
  onClose: () => void;
  onUpdated: () => void;
};

type PurchaseItem = {
  name: string;
  sku: string;
  category: string;
  unit: string;
  hsnSac: string;
  quantity: string;
  purchasePrice: string;
  taxableValue: string;
  gstPercent: string;
  gstAmount: string;
  total: string;
};

const emptyItem: PurchaseItem = {
  name: "",
  sku: "",
  category: "",
  unit: "PIECE",
  hsnSac: "",
  quantity: "",
  purchasePrice: "",
  taxableValue: "",
  gstPercent: "",
  gstAmount: "",
  total: "",
};

export default function EditPurchaseModal({ purchase, onClose, onUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    invoiceNo: purchase.invoiceNo || "",
    invoiceDate: purchase.invoiceDate ? purchase.invoiceDate.slice(0, 10) : "",
    remarks: purchase.remarks || "",
    placeOfSupply: purchase.placeOfSupply || "",
    paymentMode: purchase.paymentMode || "CASH",

    supplierName: purchase.supplier.name,
    supplierEmail: purchase.supplier.email || "",
    supplierPhone: purchase.supplier.phone || "",
    supplierAddress: purchase.supplier.address || "",
    supplierGstin: purchase.supplierGstin || purchase.supplier.gstin || "",
    supplierCity: purchase.supplier.city || "",
    supplierState: purchase.supplier.state || "",
    supplierStateCode: purchase.supplier.stateCode || "",
    supplierPostal: purchase.supplier.postalCode || "",
  });

  const [items, setItems] = useState<PurchaseItem[]>(
    purchase.items && purchase.items.length > 0 
      ? purchase.items.map((i) => ({
          name: i.product.name,
          sku: i.product.sku,
          category: i.product.category,
          unit: i.product.unit,
          hsnSac: i.hsnSac || "",
          quantity: String(i.quantity || ""),
          purchasePrice: String(i.purchasePrice || ""),
          taxableValue: String(i.taxableValue || ""),
          gstPercent: String(i.gstPercent || ""),
          gstAmount: String(i.gstAmount || ""),
          total: String(i.total || ""),
        }))
      : [{ ...emptyItem }]
  );

  const overallTaxable = items.reduce((sum, item) => sum + (Number(item.taxableValue) || 0), 0);
  const overallGst = items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
  const overallTotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const updateHeader = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index: number, key: keyof PurchaseItem, value: string) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index], [key]: value };

      if (["quantity", "purchasePrice", "gstPercent"].includes(key as string)) {
        const q = Number(item.quantity) || 0;
        const r = Number(item.purchasePrice) || 0;
        const g = Number(item.gstPercent) || 0;

        const total = parseFloat((q * r).toFixed(2));
        const taxable = parseFloat((total / (1 + g / 100)).toFixed(2));
        const gst = parseFloat((total - taxable).toFixed(2));

        item.taxableValue = taxable ? String(taxable) : "";
        item.gstAmount = gst ? String(gst) : "";
        item.total = total ? String(total) : "";
      }

      newItems[index] = item;
      return newItems;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  
  const removeItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase/${purchase.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            taxableValue: overallTaxable,
            gstAmount: overallGst,
            total: overallTotal,
            items: items.map((item) => ({
              name: item.name,
              sku: item.sku,
              category: item.category,
              unit: item.unit,
              hsnSac: item.hsnSac,
              quantity: Number(item.quantity) || 0,
              purchasePrice: Number(item.purchasePrice) || 0,
              taxableValue: Number(item.taxableValue) || 0,
              gstPercent: Number(item.gstPercent) || 0,
              gstAmount: Number(item.gstAmount) || 0,
              total: Number(item.total) || 0,
            })),
          }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      onUpdated();
      onClose();
    } catch (err) {
      setError("Failed to update purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Edit Purchase Bill
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Update invoice details, stock, and multiple item quantities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Number"
                  value={form.invoiceNo}
                  onChange={(v) => updateHeader("invoiceNo", v)}
                />
                <Input
                  label="Invoice Date"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(v) => updateHeader("invoiceDate", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Place of Supply"
                  value={form.placeOfSupply}
                  onChange={(v) => updateHeader("placeOfSupply", v)}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => updateHeader("paymentMode", e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-white outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                  </select>
                </div>
              </div>
              <Input
                label="Remarks / Notes"
                value={form.remarks}
                onChange={(v) => updateHeader("remarks", v)}
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">
                Supplier Info
              </h3>
              <Input
                label="Supplier Name"
                value={form.supplierName}
                onChange={(v) => updateHeader("supplierName", v)}
              />
              <Input
                label="Supplier GSTIN"
                value={form.supplierGstin}
                onChange={(v) => updateHeader("supplierGstin", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.supplierCity}
                  onChange={(v) => updateHeader("supplierCity", v)}
                />
                <Input
                  label="State"
                  value={form.supplierState}
                  onChange={(v) => updateHeader("supplierState", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="State Code"
                  value={form.supplierStateCode}
                  onChange={(v) => updateHeader("supplierStateCode", v)}
                />
                <Input
                  label="Postal Code"
                  value={form.supplierPostal}
                  onChange={(v) => updateHeader("supplierPostal", v)}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-neutral-800/60" />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">
              Line Items
            </h3>
            {items.map((item, index) => (
              <div
                key={index}
                className="p-5 bg-neutral-800/30 border border-neutral-700/50 rounded-xl space-y-4 relative group transition-all"
              >
                <div className="flex justify-between items-center mb-2 border-b border-neutral-700/50 pb-2">
                  <h4 className="text-sm font-bold text-white/80">Item #{index + 1}</h4>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-xs font-medium bg-rose-500/10 px-2 py-1 rounded-md"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Product Name *"
                      value={item.name}
                      onChange={(v) => updateItem(index, "name", v)}
                    />
                  </div>
                  <Input
                    label="SKU / Barcode *"
                    value={item.sku}
                    onChange={(v) => updateItem(index, "sku", v)}
                  />
                  <Input
                    label="Category"
                    value={item.category}
                    onChange={(v) => updateItem(index, "category", v)}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5 truncate">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-white transition-all outline-none shadow-inner cursor-pointer"
                    >
                      <option value="PIECE">Pieces</option>
                      <option value="KILOGRAM">Kg</option>
                      <option value="GRAM">g</option>
                      <option value="LITER">Litre</option>
                      <option value="BOX">Box</option>
                      <option value="BAG">Bag</option>
                      <option value="TON">Ton</option>
                      <option value="QTL">QTL</option>
                      <option value="PKT">PKT</option>
                    </select>
                  </div>
                  <Input
                    label="HSN/SAC"
                    value={item.hsnSac}
                    onChange={(v) => updateItem(index, "hsnSac", v)}
                  />
                  <Input
                    label="Quantity *"
                    type="number"
                    step="0.001"
                    value={item.quantity}
                    onChange={(v) => updateItem(index, "quantity", v)}
                  />
                  <Input
                    label="Rate (₹) *"
                    type="number"
                    step="0.001"
                    value={item.purchasePrice}
                    onChange={(v) => updateItem(index, "purchasePrice", v)}
                  />
                  <Input
                    label="GST %"
                    type="number"
                    step="0.001"
                    value={item.gstPercent}
                    onChange={(v) => updateItem(index, "gstPercent", v)}
                  />
                  <Input
                    label="Total (₹)"
                    type="number"
                    step="0.001"
                    value={item.total}
                    onChange={(v) => updateItem(index, "total", v)}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              type="button"
              className="flex items-center gap-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors w-max"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </section>

          <div className="border-t border-neutral-800/60" />

          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-3 bg-neutral-800/40 p-5 rounded-xl border border-neutral-700/50 shadow-inner">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Total Taxable Value:</span>
                <span className="text-white font-medium">₹{overallTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Total GST Amount:</span>
                <span className="text-white font-medium">₹{overallGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-amber-500 pt-3 border-t border-neutral-700/50">
                <span>Grand Total:</span>
                <span>₹{overallTotal.toFixed(2)}</span>
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

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800/60 bg-neutral-900/50 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5 truncate">
        {label}
      </label>
      <input
  type={type}
  value={value}
  min={type === "number" ? "0" : undefined}
  step={step || (type === "number" ? "0.001" : undefined)}
  onChange={(e) => onChange(e.target.value)}
  placeholder={placeholder}
  className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
/>
    </div>
  );
}