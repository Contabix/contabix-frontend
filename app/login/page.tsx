// login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { Package, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Enforce Email Verification
      if (!userCredential.user.emailVerified) {
        await signOut(auth); // Kick them back out
        throw new Error("Please verify your email address before logging in. Check your inbox.");
      }

      setSuccess("Login successful! Syncing session...");
      
      // Your global useAuth hook will detect this and hit backend /auth/login
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); 
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      
      setSuccess("Google login successful! Syncing session...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Google login failed.");
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
            Welcome <span className="text-amber-500">Back</span>
          </h1>
          <p className="text-neutral-500 mt-2 text-sm">Sign in to your Contabix dashboard</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-5">
          {error && <div className="text-rose-400 bg-rose-500/10 p-3 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
          {success && <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={16}/>{success}</div>}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/50 outline-none rounded-2xl px-4 py-3 text-white transition-colors" 
              />
            </div>
            
            <button type="submit" disabled={loading || !email || !password} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black py-3.5 rounded-2xl font-bold transition-colors mt-2">
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-500 text-sm">Or</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white hover:bg-gray-100 text-black py-3.5 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Sign in with Google
          </button>
          
          <div className="pt-2 text-center text-sm text-neutral-500">
            Don't have an account? <Link href="/signup" className="text-amber-500 hover:text-amber-400">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}