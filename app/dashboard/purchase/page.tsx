"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  Printer,
  Building2,
  ArrowRight,
  CalendarDays
} from "lucide-react";
import AddPurchaseModal from "@/components/AddPurchaseModal";
import EditPurchaseModal from "@/components/EditPurchaseModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useFinancialYear } from "@/context/FinancialYearContext"; 

/* ================= Types ================= */

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
    id: string;
    name: string;
    sku: string;
    category: string;
    unit: string;
  };

  supplier: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
};

/* ================= Page ================= */

export default function PurchasePage() {
  const router = useRouter(); 
  const { startDate, endDate, isReady } = useFinancialYear(); 

  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);

  // 🟢 Local Period State (Locked to FY)
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  // Sync local dates with the global FY when context is ready
  useEffect(() => {
    if (isReady && startDate && endDate) {
      setLocalStart(startDate);
      setLocalEnd(endDate);
    }
  }, [isReady, startDate, endDate]);

  /* ================= 1. THE BOUNCER ================= */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/bootstrap`, {
      credentials: "include",
    })
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company Profile");
        }
        if (!r.ok) throw new Error("Failed to fetch guard");
        return r.json();
      })
      .then(() => {
        setHasCompany(true);
      })
      .catch((e) => console.log(e));
  }, []);

  /* ================= 2. THE FETCHER ================= */
  const loadPurchases = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    // 🟢 Use local selection for fetching
    if (localStart) params.append("startDate", localStart);
    if (localEnd) params.append("endDate", localEnd);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase?${params.toString()}`, { 
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load purchases");
        }
        return res.json();
      })
      .then((data) => {
        setPurchases(Array.isArray(data) ? data : []);
      })
      .catch((err: Error) => {
        setError(err.message);
        setPurchases([]);
      })
      .finally(() => setLoading(false));
  }, [localStart, localEnd]);

  useEffect(() => {
    if (hasCompany === true && isReady) {
      loadPurchases();
    }
  }, [hasCompany, loadPurchases, isReady]);

  /* ================= Export Logic ================= */

  const exportToExcel = () => {
    const headers = [
      "Sr. No.", "Invoice Date", "Invoice No.", "Supplier Name", "GSTIN", 
      "Place of Supply", "Item Description", "HSN/SAC", "Qty", "Rate (Rs)", 
      "Taxable Value (Rs)", "GST %", "GST Amount (Rs)", "Invoice Value (Rs)", 
      "Mode of Payment", "Remarks"
    ];

    const csvData = filteredPurchases.map((p, idx) => [
      idx + 1,
      p.invoiceDate ? new Date(p.invoiceDate).toLocaleDateString("en-IN") : "-",
      p.invoiceNo || "-",
      p.supplier.name,
      p.supplierGstin || "-",
      p.placeOfSupply || "-",
      p.product.name,
      p.hsnSac || "-",
      p.quantity,
      p.purchasePrice,
      p.taxableValue || 0,
      p.gstPercent || 0,
      p.gstAmount || 0,
      p.total,
      p.paymentMode,
      p.remarks || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    // 🟢 Dynamic filename based on period
    link.download = `Purchase_Report_${localStart}_to_${localEnd}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  /* ================= Filtering & Formatting ================= */

  const filteredPurchases = purchases.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.product?.name?.toLowerCase().includes(q) ||
      p.invoiceNo?.toLowerCase().includes(q) ||
      p.supplier?.name?.toLowerCase().includes(q)
    );
  });

  const formatUnit = (u: string) => {
    const map: any = { PIECE: 'Pcs', KILOGRAM: 'Kg', GRAM: 'g', LITER: 'L', BOX: 'Box' };
    return map[u] || u;
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ================= UI GATES ================= */

  if (hasCompany === null || !isReady) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"></div>
      </div>
    );
  }

  if (hasCompany === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-500/5">
          <Building2 size={48} className="text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Set up your business first</h2>
        <p className="text-neutral-400 text-lg max-w-md mb-10 leading-relaxed">
          To manage purchases and supplier bills, InventoryPro needs your official business details and address.
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
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .overflow-x-auto { overflow: visible !important; }
          .min-w-\\[1600px\\] { min-width: 100% !important; width: 100% !important; }
          .max-w-\\[1400px\\] { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          table { border-collapse: collapse !important; width: 100% !important; table-layout: auto !important; }
          th, td { border: 1px solid #ddd !important; color: black !important; padding: 4px !important; font-size: 8px !important; white-space: normal !important; word-wrap: break-word !important; }
          th { background-color: #f3f4f6 !important; font-weight: bold !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20 space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-500">Purchase</span> Management
            </h1>
            <p className="text-neutral-400 mt-2 text-lg print-hidden">
              Manage your purchases, incoming stock, and supplier bills.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print-hidden">
            {/* 🟢 Restricted Period Selector (Dashboard style) */}
            <div className="bg-neutral-900/80 border border-neutral-800 p-2 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 px-2 text-amber-500">
                <CalendarDays size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Period:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={localStart}
                  min={startDate || undefined} // 🟢 FIX APPLIED HERE
                  max={endDate || undefined}   // 🟢 FIX APPLIED HERE
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                />
                <span className="text-neutral-600 text-xs font-medium">to</span>
                <input 
                  type="date" 
                  value={localEnd}
                  min={startDate || undefined} // 🟢 FIX APPLIED HERE
                  max={endDate || undefined}   // 🟢 FIX APPLIED HERE
                  onChange={(e) => setLocalEnd(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
              
              <button
                onClick={exportToPDF}
                className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300"
              >
                <Printer size={18} />
                PDF
              </button>
            </div>

            <div className="w-px h-8 bg-neutral-800 mx-1"></div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Purchase
            </button>
          </div>
        </div>

        <div className="flex gap-4 print-hidden">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex-1 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
            <Search size={18} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, invoice no, or supplier name..."
              className="bg-transparent outline-none text-white w-full placeholder:text-neutral-600"
            />
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[1600px]">
              <thead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/50 border-b border-neutral-800/60">
                <tr>
                  <th className="px-4 py-4 text-center">Sr. No.</th>
                  <th className="px-4 py-4 whitespace-nowrap">Invoice Date</th>
                  <th className="px-4 py-4 whitespace-nowrap">Invoice No.</th>
                  <th className="px-4 py-4">Supplier Name</th>
                  <th className="px-4 py-4 whitespace-nowrap">GSTIN</th>
                  <th className="px-4 py-4 whitespace-nowrap">Place of Supply</th>
                  <th className="px-4 py-4">Item Description</th>
                  <th className="px-4 py-4">HSN/SAC</th>
                  <th className="px-4 py-4 text-center">Qty</th>
                  <th className="px-4 py-4 text-right">Rate (₹)</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">Taxable Val (₹)</th>
                  <th className="px-4 py-4 text-center">GST %</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">GST Amt (₹)</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap text-white font-bold">Invoice Val (₹)</th>
                  <th className="px-4 py-4 text-center">Mode</th>
                  <th className="px-4 py-4">Remarks</th>
                  <th className="px-4 py-4 text-center print-hidden">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-neutral-800/60">
                {!loading && filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-24 text-center">
                      <div className="flex flex-col items-center text-neutral-500">
                        <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4 print-hidden">
                          <Package size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg">No purchases found for this period.</p>
                        <p className="text-sm mt-1 text-neutral-600 print-hidden">Try adjusting your search or add a new purchase.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-neutral-800/20 transition-colors duration-200">
                      <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-neutral-300">{formatDate(p.invoiceDate)}</td>
                      <td className="px-4 py-3 text-neutral-300 font-mono text-xs">{p.invoiceNo || "-"}</td>
                      <td className="px-4 py-3 text-white font-medium">{p.supplier?.name || "-"}</td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">{p.supplierGstin || "-"}</td>
                      <td className="px-4 py-3 text-neutral-400">{p.placeOfSupply || "-"}</td>
                      <td className="px-4 py-3 text-white font-medium">{p.product?.name || "-"}</td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">{p.hsnSac || "-"}</td>
                      <td className="px-4 py-3 text-center font-medium text-neutral-200">
                        {p.quantity} <span className="text-neutral-500 text-[10px]">{formatUnit(p.product?.unit)}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-300">{p.purchasePrice?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-neutral-300">{(p.taxableValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center text-neutral-300">{p.gstPercent || 0}%</td>
                      <td className="px-4 py-3 text-right text-rose-400">{(p.gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-amber-500 font-bold">₹{p.total?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-300">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs truncate max-w-[150px]">{p.remarks || "-"}</td>
                      
                      <td className="px-4 py-3 print-hidden">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${p.id}/download`, "_blank")}
                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                            title="Download Invoice"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => setEditing(p)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Edit Purchase"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleting(p)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete Purchase"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-right px-2 print-hidden">{error}</p>}
      </div>

      {/* Modals */}
      <AddPurchaseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadPurchases}
      />

      {editing && (
        <EditPurchaseModal
          purchase={editing}
          onClose={() => setEditing(null)}
          onUpdated={loadPurchases}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          id={deleting.id}
          endpoint="purchase"
          onClose={() => setDeleting(null)}
          onDeleted={loadPurchases}
        />
      )}
    </>
  );
}