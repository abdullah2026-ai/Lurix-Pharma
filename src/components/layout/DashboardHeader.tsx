"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  Search, 
  Plus, 
  ExternalLink, 
  Wifi, 
  Bell, 
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardHeader({ title = "Dashboard", subtitle = "Overview > List data" }: HeaderProps) {
  const { userProfile } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [searchVal, setSearchVal] = useState("");
  const router = useRouter();

  const photoUrl = (userProfile as any)?.photoUrl as string | null | undefined;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/medicines?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F5F2F2]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-[#E8D8D8]/70">
      {/* Left: Hamburger (Mobile) + Title Breadcrumbs */}
      <div className="flex items-center gap-3.5">
        {/* Neumorphic Hamburger Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden w-11 h-11 rounded-2xl bg-[#F0EAEA] text-[#1A0606] flex items-center justify-center shadow-neu-button active:shadow-neu-pressed transition-all flex-shrink-0 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1A0606] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[11px] font-medium text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center: Desktop Inset Neumorphic Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand, generic (e.g. Napa, Seclo, Metformin)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#EDE8E8] shadow-[inset_2px_2px_5px_rgba(200,180,180,0.42),inset_-2px_-2px_5px_rgba(255,255,255,0.95)] text-xs text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-brand-600/30 focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Right: Quick Action Buttons & Profile Card */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick New Sale button */}
        <Link
          href="/pos"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#F0EAEA] text-brand-700 flex items-center justify-center shadow-neu-button hover:bg-white active:shadow-neu-pressed transition-all"
          title="New Sale (POS)"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </Link>

        {/* Public portal link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex w-10 h-10 rounded-2xl bg-[#F0EAEA] text-gray-600 items-center justify-center shadow-neu-button hover:bg-white active:shadow-neu-pressed transition-all"
          title="Open Landing Page"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        {/* Live Wifi / Online indicator */}
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#F0EAEA] text-brand-600 flex items-center justify-center shadow-neu-button transition-all relative"
          title="System Online • Asia/Dhaka Cloud Sync"
        >
          <Wifi className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
        </div>

        {/* Bell Notifications */}
        <button
          type="button"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#F0EAEA] text-gray-600 flex items-center justify-center shadow-neu-button hover:bg-white active:shadow-neu-pressed transition-all relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Pill Card */}
        <Link
          href="/settings"
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl bg-[#F0EAEA] shadow-neu-button hover:bg-white active:shadow-neu-pressed transition-all ml-1"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#1A0606] ring-2 ring-brand-500/40 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
            {photoUrl ? (
              <Image src={photoUrl} alt="User" fill sizes="32px" className="object-cover" />
            ) : (
              <span>{userProfile?.displayName ? getInitials(userProfile.displayName) : "U"}</span>
            )}
          </div>

          <div className="hidden md:block text-left">
            <div className="text-[11px] font-bold text-[#1A0606] leading-tight">
              {userProfile?.role === "SuperAdmin" ? "Dr. " + (userProfile.displayName || "Admin") : userProfile?.displayName || "Staff"}
            </div>
            <div className="text-[9px] font-extrabold text-brand-600 uppercase tracking-wider">
              {userProfile?.role || "Staff"}
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
        </Link>
      </div>
    </header>
  );
}
