// signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; 
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { Package, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", mobile: "", password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- EMAIL & PASSWORD SIGNUP ---
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setLoading(true);

    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Send Verification Email
      await sendEmailVerification(user);

      // 3. Sync profile to your NestJS Backend
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile, // Now just standard info!
          firebaseUid: user.uid 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Rollback if DB fails
        await user.delete(); 
        throw new Error(data.message || "Database synchronization failed");
      }
      
      setSuccess("Account created! Please check your email to verify before logging in.");
      
      // 4. Force sign out so they must log in after verifying their email
      await signOut(auth);

      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogleSignup = async () => {
    setError(""); 
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Split Google display name into First/Last
      const nameParts = (user.displayName || "").split(" ");
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Sync profile to backend (Mobile might be empty here, or you can prompt for it later)
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: user.email,
          mobile: formData.mobile || "N/A", 
          firebaseUid: user.uid 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // If user already exists in DB, that's fine, just push to dashboard
        if (data.message === "User already exists in database") {
          router.push("/dashboard");
          return;
        }
        await user.delete();
        throw new Error(data.message || "Database synchronization failed");
      }

      setSuccess("Google Sync complete! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err: any) {
      setError(err.message || "Google signup failed.");
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] flex justify-center items-center px-4 overflow-hidden">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-xl shadow-amber-500/20 mb-4">
            <Package size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Conta<span className="text-amber-500">bix</span>
          </h1>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-5">
          {error && <div className="text-rose-400 bg-rose-500/10 p-3 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
          {success && <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={16}/>{success}</div>}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="flex gap-4">
              <input name="firstName" placeholder="First Name" onChange={handleChange} required className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" />
            </div>
            <input name="mobile" type="tel" placeholder="Mobile Number (Optional/Info)" onChange={handleChange} className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" />
            <input name="password" type="password" placeholder="Create a Password" onChange={handleChange} required minLength={6} className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" />
            
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black py-3.5 rounded-2xl font-bold transition-colors">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-500 text-sm">Or</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          <button onClick={handleGoogleSignup} disabled={loading} className="w-full bg-white hover:bg-gray-100 text-black py-3.5 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </button>
          
          <div className="pt-2 text-center text-sm text-neutral-500">
            Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}