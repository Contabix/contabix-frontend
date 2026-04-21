"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualLedgerEntryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ledgerType: "CUSTOMER",
    customerId: "", 
    particular: "",
    debit: 0,
    credit: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/ledger/manual`, {
        method: "POST",
        credentials: "include", // 👈 Magic key
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error("Failed to save entry");
      }
      
      alert("Manual entry created successfully!");
      router.push("/dashboard/ledger");
    } catch (error) {
      console.error(error);
      alert("Error creating entry. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-sans">
      <div className="max-w-2xl mx-auto p-8 bg-[#1A1A1A] rounded-xl border border-gray-800 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-white">Add Manual Ledger <span className="text-orange-500">Adjustment</span></h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ledger Type</label>
              <select
                value={formData.ledgerType}
                onChange={(e) => setFormData({ ...formData, ledgerType: e.target.value })}
                className="w-full h-12 bg-[#242424] border border-gray-700 text-white rounded-lg px-4 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="CASH">Cash / Bank</option>
              </select>
            </div>
            {formData.ledgerType === "CUSTOMER" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer ID</label>
                <input
                  type="text"
                  placeholder="Paste ID here"
                  required
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full h-12 bg-[#242424] border border-gray-700 text-white rounded-lg px-4 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Particulars (Reason)</label>
            <input
              type="text"
              placeholder="e.g. Opening Balance or Refund"
              required
              onChange={(e) => setFormData({ ...formData, particular: e.target.value })}
              className="w-full h-12 bg-[#242424] border border-gray-700 text-white rounded-lg px-4 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Debit Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.debit}
                onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })}
                className="w-full h-12 bg-[#242424] border border-gray-700 text-white rounded-lg px-4 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Credit Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })}
                className="w-full h-12 bg-[#242424] border border-gray-700 text-white rounded-lg px-4 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full h-12 bg-orange-500 text-black rounded-lg font-bold hover:bg-orange-600 transition">
            {loading ? "Saving..." : "Save Manual Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}