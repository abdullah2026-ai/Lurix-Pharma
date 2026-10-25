"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, LogOut, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/constants";

export default function PendingApprovalPage() {
  const { userProfile, signOut, refreshSession } = useAuth();
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshSession();
    setChecking(false);

    if (userProfile?.status === "Active") {
      toast.success("Congratulations! Your account has been approved.");
      router.push("/dashboard");
    } else {
      toast.info("Account is still pending administrator review.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5F3] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-neu-flat border border-emerald-950/5 text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Pending Approval
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to {APP_CONFIG.name}
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your employee profile for <strong>{userProfile?.email || "your account"}</strong> has been submitted. For pharmacy security, an authorized Administrator must review and approve your access before you can view inventory or operate the point of sale.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Shield className="w-4 h-4 text-brand-600" />
            <span>Role-Based Access Enforcement</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Once approved, your assigned permissions (POS, stock, reports, discount limits) will automatically sync to your device.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-2xl shadow-neu-button flex items-center justify-center gap-2 text-xs sm:text-sm liquid-btn transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={signOut}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
