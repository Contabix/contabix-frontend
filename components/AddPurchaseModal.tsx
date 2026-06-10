"use client";

import { useEffect, useState } from "react";
import { X, Search, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  getGSTStateCode,
  GST_STATE_CODES,
} from "@/lib/gstStateCodes";

import { GST_STATES } from "@/lib/gstStates";

type Supplier = {
  id: string;
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

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

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

type PurchaseItem = {
  name: string;
  sku: string;
  category: string;
  unit: Unit;
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

export default function AddPurchaseModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    remarks: "",
    placeOfSupply: "",
    paymentMode: "CASH",

    supplierEmail: "",
    supplierPhone: "",
    supplierAddress: "",
    supplierGstin: "",
    supplierCity: "",
    supplierState: "",
    supplierStateCode: "",
    supplierPostal: "",
  });
  const [items, setItems] = useState<PurchaseItem[]>([{ ...emptyItem }]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setExistingCategories(data); })
      .catch(() => console.log("Failed to load categories"));

    // Fetch products
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setExistingProducts(data); })
      .catch(() => console.log("Failed to load products"));
  }, []);

  const overallTaxable = items.reduce((sum, item) => sum + (Number(item.taxableValue) || 0), 0);
  const overallGst = items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
  const overallTotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  useEffect(() => {
    if (!supplierQuery.trim() || selectedSupplierId) {
      setSupplierResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase/suppliers/list`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        const filtered = data.filter((s) =>
          s.name.toLowerCase().includes(supplierQuery.toLowerCase())
        );

        setSupplierResults(filtered);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [supplierQuery, selectedSupplierId]);

  if (!open) return null;

  const updateHeader = (key: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "supplierState") {
  next.supplierStateCode =
    getGSTStateCode(value);
}

      if (key === "supplierGstin") {
        const gstin = value.trim();
        if (gstin.length >= 2) {
          const gstCode = gstin.substring(0, 2);
          const matchedState = Object.entries(getGSTStateCode).find(
            ([, code]) => code === gstCode
          );
          if (matchedState) {
            next.supplierState = matchedState[0];
            next.supplierStateCode = gstCode;
          }
        }
      }

      return next;
    });
  };

  const updateItem = (index: number, key: keyof PurchaseItem, value: string) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index], [key]: value };

      // 🔥 THE MAGIC: Auto-fill logic when Product Name changes
      if (key === "name") {
        const matchedProduct = existingProducts.find(
          (p) => p.name.toLowerCase() === value.toLowerCase()
        );
        
        if (matchedProduct) {
          // Product exists! Fill in their custom SKU and details
          item.sku = matchedProduct.sku;
          item.category = matchedProduct.category;
          item.unit = matchedProduct.unit || "PIECE";
        } else {
          // Brand new product. Clear the SKU so it says "Auto-generated"
          item.sku = ""; 
        }
      }

      // Math calculations...
      if (["quantity", "purchasePrice", "gstPercent"].includes(key as string)) {
        const q = Number(item.quantity) || 0;
        const r = Number(item.purchasePrice) || 0;
        const g = Number(item.gstPercent) || 0;

        const taxable = parseFloat((q * r).toFixed(2));
        const total = parseFloat((taxable + (g / 100) * taxable).toFixed(2));
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

  const handleSave = async () => {
    const names = items.map(item => item.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    
    if (uniqueNames.size !== names.length) {
      setError("You cannot add the same product multiple times in one bill. Please combine the quantities into a single row.");
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            invoiceNo: form.invoiceNo,
            invoiceDate: form.invoiceDate,
            placeOfSupply: form.placeOfSupply,
            paymentMode: form.paymentMode,
            remarks: form.remarks,

            supplierName: supplierQuery,
            supplierId: selectedSupplierId ?? undefined,
            supplierEmail: form.supplierEmail || undefined,
            supplierPhone: form.supplierPhone || undefined,
            supplierAddress: form.supplierAddress || undefined,
            supplierGstin: form.supplierGstin || undefined,
            supplierCity: form.supplierCity || undefined,
            supplierState: form.supplierState || undefined,
            supplierStateCode: form.supplierStateCode || undefined,
            supplierPostal: form.supplierPostal || undefined,

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

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Add Purchase Bill
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Record incoming stock, supplier details, and multiple line items.
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
                  placeholder="e.g. INV-102"
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
                  placeholder="e.g. Delhi"
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => updateHeader("paymentMode", e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white outline-none shadow-inner cursor-pointer"
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
                placeholder="Any notes..."
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">
                Supplier Info
              </h3>

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">
                  Supplier Name *
                </label>

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

                {selectedSupplierId && (
                  <p className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mt-2">
                    <CheckCircle2 size={14} /> Linked to existing supplier
                  </p>
                )}

                {supplierResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden divide-y divide-neutral-700/50 max-h-48 overflow-y-auto">
                    {supplierResults.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSupplierQuery(s.name);
                          setSelectedSupplierId(s.id);
                          setForm((f) => ({
                            ...f,
                            supplierEmail: s.email ?? "",
                            supplierPhone: s.phone ?? "",
                            supplierAddress: s.address ?? "",
                            supplierGstin: s.gstin ?? "",
                            supplierCity: s.city ?? "",
                            supplierState: s.state ?? "",
                            supplierStateCode: s.stateCode ?? "",
                            supplierPostal: s.postalCode ?? "",
                          }));
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-amber-500/10 transition-colors group"
                      >
                        <p className="text-white font-medium group-hover:text-amber-400 transition-colors">
                          {s.name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {s.gstin ? `GSTIN: ${s.gstin}` : "No GSTIN"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Supplier GSTIN"
                value={form.supplierGstin}
                onChange={(v) => updateHeader("supplierGstin", v)}
                placeholder="22AAAAA0000A1Z5"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.supplierCity}
                  onChange={(v) => updateHeader("supplierCity", v)}
                  placeholder="e.g. Mumbai"
                />
                <StateSelector
  value={form.supplierState}
  onChange={(v) =>
    updateHeader("supplierState", v)
  }
/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
  label="State Code"
  value={form.supplierStateCode}
  onChange={(v) =>
    updateHeader("supplierStateCode", v)
  }
  placeholder="Auto-filled"
/>
                <Input
                  label="Postal Code"
                  value={form.supplierPostal}
                  onChange={(v) => updateHeader("supplierPostal", v)}
                  placeholder="e.g. 400001"
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
                  
                  {/* Product Name Hybrid Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5 truncate">
                      Product Name *
                    </label>
                    <input
                      list={`product-suggestions-${index}`}
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      placeholder="e.g. Urea 50kg"
                      className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
                    />
                    <datalist id={`product-suggestions-${index}`}>
                      {existingProducts.map((p, i) => (
                        <option key={i} value={p.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* SKU Input is now Disabled */}
                  <Input
                    label="SKU / Barcode"
                    value={item.sku}
                    onChange={(v) => updateItem(index, "sku", v)}
                    placeholder="Auto-generated"
                    disabled={true} 
                  />

                  {/* Category Hybrid Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5 truncate">
                      Category *
                    </label>
                    <input
                      list={`category-suggestions-${index}`}
                      value={item.category}
                      onChange={(e) => updateItem(index, "category", e.target.value)}
                      placeholder="Type or select..."
                      className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
                    />
                    <datalist id={`category-suggestions-${index}`}>
                      {existingCategories.map((cat, i) => (
                        <option key={i} value={cat} />
                      ))}
                    </datalist>
                  </div>

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
                    label="Quantity *"
                    type="number"
                    step="0.001"
                    value={item.quantity}
                    onChange={(v) => updateItem(index, "quantity", v)}
                    placeholder="0"
                  />

                  <Input
                    label="Rate (₹) *"
                    type="number"
                    step="0.001"
                    value={item.purchasePrice}
                    onChange={(v) => updateItem(index, "purchasePrice", v)}
                    placeholder="0.00"
                  />

                  <Input
                    label="GST %"
                    type="number"
                    step="0.001"
                    value={item.gstPercent}
                    onChange={(v) => updateItem(index, "gstPercent", v)}
                    placeholder="18"
                  />

                  <Input
                    label="Taxable (₹)"
                    type="number"
                    step="0.001"
                    value={item.taxableValue}
                    onChange={(v) => updateItem(index, "taxableValue", v)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Total (₹)"
                    type="number"
                    step="0.001"
                    value={item.total}
                    onChange={(v) => updateItem(index, "total", v)}
                    placeholder="0.00"
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
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? "Saving..." : "Create Purchase Bill"}
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
  disabled = false, // 🔥 NEW: Added to props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  disabled?: boolean; // 🔥 NEW: Added to TypeScript types
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
        disabled={disabled} // 🔥 NEW: Applied to the actual HTML input
        className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
      />
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
    state.toLowerCase().includes(
      query.toLowerCase()
    )
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-neutral-400 mb-1.5 truncate">
        State
      </label>

      <input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() =>
          setTimeout(() => setOpen(false), 200)
        }
        placeholder="Search state..."
        className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((state) => (
            <button
              key={state}
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() => {
                setQuery(state);
                onChange(state);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-amber-500/10 text-sm text-neutral-200"
            >
              {state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}