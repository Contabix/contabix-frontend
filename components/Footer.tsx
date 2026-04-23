import Link from "next/link";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Twitter, 
  Linkedin, 
  Github, 
  Package, 
  ChevronRight 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Ledger Accounts", href: "/dashboard/ledger" },
    { name: "Purchases", href: "/dashboard/purchase" },
    { name: "Sales Invoices", href: "/dashboard/invoices" },
  ];

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-neutral-800/60 text-neutral-400 mt-auto overflow-hidden">
      {/* Subtle Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Description */}
          <div className="space-y-6">
            <Link href="/dashboard" className="flex items-center gap-3 group w-fit">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Conta<span className="text-amber-500">bix</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Enterprise Resource Planning made incredibly simple. Track inventory, manage ledgers, and scale your business securely.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-sm text-neutral-400 hover:text-amber-400 transition-colors w-fit"
                  >
                    <ChevronRight 
                      size={14} 
                      className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all duration-300" 
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-amber-500/10 p-2 rounded-lg">
                  <MapPin size={16} className="text-amber-500 flex-shrink-0" />
                </div>
                <span className="text-neutral-400 leading-relaxed">
                   413, Pratap Bhawan,  <br />
                  5, Bahadur Shah Zafar Marg,<br />
                  New Delhi 110044, India
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <Phone size={16} className="text-amber-500 flex-shrink-0" />
                </div>
                <span className="text-neutral-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <Mail size={16} className="text-amber-500 flex-shrink-0" />
                </div>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  support@inventorypro.in
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Platforms */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Follow Us</h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="#" 
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-neutral-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>&copy; {currentYear} SNRS & Associates. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <Link href="/dashboard/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/dashboard/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}