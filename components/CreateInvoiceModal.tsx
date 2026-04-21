"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Search, CheckCircle2, AlertCircle, Receipt } from "lucide-react";

/* ================= TYPES ================= */

type Item = {
  productId: string;
  hsnSac?: string; // 🟢 Added
  quantity: number;
  unit: string;
  sellingPrice: number;
  discount: number;
  tax: number;
};

type Invoice = {
  id: string;
  invoiceNumber: number;
  issueDate: string;
  paymentMode?: "CASH" | "BANK";
  placeOfSupply?: string; // 🟢 Added
  remarks?: string;       // 🟢 Added
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  customerPostal?: string;
  customerTaxId?: string;
  status: "DRAFT" | "PAID";
  items?: any[];
  tax?: number;
};

type Props = {
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function CreateInvoiceModal({
  invoice,
  onClose,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState("");

  /* ========= CUSTOMER ========= */
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");
  const [customerPostal, setCustomerPostal] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ========= INVOICE ========= */
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const [issueDate, setIssueDate] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState(""); // 🟢
  const [remarks, setRemarks] = useState("");             // 🟢
  const [status, setStatus] = useState<"DRAFT" | "PAID">("DRAFT");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "BANK">("CASH");

  const [items, setItems] = useState<Item[]>([]);
  const isEdit = !!invoice;

  /* ================= FETCH ================= */

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/meta`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase`, { credentials: "include" })
        .then((r) => r.json())
        .then((purchases) => {
          const map = new Map();
          purchases.forEach((p: any) => {
            if (p.product) {
              map.set(p.product.id, {
                id: p.product.id,
                name: p.product.name,
                price: p.purchasePrice, 
              });
            }
          });
          return Array.from(map.values());
        }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, { credentials: "include" }).then((r) => r.json()),
    ]).then(([meta, productsData, customersData]) => {
      setProducts(productsData);
      setCustomers(customersData);

      if (invoice) {
        setInvoiceNumber(invoice.invoiceNumber);
        setIssueDate(invoice.issueDate.slice(0, 10));
        setStatus(invoice.status);
        setPaymentMode(invoice.paymentMode || "CASH");
        setPlaceOfSupply(invoice.placeOfSupply || "");
        setRemarks(invoice.remarks || "");
        
        setCustomerId(invoice.customerId || "");
        setCustomerName(invoice.customerName || "");
        setCustomerEmail(invoice.customerEmail || "");
        setCustomerPhone(invoice.customerPhone || "");
        setCustomerCompany(invoice.customerCompany || "");
        setCustomerAddress(invoice.customerAddress || "");
        setCustomerCity(invoice.customerCity || "");
        setCustomerCountry(invoice.customerCountry || "");
        setCustomerPostal(invoice.customerPostal || "");
        setCustomerTaxId(invoice.customerTaxId || "");

        setItems(
          invoice.items?.map((i: any) => ({
            productId: i.productId,
            hsnSac: i.hsnSac || "",
            quantity: i.quantity,
            unit: i.unit || "PIECE", 
            sellingPrice: i.price || 0,
            discount: i.discount || 0, 
            tax: i.tax || 0,           
          })) ?? []
        );
      } else {
        setInvoiceNumber(meta.nextInvoiceNumber);
        setIssueDate(new Date().toISOString().slice(0, 10));
      }
    });
  }, [invoice]);

  /* ================= CALCULATIONS (UNCHANGED) ================= */

  const calculateSplit = (item: Item) => {
    const final = item.sellingPrice * item.quantity;
    const multiplier = (1 - item.discount / 100) * (1 + item.tax / 100);

    if (multiplier === 0) {
      return { base: 0, discountAmount: 0, taxAmount: 0, final };
    }

    const base = final / multiplier;
    const discountAmount = base * (item.discount / 100);
    const afterDiscount = base - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);

    return { base, discountAmount, taxAmount, final };
  };

  const subtotal = items.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  const total = subtotal;

  /* ================= ACTIONS ================= */

  const addItem = () =>
    setItems([
      ...items,
      {
        productId: "",
        hsnSac: "",
        quantity: 1,
        unit: "PIECE", 
        sellingPrice: 0,
        discount: 0,
        tax: 0,
      },
    ]);

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const selectCustomer = (c: any) => {
    setCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerEmail(c.email || "");
    setCustomerPhone(c.phone || "");
    setCustomerCompany(c.companyName || "");
    setCustomerAddress(c.address || "");
    setCustomerCity(c.city || "");
    setCustomerCountry(c.country || "");
    setCustomerPostal(c.postalCode || "");
    setCustomerTaxId(c.taxId || "");
    setShowSuggestions(false);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerName.toLowerCase())
  );

  const saveInvoice = async () => {
    setSaving(true);
    setError("");

    const res = await fetch(
      isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/invoice/${invoice!.id}` : `${process.env.NEXT_PUBLIC_API_URL}/invoice`,
      {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          status,
          paymentMode,
          placeOfSupply,
          remarks,

          customerId,
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
          customerAddress,
          customerCity,
          customerCountry,
          customerPostal,
          customerTaxId,

          subTotal: subtotal,
          tax: 0,
          total,

          items: items.map((i) => {
            const p = products.find((p) => p.id === i.productId);
            return {
              productId: p?.id,
              productName: p?.name,
              hsnSac: i.hsnSac,
              price: i.sellingPrice,
              quantity: i.quantity,
              unit: i.unit, 
              discount: i.discount, 
              tax: i.tax,           
              total: i.sellingPrice * i.quantity,
            };
          }),
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Failed to save invoice");
      setSaving(false);
      return;
    }

    onSaved();
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/60 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEdit ? "Edit Invoice" : "Create Invoice"}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Fill out the details below to generate a sales invoice.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {error && (
            <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm shadow-inner">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* INVOICE INFO */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Invoice Number"
                type="number"
                value={String(invoiceNumber)}
                onChange={(v) => setInvoiceNumber(Number(v))}
              />
              <Input
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(v) => setIssueDate(v)}
              />
              <Input
                label="Place of Supply"
                value={placeOfSupply}
                onChange={(v) => setPlaceOfSupply(v)}
                placeholder="e.g. Maharashtra"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all outline-none shadow-inner cursor-pointer"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white transition-all outline-none shadow-inner cursor-pointer"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              <Input
                label="Remarks / Notes"
                value={remarks}
                onChange={(v) => setRemarks(v)}
                placeholder="Any special notes..."
              />
            </div>
          </section>

          <div className="border-t border-neutral-800/60" />

          {/* CUSTOMER */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Customer Information
            </h3>
            
            <div className="relative">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-neutral-500" />
                <input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCustomerId("");
                    setShowSuggestions(true);
                  }}
                  placeholder="Search existing or type new customer..."
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
                />
              </div>

              {customerId && (
                <p className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mt-2">
                  <CheckCircle2 size={14} />
                  Linked to existing customer
                </p>
              )}

              {showSuggestions && customerName && filteredCustomers.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden divide-y divide-neutral-700/50 max-h-48 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className="px-4 py-3 cursor-pointer hover:bg-amber-500/10 transition-colors group"
                    >
                      <p className="text-white font-medium group-hover:text-amber-400 transition-colors">{c.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5 flex gap-2">
                        {c.email && <span>{c.email}</span>}
                        {c.email && c.phone && <span>•</span>}
                        {c.phone && <span>{c.phone}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Email" value={customerEmail} onChange={setCustomerEmail} placeholder="customer@example.com" />
              <Input label="Phone" value={customerPhone} onChange={setCustomerPhone} placeholder="+91..." />
              <Input label="Company Name" value={customerCompany} onChange={setCustomerCompany} placeholder="Optional" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Address" value={customerAddress} onChange={setCustomerAddress} placeholder="Street address" />
              <Input label="City" value={customerCity} onChange={setCustomerCity} placeholder="City" />
              <Input label="Postal Code" value={customerPostal} onChange={setCustomerPostal} placeholder="ZIP / PIN" />
              <Input label="GSTIN / Tax ID" value={customerTaxId} onChange={setCustomerTaxId} placeholder="Tax Number" />
            </div>
          </section>

          <div className="border-t border-neutral-800/60" />

          {/* LINE ITEMS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                Line Items
              </h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} strokeWidth={3} /> Add Row
              </button>
            </div>

            <div className="space-y-4">
              {items.map((i, idx) => {
                const split = calculateSplit(i);

                return (
                  <div key={idx} className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl p-5 space-y-4 transition-all hover:border-neutral-600/50">
                    
                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_auto] gap-3 items-end">
                      
                      {/* Product */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product</label>
                        <select
                          value={i.productId}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].productId = e.target.value;
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner cursor-pointer"
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* HSN/SAC */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">HSN/SAC</label>
                        <input
                          type="text"
                          value={i.hsnSac || ""}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].hsnSac = e.target.value;
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner"
                        />
                      </div>

                      {/* Qty */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={i.quantity}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].quantity = Number(e.target.value);
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner"
                        />
                      </div>

                      {/* Unit */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Unit</label>
                        <select
                          value={i.unit}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].unit = e.target.value;
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner cursor-pointer"
                        >
                          <option value="PIECE">Pieces</option>
                          <option value="KILOGRAM">Kg</option>
                          <option value="GRAM">g</option>
                          <option value="LITER">Litre</option>
                          <option value="BOX">Box</option>
                        </select>
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Net Price (₹)</label>
                        <input
                          type="number"
                          value={i.sellingPrice}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].sellingPrice = Number(e.target.value);
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner text-right"
                        />
                      </div>

                      {/* Discount */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Disc %</label>
                        <input
                          type="number"
                          value={i.discount}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].discount = Number(e.target.value);
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner"
                        />
                      </div>

                      {/* Tax */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Tax %</label>
                        <input
                          type="number"
                          value={i.tax}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].tax = Number(e.target.value);
                            setItems(copy);
                          }}
                          className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end pb-1.5">
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Split Breakdown mini-receipt (MATH UNCHANGED) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-neutral-400 pt-4 border-t border-neutral-700/50">
                      <div>Base: <span className="text-neutral-300">₹{split.base.toFixed(2)}</span></div>
                      <div>Discount: <span className="text-emerald-400">-₹{split.discountAmount.toFixed(2)}</span></div>
                      <div>Tax: <span className="text-rose-400">+₹{split.taxAmount.toFixed(2)}</span></div>
                      <div className="text-sm">Final Row Total: <span className="text-amber-400">₹{split.final.toFixed(2)}</span></div>
                    </div>
                  </div>
                );
              })}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm border border-dashed border-neutral-700/50 rounded-2xl">
                  No items added to this invoice yet.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Footer Actions & Totals */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-neutral-800/60 bg-neutral-900/80 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-baseline gap-3">
            <span className="text-neutral-400 font-medium">Grand Total:</span>
            <span className="text-2xl font-bold text-amber-500 tracking-tight">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveInvoice}
              disabled={saving || items.length === 0}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-900/50 border border-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 transition-all outline-none shadow-inner"
      />
    </div>
  );
}