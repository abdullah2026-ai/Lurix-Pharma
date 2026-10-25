"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  X, 
  Pill,
  ShieldCheck,
  Building2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG } from "@/lib/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userProfile, signOut, hasPermission } = useAuth();

  const NAV_ITEMS = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "view_dashboard" as const,
    },
    {
      label: "Products & Stock",
      href: "/medicines",
      icon: Package,
      permission: "view_stock" as const,
    },
    {
      label: "New Sale / POS",
      href: "/pos",
      icon: ShoppingCart,
      permission: "manage_sales" as const,
    },
    {
      label: "Daily Accounts",
      href: "/accounts",
      icon: DollarSign,
      permission: "manage_accounts" as const,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: BarChart3,
      permission: "view_reports" as const,
    },
    {
      label: "Staff & Approvals",
      href: "/users",
      icon: Users,
      permission: "manage_users" as const,
      adminOnly: true,
    },
    {
      label: "Audit Trail",
      href: "/audit",
      icon: History,
      adminOnly: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      permission: "manage_settings" as const,
    },
  ];

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (userProfile?.role === "SuperAdmin") return true;
    if (item.adminOnly && userProfile?.role !== "Admin") return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0C332A] text-emerald-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Header & Brand */}
          <div className="flex items-center justify-between px-1">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-400 flex items-center justify-center text-brand-950 font-bold shadow-md transition-transform group-hover:scale-105">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-wide">
                  {APP_CONFIG.shortName}
                </span>
                <span className="text-[10px] text-emerald-300/70 font-medium">
                  Asia/Dhaka • BDT (৳)
                </span>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1 text-sm font-medium">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-brand-400 text-brand-950 font-bold shadow-md"
                      : "text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-950" : "text-emerald-300"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Profile and Pro Card */}
          <div className="pt-4 border-t border-emerald-900/60 space-y-4">
            {/* Status Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900/80 to-[#08221B] border border-emerald-700/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-brand-300 font-semibold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {userProfile?.role || "Employee"}
                </span>
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              </div>
              <p className="text-white font-medium truncate">{userProfile?.displayName || userProfile?.email}</p>
              {userProfile?.maxDiscountPercent ? (
                <p className="text-[10px] text-emerald-300/60">
                  Discount cap: {userProfile.maxDiscountPercent}% (or ৳{userProfile.maxDiscountFixed})
                </p>
              ) : null}
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-300/80 hover:text-white hover:bg-emerald-900/50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Shift</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
