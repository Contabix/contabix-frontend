"use client";

import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  endpoint: string;
  onClose: () => void;
  onDeleted: () => void;
};

export default function ConfirmDeleteModal({
  id,
  endpoint,
  onClose,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Confirm Delete
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-neutral-400 mb-6">
          Are you sure you want to delete this record?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black rounded-md"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
