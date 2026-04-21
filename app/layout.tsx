//@ts-ignore
import "@/app/globals.css"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { FinancialYearProvider } from "@/context/FinancialYearContext"; 
// ❌ REMOVED: FinancialYearGateway
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <FinancialYearProvider>
            {/* ❌ REMOVED Gateway Wrapper Here */}
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
          </FinancialYearProvider>
        </AuthProvider>
      </body>
    </html>
  );
}