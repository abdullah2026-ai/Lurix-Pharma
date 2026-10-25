"use client";

import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  ShieldCheck, 
  Cloud, 
  Layers, 
  Receipt, 
  Smartphone,
  Cpu
} from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Medicine & Flexible Units",
    description: "Support base units (Tablets, Vials, Bottles) and custom conversions (Strips, Boxes) with independent selling prices and duplicate name guard.",
    tag: "Inventory"
  },
  {
    icon: ShoppingCart,
    title: "Lightning-Fast Mini POS",
    description: "Instant medicine search, unit switching, real-time discount capping, cash tendered calculation, and thermal receipt printing (58mm/80mm).",
    tag: "Point of Sale"
  },
  {
    icon: DollarSign,
    title: "Daily Accounts & True Profit",
    description: "Accurate gross profit using weighted average COGS snapshots and net profit deducting rent, electricity, and custom business expenses.",
    tag: "Finance"
  },
  {
    icon: BarChart3,
    title: "Reports & Visual Analytics",
    description: "Capsule trend charts, top-dispensed pharmaceuticals, and Asia/Dhaka midnight-to-midnight accounting boundaries without timezone drift.",
    tag: "Analytics"
  },
  {
    icon: ShieldCheck,
    title: "Granular Staff Roles & Permissions",
    description: "Multi-tier authorization (SuperAdmin, Admin, Employee) with pending registration approvals and individual max discount caps.",
    tag: "Security"
  },
  {
    icon: Cloud,
    title: "Production Cloud Architecture",
    description: "Firebase Authentication identity, MongoDB Atlas transaction protection, ImageKit media storage with Sharp optimization, and append-only audit trail.",
    tag: "Infrastructure"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-800">
            System Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-950">
            Designed Exclusively for Pharmacy Workflows
          </h2>
          <p className="text-sm sm:text-base text-emerald-900/70">
            Every feature is purpose-built to eliminate common retail pharmacy bottlenecks, inventory leakage, and financial ambiguity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            // Alternating glow accents
            const glowClass =
              index % 3 === 0
                ? "hover:shadow-glow-emerald hover:border-emerald-300"
                : index % 3 === 1
                ? "hover:shadow-glow-mint hover:border-brand-300"
                : "hover:shadow-glow-orange hover:border-amber-300";

            return (
              <div
                key={index}
                className={`bg-white rounded-3xl p-6 sm:p-7 shadow-neu-flat border border-emerald-950/5 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group ${glowClass} relative overflow-hidden`}
              >
                {/* Subtle top color shine */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-brand-50 group-hover:bg-brand-800 text-brand-800 group-hover:text-brand-300 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-emerald-900 bg-emerald-50 group-hover:bg-brand-100 px-3 py-1 rounded-xl transition-colors">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-900 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-800">
                  <span>Server-Enforced</span>
                  <span className="w-2 h-2 rounded-full bg-brand-500 group-hover:animate-ping" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
