"use client";

import Link from "next/link";
import Image from "next/image";
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
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userProfile, signOut, hasPermission } = useAuth();
  const photoUrl = (userProfile as any)?.photoUrl as string | null | undefined;

  const NAV_ITEMS = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "view_dashboard" as const,
    },
    {
      label: "Products",
      href: "/medicines",
      icon: Package,
      permission: "view_stock" as const,
    },
    {
      label: "Sales (POS)",
      href: "/pos",
      icon: ShoppingCart,
      permission: "manage_sales" as const,
    },
    {
      label: "Orders & Accounts",
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
      label: "Staff & RBAC",
      href: "/users",
      icon: Users,
      permission: "manage_users" as const,
      adminOnly: true,
    },
    {
      label: "Audit Logs",
      href: "/audit",
      icon: History,
      adminOnly: true,
      badge: "STRICT",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out border-r border-[#2A0E0E]/80 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "linear-gradient(180deg, #140808 0%, #1A0A0A 60%, #0E0505 100%)" }}
      >
        {/* Top Header: Brand Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Red pill icon badge */}
            <div className="w-10 h-10 rounded-2xl bg-[#DC2626] flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 text-white rotate-45" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-wide">
                Lurix Pharma
              </div>
              <div className="text-[9px] font-extrabold tracking-widest text-[#DC2626] uppercase">
                Bangladesh
              </div>
            </div>
          </Link>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Landing Link Pill */}
        <div className="px-5 pb-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#1F0D0D] hover:bg-[#2A1010] border border-[#3A1515] text-xs font-semibold text-[#C08888] transition-all group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Visit Landing Page</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#DC2626]/20 text-[#FF6666] border border-[#DC2626]/30 uppercase tracking-wide">
              Public
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-2 border-t border-[#2A0E0E]" />

        {/* Navigation Links Scrollable List */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            // Permission filter
            if (item.adminOnly && userProfile?.role !== "SuperAdmin" && userProfile?.role !== "Admin") {
              return null;
            }
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? "bg-[#DC2626] text-white shadow-lg shadow-red-900/40 translate-x-1"
                    : "text-[#A07070] hover:text-white hover:bg-[#2D1010]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#905050]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-md uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#3A1010] text-[#FF7070] border border-[#DC2626]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-[#2A0E0E]">
          <div className="p-3 rounded-2xl bg-[#1F0D0D] border border-[#3A1515] flex items-center justify-between">
            <Link href="/settings" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-[#140808] border border-[#DC2626]/40 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                {photoUrl ? (
                  <Image src={photoUrl} alt="avatar" fill sizes="32px" className="object-cover" />
                ) : (
                  <span>{userProfile?.displayName ? getInitials(userProfile.displayName) : "U"}</span>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#DC2626] ring-1 ring-[#140808]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#FF7070] transition-colors">
                  {userProfile?.displayName || "Pharmacist"}
                </div>
                <div className="text-[10px] text-[#DC2626] font-semibold uppercase tracking-wider">
                  {userProfile?.role || "Staff"}
                </div>
              </div>
            </Link>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-xl text-[#905050] hover:text-red-400 hover:bg-white/5 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
