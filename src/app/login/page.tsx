"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Pill, Lock, Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setIsLoading(true);
      if (!auth) {
        throw new Error("Firebase client is not initialized. Check your environment variables.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Check session status with MongoDB
      const res = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.user?.status === "Pending") {
        toast.info("Account pending approval by administrator");
        router.push("/pending");
        return;
      }

      if (data.user?.status === "Disabled") {
        toast.error("Account has been deactivated. Please contact your manager.");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900/70 hover:text-brand-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center text-white mx-auto shadow-neu-sm">
            <Pill className="w-7 h-7 text-brand-300 -rotate-45" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Sign In to {APP_CONFIG.name}
          </h2>
          <p className="text-xs text-emerald-900/70">
            Enter your authorized pharmacy credentials to open shift
          </p>
        </div>

        {/* Login Neumorphic Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-neu-flat border border-emerald-950/5 relative z-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pharmacist@pharmacy.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 neu-input text-xs sm:text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 neu-input text-xs sm:text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-2xl shadow-neu-button flex items-center justify-center gap-2 liquid-btn transition-all text-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-300" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-brand-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              New employee without access?{" "}
              <Link href="/register" className="font-semibold text-brand-800 hover:underline">
                Register for Approval
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
