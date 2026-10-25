"use client";

import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Eye, 
  Trash2, 
  Printer, 
  Search, 
  Bell, 
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Pill
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

export function DashboardPreviewMockup() {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-[#0C332A]/5 p-2 sm:p-4 border border-emerald-500/20 shadow-glow-dark hover:shadow-2xl hover:scale-[1.005] transition-all duration-500 backdrop-blur-md">
      {/* Mockup Window Header Bar */}
      <div className="bg-[#0A2922] px-4 py-2.5 rounded-t-2xl flex items-center justify-between text-xs text-emerald-200/70 border-b border-emerald-800/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-emerald-300/80 hidden sm:inline">
            https://pharmacy.app/dashboard
          </span>
        </div>
        <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
          Live System Preview
        </span>
      </div>

      {/* Main App Canvas */}
      <div className="bg-[#F2F5F3] rounded-b-2xl flex flex-col lg:flex-row overflow-hidden border border-t-0 border-emerald-950/10">
        {/* Left Dark Emerald Sidebar (Pharmly Inspired) */}
        <aside aria-label="Mockup Sidebar" className="hidden lg:flex w-64 bg-[#0C332A] p-5 flex-col justify-between text-emerald-100 shrink-0">
          <div className="space-y-6">
            {/* Sidebar Brand */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center text-brand-950 font-bold shadow-md">
                  <Pill className="w-5 h-5 -rotate-45" />
                </div>
                <span className="font-bold text-lg text-white tracking-wide">
                  {APP_CONFIG.shortName}
                </span>
              </div>
              <div className="w-5 h-5 rounded-md border border-emerald-700/60 flex items-center justify-center text-[10px] text-emerald-400">
                ⌘
              </div>
            </div>

            {/* Menu Navigation */}
            <nav className="space-y-1.5 text-sm">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-400 text-brand-950 font-semibold shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 cursor-pointer transition-colors">
                <Package className="w-4 h-4" />
                <span>Products & Stock</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 cursor-pointer transition-colors">
                <ShoppingCart className="w-4 h-4" />
                <span>New Sale / POS</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 cursor-pointer transition-colors">
                <DollarSign className="w-4 h-4" />
                <span>Daily Accounts</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 cursor-pointer transition-colors">
                <Users className="w-4 h-4" />
                <span>Staff & Roles</span>
              </div>
            </nav>
          </div>

          <div className="space-y-4 pt-6 border-t border-emerald-900/60">
            {/* Pro Badge Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/80 to-[#0A261F] border border-emerald-700/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-brand-300 font-semibold">
                <div className="w-5 h-5 rounded-md bg-brand-400/20 flex items-center justify-center">
                  🛡️
                </div>
                <span>Active Pharmacy</span>
              </div>
              <p className="text-emerald-200/60 text-[11px] leading-tight">
                Dhaka Timezone & BDT Currency active with zero stock drift.
              </p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 text-xs text-emerald-300/70">
              <LogOut className="w-4 h-4" />
              <span>Shift: Active</span>
            </div>
          </div>
        </aside>

        {/* Right Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-auto">
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pharmacy Overview</h2>
              <p className="text-xs text-gray-500">Live operational data for today in Asia/Dhaka</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines, batches..."
                  readOnly
                  aria-label="Search medicines, batches"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-xs border border-gray-200/80 focus:outline-none shadow-sm text-gray-600"
                />
              </div>
              <div className="w-9 h-9 rounded-xl bg-white shadow-neu-sm flex items-center justify-center text-gray-600">
                <Bell className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-brand-800 text-brand-200 flex items-center justify-center text-xs font-bold">
                  RX
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-gray-800">Chief Pharmacist</div>
                  <div className="text-[10px] text-emerald-700">Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards Row with 3D Hover & Color Glows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Profit Card (Dark Emerald Glow) */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0C382E] to-[#124E40] text-white p-4 shadow-neu-flat hover:shadow-glow-emerald hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border border-emerald-500/20 group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-brand-400 group-hover:text-brand-950 flex items-center justify-center text-brand-300 transition-colors">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-400/20 text-brand-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-medium text-emerald-200/70">Total Net Profit</p>
                <p className="text-2xl font-black tracking-tight text-white mt-0.5">৳ 48,250</p>
                <p className="text-[10px] text-emerald-300/60 mt-1">Net of COGS & daily expenses</p>
              </div>
            </div>

            {/* Total Sales Card */}
            <div className="rounded-2xl bg-white p-4 shadow-neu-flat hover:shadow-glow-mint hover:-translate-y-1 transition-all duration-300 border border-emerald-950/5 flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-brand-800 group-hover:text-white flex items-center justify-center text-brand-800 transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Today
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-medium text-gray-500">Gross Sales Volume</p>
                <p className="text-2xl font-black tracking-tight text-gray-900 mt-0.5">৳ 1,84,320</p>
                <p className="text-[10px] text-gray-400 mt-1">Cash, bKash & Nagad verified</p>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="rounded-2xl bg-white p-4 shadow-neu-flat hover:shadow-glow-orange hover:-translate-y-1 transition-all duration-300 border border-emerald-950/5 flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-amber-600 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  +6.8%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-medium text-gray-500">Completed Orders</p>
                <p className="text-2xl font-black tracking-tight text-gray-900 mt-0.5">342 Sales</p>
                <p className="text-[10px] text-gray-400 mt-1">Avg ৳ 538 per transaction</p>
              </div>
            </div>

            {/* Efficiency Highlight Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4 shadow-neu-flat hover:shadow-glow-emerald hover:-translate-y-1 transition-all duration-300 border border-emerald-200/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Inventory Health
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-emerald-950">99.4% Stock Accuracy</p>
                <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                  Automated weighted average cost & multi-unit deduction active.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Charts & Highlights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Analytics Capsule Chart (2 Cols) */}
            <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-neu-flat border border-emerald-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Hourly Sales Velocity</h3>
                  <p className="text-[11px] text-gray-400">Peak customer volume throughout day</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Dhaka Shift
                  </span>
                </div>
              </div>

              {/* Capsule Pill Bar Visualization */}
              <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
                {[
                  { time: "9 AM", height: "40%", val: "৳8.2k" },
                  { time: "11 AM", height: "65%", val: "৳14.5k" },
                  { time: "1 PM", height: "50%", val: "৳11.1k" },
                  { time: "3 PM", height: "75%", val: "৳18.6k" },
                  { time: "5 PM", height: "95%", val: "৳26.4k", active: true },
                  { time: "7 PM", height: "82%", val: "৳21.0k" },
                  { time: "9 PM", height: "60%", val: "৳13.8k" },
                  { time: "11 PM", height: "35%", val: "৳6.9k" },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full max-w-[28px] h-32 bg-gray-100 rounded-full flex flex-col justify-end p-1 relative overflow-hidden shadow-inner">
                      {bar.active && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10 animate-bounce">
                          {bar.val}
                        </div>
                      )}
                      <div
                        style={{ height: bar.height }}
                        className={`w-full rounded-full transition-all duration-500 ${
                          bar.active
                            ? "bg-brand-500 shadow-md ring-2 ring-brand-300"
                            : "bg-[#0C382E] hover:bg-emerald-700"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{bar.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Medicine Widget (Pharmly Style Vertical Pills) */}
            <div className="rounded-2xl bg-white p-5 shadow-neu-flat border border-emerald-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Top Dispensed</h3>
                  <p className="text-[11px] text-gray-400">By quantity & profit contribution</p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">This Week</span>
              </div>

              {/* 3 Prominent Medicine Vertical Capsule Bars */}
              <div className="flex items-end justify-around h-44 pt-4">
                {/* 1. Napa Extra (Orange) */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-36 bg-gray-100 rounded-full p-1 flex flex-col justify-end shadow-inner">
                    <div className="w-full h-4/5 rounded-full bg-gradient-to-t from-orange-600 to-orange-400 flex flex-col items-center justify-between py-2 text-white shadow-sm">
                      <span className="text-[9px] font-bold rotate-90 whitespace-nowrap mt-4">
                        Napa Extra
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center text-[10px] font-bold shadow">
                        💊
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">৳24,500</span>
                </div>

                {/* 2. Seclo 20mg (Dark Green) */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-36 bg-gray-100 rounded-full p-1 flex flex-col justify-end shadow-inner">
                    <div className="w-full h-3/5 rounded-full bg-gradient-to-t from-[#0C382E] to-emerald-700 flex flex-col items-center justify-between py-2 text-white shadow-sm">
                      <span className="text-[9px] font-bold rotate-90 whitespace-nowrap mt-3">
                        Seclo 20mg
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white text-emerald-800 flex items-center justify-center text-[10px] font-bold shadow">
                        🌿
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">৳18,200</span>
                </div>

                {/* 3. Ceevit (Lime) */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-36 bg-gray-100 rounded-full p-1 flex flex-col justify-end shadow-inner">
                    <div className="w-full h-2/5 rounded-full bg-gradient-to-t from-lime-600 to-lime-400 flex flex-col items-center justify-between py-1.5 text-white shadow-sm">
                      <span className="text-[8px] font-bold rotate-90 whitespace-nowrap mt-1">
                        Ceevit
                      </span>
                      <div className="w-5 h-5 rounded-full bg-white text-lime-700 flex items-center justify-center text-[9px] font-bold shadow">
                        🍋
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">৳9,400</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table (Matching Screenshot Style) */}
          <div className="rounded-2xl bg-white p-5 shadow-neu-flat border border-emerald-950/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Latest Completed Sales</h3>
              <span className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer">
                View All Transactions →
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Invoice #</th>
                    <th className="pb-3 font-semibold">Medicine Dispensed</th>
                    <th className="pb-3 font-semibold">Total Price</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-900">#INV-5892</td>
                    <td className="py-3 font-medium text-gray-800">Atorvastatin 10mg (2 Strips)</td>
                    <td className="py-3 font-bold text-gray-900">৳ 240.00</td>
                    <td className="py-3 text-gray-600 font-medium">bKash</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button aria-label="Print receipt" className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-800">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-900">#INV-5891</td>
                    <td className="py-3 font-medium text-gray-800">Omeprazole 20mg (1 Box)</td>
                    <td className="py-3 font-bold text-gray-900">৳ 650.00</td>
                    <td className="py-3 text-gray-600 font-medium">Cash</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button aria-label="Print receipt" className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-800">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-900">#INV-5890</td>
                    <td className="py-3 font-medium text-gray-800">Metformin 500mg + Napa Extra</td>
                    <td className="py-3 font-bold text-gray-900">৳ 410.00</td>
                    <td className="py-3 text-gray-600 font-medium">Nagad</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button aria-label="Print receipt" className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-800">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
