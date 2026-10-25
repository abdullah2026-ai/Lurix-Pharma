"use client";

import Link from "next/link";
import { Pill, Shield, MapPin, Clock } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function LandingFooter() {
  return (
    <footer className="bg-[#0A2922] text-emerald-200/80 border-t border-emerald-900/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-400 flex items-center justify-center text-brand-950 font-bold shadow">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                {APP_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-emerald-300/70 max-w-sm leading-relaxed">
              Complete, production-oriented Pharmacy Management Operating System with real-time stock deductions, weighted average COGS snapshots, and secure role permissions.
            </p>
            <div className="flex items-center gap-4 text-xs text-emerald-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Bangladesh
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Asia/Dhaka (GMT+6)
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Point of Sale (POS)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Medicine Catalog & Stock
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Daily Accounts & Expenses
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Financial Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Access / Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              System Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-white transition-colors font-medium text-brand-300">
                  Staff Login Portal →
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Employee Registration
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400/80 bg-emerald-950/80 px-2 py-1 rounded">
                  <Shield className="w-3 h-3" /> Admin Approved Only
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-400/60">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          <p>Configurable for independent & multi-branch pharmacy operations.</p>
        </div>
      </div>
    </footer>
  );
}
