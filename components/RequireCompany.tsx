"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type RequireCompanyProps = {
  children: ReactNode;
  redirectTo?: string;
};

export default function RequireCompany({
  children,
  redirectTo = "/dashboard/company",
}: RequireCompanyProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setHasCompany(!!data);
      })
      .catch(() => setHasCompany(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!hasCompany) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Company setup required
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            You must create a company before accessing this feature.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => router.push(redirectTo)}
              className="px-4 py-2 rounded-md bg-amber-500 text-black hover:bg-amber-400"
            >
              Create Company
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
