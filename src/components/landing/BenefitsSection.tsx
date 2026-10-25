"use client";

import { Check, X, ShieldAlert, Award } from "lucide-react";

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-800">
            Why Upgrade
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-950">
            Traditional Notebooks vs. Modern Pharmacy System
          </h2>
          <p className="text-sm sm:text-base text-emerald-900/70">
            Stop losing thousands of Taka in forgotten inventory, unverified staff discounts, and inaccurate profit estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Legacy / Manual Column */}
          <div className="bg-white/80 rounded-3xl p-6 sm:p-8 border border-red-200/60 shadow-neu-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Manual / Legacy Systems</h3>
                <p className="text-xs text-gray-500">Unreliable paper logs & generic POS</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Revenue mistaken for profit, ignoring medicine batch acquisition costs</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Discounts given without limits or traceability, cutting into margins</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Loose tablet vs. box mismatches causing constant inventory shortages</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>No audit trail when sales are cancelled or modified post-shift</span>
              </li>
            </ul>
          </div>

          {/* Lurix Pharma Column */}
          <div className="bg-gradient-to-br from-emerald-900 to-[#0A2E25] text-white rounded-3xl p-6 sm:p-8 shadow-neu-elevated space-y-6 border border-emerald-700/40 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-400 text-brand-950 flex items-center justify-center font-bold shadow">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Lurix Pharma System</h3>
                <p className="text-xs text-brand-200/70">Engineered for Bangladesh Pharmacies</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Accurate weighted average cost snapshots on every single sale</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Server-enforced employee discount caps in percentage and fixed Taka</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Flexible units (Tablet, Strip, Box) normalized to base stock instantly</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Append-only immutable audit log for every sale edit or cancellation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
