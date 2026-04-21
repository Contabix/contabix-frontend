"use client";

import { Shield, Lock, Eye, Database, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
          Privacy <span className="text-amber-500">Policy</span>
        </h1>
        <p className="text-neutral-400 text-lg">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="space-y-12 text-neutral-300 leading-relaxed">
        
        {/* Intro */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
          <p>
            At <strong>Contabix</strong> ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application and services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Database size={24} />
            </div>
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          </div>
          <p>We collect information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products, or otherwise contact us. This includes:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li><strong className="text-neutral-200">Personal Information:</strong> Names, phone numbers, email addresses, and authentication data (like Firebase OTPs).</li>
            <li><strong className="text-neutral-200">Business Information:</strong> Company names, addresses, GSTINs, bank details, and business registration documents.</li>
            <li><strong className="text-neutral-200">Financial & Transactional Data:</strong> Invoices, purchase vouchers, supplier details, customer details, and inventory records you input into the system.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Eye size={24} />
            </div>
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          </div>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li>Create and manage your account.</li>
            <li>Process your financial transactions, invoices, and purchase records.</li>
            <li>Generate business reports and PDF/Excel exports as requested by you.</li>
            <li>Send you administrative information, such as updates to terms or security alerts.</li>
            <li>Respond to customer service requests and provide support.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-semibold">3. Disclosure of Your Information</h2>
          </div>
          <p>We do not sell, trade, or rent your personal or business information to third parties. We may share information we have collected about you in certain situations:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-400">
            <li><strong className="text-neutral-200">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process or to investigate potential violations of our policies.</li>
            <li><strong className="text-neutral-200">Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us, such as hosting (e.g., Vercel, Hostinger), database management, and secure authentication (e.g., Google Firebase).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-semibold">4. Data Security</h2>
          </div>
          <p>
            We use administrative, technical, and physical security measures (including bcrypt encryption and secure token authentication) to help protect your personal and business information. While we have taken reasonable steps to secure the data you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-8 border-t border-neutral-800">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-neutral-400">
            If you have questions or comments about this Privacy Policy, please contact us at: <br/>
            <a href="mailto:support@contabix.com" className="text-amber-500 hover:underline mt-2 inline-block">support@contabix.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}