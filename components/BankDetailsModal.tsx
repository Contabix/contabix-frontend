"use client";

import { useEffect, useState } from "react";
import { X, Landmark, Fingerprint, User, ShieldCheck } from "lucide-react";

export default function BankDetailsModal({
  initialValue,
  onClose,
  onSaved,
}: {
  initialValue: string;
  onClose: () => void;
  onSaved: (val: string) => void;
}) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialValue) return;

    const lines = initialValue.split("\n");
    setBankName(lines[0]?.replace("Bank: ", "") ?? "");
    setAccountNumber(lines[1]?.replace("Account: ", "") ?? "");
    setIfsc(lines[2]?.replace("IFSC: ", "") ?? "");
    setAccountHolder(lines[3]?.replace("Holder: ", "") ?? "");
  }, [initialValue]);

  const save = async () => {
    setSaving(true);
    const combined = [
      `Bank: ${bankName}`,
      `Account: ${accountNumber}`,
      `IFSC: ${ifsc}`,
      `Holder: ${accountHolder}`,
    ].join("\n");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/bank-details`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankDetails: combined }),
      });

      onSaved(combined);
      onClose();
    } catch (error) {
      console.error("Failed to save bank details", error);
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
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bank Details
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Configure the payment details shown on your invoices.</p>
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
            <div className="relative">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Bank Name</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-neutral-500"><Landmark size={16} /></div>
                <input
                  placeholder="e.g. HDFC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Account Holder Name</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-neutral-500"><User size={16} /></div>
                <input
                  placeholder="Name as per bank records"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Account Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-neutral-500"><ShieldCheck size={16} /></div>
                  <input
                    placeholder="Account No."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">IFSC Code</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-neutral-500"><Fingerprint size={16} /></div>
                  <input
                    placeholder="IFSC Code"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-700 transition-all outline-none shadow-inner uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-3">
             <ShieldCheck size={16} className="text-amber-500/60 mt-0.5" />
             <p className="text-[11px] text-neutral-500 leading-relaxed">
               These details will be printed on the bottom of your generated invoice PDFs for client payments. Ensure they are correct before saving.
             </p>
          </div>
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
            {saving ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  );
}