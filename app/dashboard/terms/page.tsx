"use client";

import { Scale, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();
  const lastUpdated = "April 21, 2026";

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 animate-in fade-in duration-500">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-400 hover:text-amber-500 transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          Terms of <span className="text-amber-500">Service</span>
        </h1>
        <p className="text-neutral-400 text-lg">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="space-y-12 text-neutral-300 leading-relaxed">
        
        {/* Intro */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>Contabix</strong> ("we," "us" or "our"), concerning your access to and use of our SaaS platform. You agree that by accessing the application, you have read, understood, and agreed to be bound by all of these Terms.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-semibold">1. Account Registration & Security</h2>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li>You must provide accurate, current, and complete business information during the registration process (including GSTIN and Bank Details where applicable).</li>
            <li>You are responsible for safeguarding the password and OTP authentication methods that you use to access the service.</li>
            <li>You agree to notify us immediately of any unauthorized use of your account or breach of security.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Scale size={24} />
            </div>
            <h2 className="text-2xl font-semibold">2. Acceptable Use</h2>
          </div>
          <p>You may not access or use the application for any purpose other than that for which we make the application available. As a user, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li>Use the platform to generate fraudulent invoices or fake financial records.</li>
            <li>Attempt to bypass any measures of the application designed to prevent or restrict access to the application.</li>
            <li>Upload or transmit viruses, Trojan horses, or other material that interferes with the use of the platform.</li>
            <li>Systematically retrieve data or other content from the application to create a database or directory without written permission from us.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-2xl font-semibold">3. Limitation of Liability & Disclaimer</h2>
          </div>
          <p className="font-medium text-neutral-200">
            Contabix is a software tool provided to assist with inventory and invoice management. We do not provide accounting, tax, or legal advice.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li>You are solely responsible for ensuring the accuracy of all data entered, including tax percentages (GST), taxable values, and invoice totals.</li>
            <li>You are responsible for compliance with all local, state, and federal tax laws and regulations.</li>
            <li>In no event will we be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, or punitive damages, including lost profit, lost revenue, loss of data, or tax penalties arising from your use of the application.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Modifications and Interruptions</h2>
          <p className="text-neutral-400">
            We cannot guarantee the application will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the application at any time or for any reason without notice to you.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-8 border-t border-neutral-800">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-neutral-400">
            If you have a complaint regarding the application or need further information, please contact us at: <br/>
            <a href="mailto:legal@contabix.com" className="text-amber-500 hover:underline mt-2 inline-block">legal@contabix.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}