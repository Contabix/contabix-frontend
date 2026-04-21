"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  Plus,
  FileText,
  ChevronDown,
  Pencil,
  Building2,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  CalendarDays
} from "lucide-react";
import BankDetailsModal from "@/components/BankDetailsModal";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import { useFinancialYear } from "@/context/FinancialYearContext"; 

type Invoice = {
  id: string;
  invoiceNumber: number;
  issueDate: string;
  customerName: string;
  total: number;
  tax: number;
  status: "DRAFT" | "PAID";
  paymentMode?: "CASH" | "BANK";
  customerTaxId?: string;
  placeOfSupply?: string;
  remarks?: string;
  items?: any[];
};

export default function InvoicesPage() {
  const router = useRouter();
  const { startDate, endDate, isReady } = useFinancialYear(); 

  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [bankDetails, setBankDetails] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [openBank, setOpenBank] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "DRAFT" | "PAID">("ALL");

  // 🟢 Local Period State (Locked to FY)
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  useEffect(() => {
    if (isReady && startDate && endDate) {
      setLocalStart(startDate);
      setLocalEnd(endDate);
    }
  }, [isReady, startDate, endDate]);

  /* ================= FETCH ================= */

  const fetchInvoices = () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (status !== "ALL") params.append("status", status);
    
    // 🟢 Use local selection for fetching
    if (localStart) params.append("startDate", localStart);
    if (localEnd) params.append("endDate", localEnd);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invoice?${params.toString()}`,
      { credentials: "include" },
    )
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company");
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setInvoices(data);
        } else if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else {
          setInvoices([]);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('${process.env.NEXT_PUBLIC_API_URL}/invoice/bootstrap', {
      credentials: "include",
    })
      .then(async (r) => {
        if (r.status === 403) {
          setHasCompany(false);
          throw new Error("No Company Profile");
        }
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        setBankDetails(data.bankDetails);
        setHasCompany(true);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (hasCompany === true && isReady) {
      fetchInvoices();
    }
  }, [search, status, localStart, localEnd, hasCompany, isReady]); 

  /* ================= EXPORT LOGIC ================= */

  const flattenedInvoices = invoices.flatMap((inv) => {
    if (!inv.items || inv.items.length === 0) {
      return [{ ...inv, item: null }];
    }
    return inv.items.map((item) => ({ ...inv, item }));
  });

  const exportToExcel = () => {
    const headers = [
      "Sr. No.", "Invoice Date", "Invoice No.", "Customer Name", "GSTIN", 
      "Place of Supply", "Item Description", "HSN/SAC", "Quantity", "Rate", 
      "Taxable Value", "GST %", "GST Amount", "Total Tax", "Invoice Value", 
      "Mode of Payment", "Remarks"
    ];

    let srNo = 1;
    const csvData = flattenedInvoices.map((row) => {
      const item = row.item;
      const rate = item?.price || 0;
      const qty = item?.quantity || 0;
      const disc = item?.discount || 0;
      const taxable = (rate * qty) * (1 - disc / 100);
      const gstRate = item?.tax || row.tax || 0;
      const gstAmount = taxable * (gstRate / 100);

      return [
        srNo++,
        new Date(row.issueDate).toLocaleDateString("en-IN"),
        row.invoiceNumber,
        row.customerName,
        row.customerTaxId || "-",
        row.placeOfSupply || "-",
        item?.productName || "-",
        item?.hsnSac || "-",
        qty,
        rate.toFixed(2),
        taxable.toFixed(2),
        gstRate,
        gstAmount.toFixed(2),
        (row.tax || 0).toFixed(2),
        row.total.toFixed(2),
        row.paymentMode || "CASH",
        row.remarks || "-"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Sales_Register_${localStart}_to_${localEnd}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  const formatUnit = (u: string) => {
    const map: any = { PIECE: 'Pcs', KILOGRAM: 'Kg', GRAM: 'g', LITER: 'L', BOX: 'Box' };
    return map[u] || u;
  };

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
          To create professional invoices and track sales, InventoryPro needs your official business details and address.
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

      {openBank && (
        <BankDetailsModal
          initialValue={bankDetails ?? ""}
          onClose={() => setOpenBank(false)}
          onSaved={(v) => {
            setBankDetails(v);
            setOpenBank(false);
          }}
        />
      )}

      {(openCreate || editInvoice) && (
        <CreateInvoiceModal
          invoice={editInvoice}
          onClose={() => {
            setOpenCreate(false);
            setEditInvoice(null);
          }}
          onSaved={() => {
            setOpenCreate(false);
            setEditInvoice(null);
            fetchInvoices();
          }}
        />
      )}

      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 print-hidden">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-500">Sales</span> Invoices
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Create, track, and manage your customer billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {/* 🟢 Inline Date Filter (Locked to FY) */}
            <div className="bg-neutral-900/80 border border-neutral-800 p-2 rounded-xl flex items-center gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2 px-2 text-amber-500">
                <CalendarDays size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Period:</span>
              </div>
              <input 
                type="date" 
                value={localStart}
                min={startDate || undefined} // 🟢 FIX APPLIED HERE
                max={endDate || undefined}   // 🟢 FIX APPLIED HERE
                onChange={(e) => setLocalStart(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-lg px-2 py-1 text-xs text-white outline-none"
              />
              <span className="text-neutral-600 text-xs">to</span>
              <input 
                type="date" 
                value={localEnd}
                min={startDate || undefined} // 🟢 FIX APPLIED HERE
                max={endDate || undefined}   // 🟢 FIX APPLIED HERE
                onChange={(e) => setLocalEnd(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-lg px-2 py-1 text-xs text-white outline-none"
              />
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

            <button
              onClick={() => setOpenBank(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                bankDetails
                  ? "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                  : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
              }`}
            >
              <Building2 size={18} />
            </button>

            <button
              onClick={() =>
                bankDetails
                  ? setOpenCreate(true)
                  : alert("Please add your Bank Details first so they can be printed on the invoice.")
              }
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus size={18} strokeWidth={2.5} /> 
              New Invoice
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 backdrop-blur-sm print-hidden">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or invoice number..."
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 pl-11 pr-4 py-2.5 rounded-xl text-white transition-all outline-none"
            />
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 px-4 py-2.5 rounded-xl text-white pr-10 appearance-none outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Invoices</option>
              <option value="DRAFT">Drafts Only</option>
              <option value="PAID">Paid Only</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Wide Table Section */}
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[1600px]">
              <thead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/50 border-b border-neutral-800/60">
                <tr>
                  <th className="px-4 py-4 text-center">Sr. No.</th>
                  <th className="px-4 py-4 whitespace-nowrap">Invoice Date</th>
                  <th className="px-4 py-4 whitespace-nowrap">Invoice No.</th>
                  <th className="px-4 py-4">Customer Name</th>
                  <th className="px-4 py-4 whitespace-nowrap">GSTIN</th>
                  <th className="px-4 py-4 whitespace-nowrap">Place of Supply</th>
                  <th className="px-4 py-4">Item Description</th>
                  <th className="px-4 py-4">HSN/SAC</th>
                  <th className="px-4 py-4 text-center">Qty</th>
                  <th className="px-4 py-4 text-right">Rate (₹)</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">Taxable Val (₹)</th>
                  <th className="px-4 py-4 text-center">GST %</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">GST Amt (₹)</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap">Invoice Val (₹)</th>
                  <th className="px-4 py-4 text-center">Mode</th>
                  <th className="px-4 py-4">Remarks</th>
                  <th className="px-4 py-4 text-center print-hidden">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/60">
                {!loading && flattenedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-24 text-center">
                      <div className="flex flex-col items-center text-neutral-500">
                        <div className="h-16 w-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4 print-hidden">
                          <FileText size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg">No invoices found for this period.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  flattenedInvoices.map((row, idx) => {
                    const item = row.item;
                    const rate = item?.price || 0;
                    const qty = item?.quantity || 0;
                    const disc = item?.discount || 0;
                    const taxable = (rate * qty) * (1 - disc / 100);
                    const gstRate = item?.tax || row.tax || 0;
                    const gstAmount = taxable * (gstRate / 100);

                    return (
                      <tr key={`${row.id}-${idx}`} className="hover:bg-neutral-800/20 transition-colors duration-200">
                        <td className="px-4 py-3 text-center text-neutral-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-neutral-300">
                          {new Date(row.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-neutral-300 font-mono text-xs">{row.invoiceNumber}</td>
                        <td className="px-4 py-3 text-white font-medium">{row.customerName}</td>
                        <td className="px-4 py-3 text-neutral-400 text-xs">{row.customerTaxId || "-"}</td>
                        <td className="px-4 py-3 text-neutral-400">{row.placeOfSupply || "-"}</td>
                        <td className="px-4 py-3 text-white font-medium">{item?.productName || "-"}</td>
                        <td className="px-4 py-3 text-neutral-400 text-xs">{item?.hsnSac || "-"}</td>
                        <td className="px-4 py-3 text-center font-medium text-neutral-200">
                          {qty} <span className="text-neutral-500 text-[10px]">{formatUnit(item?.unit)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-300">{rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right text-neutral-300">{taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-center text-neutral-300">{gstRate}%</td>
                        <td className="px-4 py-3 text-right text-rose-400">{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right text-amber-500 font-bold">₹{row.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-300">
                            {row.paymentMode || "CASH"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs truncate max-w-[150px]">{row.remarks || "-"}</td>
                        
                        <td className="px-4 py-3 print-hidden">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoice/${row.id}/download`, "_blank")}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                              title="Download Invoice"
                            >
                              <Download size={16} />
                            </button>
                            {row.status === "DRAFT" && (
                              <button 
                                onClick={() => setEditInvoice(row)}
                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                                title="Edit Invoice"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}