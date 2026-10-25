"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Stock & Unit Setup",
    description: "Enter medicines with base units (Tablets/Bottles) and configured sale units (Strips/Boxes). New stock automatically recalculates weighted average cost."
  },
  {
    step: "02",
    title: "Instant Counter POS",
    description: "Pharmacists search medicines, select packaging unit, apply capped employee discounts, and choose Cash, bKash, or Nagad in seconds."
  },
  {
    step: "03",
    title: "Thermal Receipt & Stock Decrement",
    description: "Stock is atomically decremented in base units. A clean 58mm or 80mm thermal receipt prints immediately without browser clutter."
  },
  {
    step: "04",
    title: "Daily Profit Reconciliation",
    description: "At the end of the shift, view total sales, true COGS, categorized expenses (rent, electricity), and net profit for Asia/Dhaka."
  }
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 bg-white/50 border-y border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-800">
            Daily Operations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-950">
            From Stock Inflow to Counter Dispensing
          </h2>
          <p className="text-sm sm:text-base text-emerald-900/70">
            A frictionless, error-free workflow built around the reality of busy pharmacy counters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-neu-flat border border-emerald-950/5 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-3xl font-black text-brand-200/90 font-mono">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>Zero calculation error</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
