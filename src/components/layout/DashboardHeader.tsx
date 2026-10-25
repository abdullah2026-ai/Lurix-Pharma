"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, AlertTriangle, Clock, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDhakaDateTime } from "@/lib/timezone";

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ onToggleSidebar, title, subtitle }: HeaderProps) {
  const { userProfile } = useAuth();
  const [dhakaTime, setDhakaTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => setDhakaTime(formatDhakaDateTime(new Date()));
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#F2F5F3]/90 backdrop-blur-md border-b border-emerald-950/5 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-white shadow-neu-sm text-brand-900 hover:text-brand-700 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {title || "Pharmacy Operations"}
          </h1>
          {subtitle && <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls: Dhaka Clock & User Badge */}
      <div className="flex items-center gap-3">
        {/* Asia/Dhaka Live Shift Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-neu-sm text-xs font-medium text-emerald-900/80">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{dhakaTime || "Dhaka (GMT+6)"}</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-xl bg-brand-800 text-brand-200 flex items-center justify-center text-xs font-bold shadow-sm">
            {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-gray-800 leading-tight">
              {userProfile?.displayName || userProfile?.email?.split("@")[0] || "Staff"}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium capitalize">
              {userProfile?.role || "Employee"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
