"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Loader2 } from "lucide-react";

function ProtectedDashboardShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { firebaseUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        router.push("/login");
      } else if (userProfile && userProfile.status === "Pending") {
        router.push("/pending");
      }
    }
  }, [loading, firebaseUser, userProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F2] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
        <p className="text-xs font-semibold text-emerald-950/70 tracking-wide">
          Verifying Pharmacy Credentials...
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F2] flex">
      {/* Sidebar Component with Context Support */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ProtectedDashboardShell>{children}</ProtectedDashboardShell>
      </SidebarProvider>
    </AuthProvider>
  );
}
