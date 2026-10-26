"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  ArrowRight, 
  RefreshCw,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { formatDhakaDateTime } from "@/lib/timezone";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accountsSummary, setAccountsSummary] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [accRes, salesRes, medRes, repRes] = await Promise.all([
        fetch("/api/accounts", { headers }),
        fetch("/api/sales?limit=6", { headers }),
        fetch("/api/medicines?lowStock=true", { headers }),
        fetch("/api/reports?range=7days", { headers }),
      ]);

      if (accRes.ok)   setAccountsSummary((await accRes.json()).summary);
      if (salesRes.ok) setRecentSales((await salesRes.json()).sales || []);
      if (medRes.ok)   setLowStockMedicines((await medRes.json()).medicines || []);
      if (repRes.ok)   setChartData((await repRes.json()).dailyTrend || []);
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F2F2]">
      <DashboardHeader title="Pharmacy Overview" subtitle="Dashboard > Overview" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-red-950/5 shadow-neu-flat">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.displayName || "Pharmacist"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time stock analytics and sales monitoring • Asia/Dhaka
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all shadow-neu-sm active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>

            <Link
              href="/pos"
              className="liquid-btn flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-900/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS</span>
            </Link>

            <Link
              href="/medicines"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm border border-red-950/10 shadow-neu-sm transition-all"
            >
              <Package className="w-4 h-4 text-brand-600" />
              <span>Inventory</span>
            </Link>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Today's Revenue */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat relative overflow-hidden group hover:shadow-neu-elevated transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                ৳{(accountsSummary?.totalRevenue || 0).toLocaleString("en-BD")}
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                {accountsSummary?.transactionCount || 0} completed orders
              </p>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat relative overflow-hidden group hover:shadow-neu-elevated transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross Profit</span>
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-orange-600 tracking-tight">
                ৳{(accountsSummary?.grossProfit || 0).toLocaleString("en-BD")}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                COGS: ৳{(accountsSummary?.totalCOGS || 0).toLocaleString("en-BD")}
              </p>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat relative overflow-hidden group hover:shadow-neu-elevated transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Profit</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${(accountsSummary?.netProfit || 0) >= 0 ? "text-gray-900" : "text-brand-600"}`}>
                ৳{(accountsSummary?.netProfit || 0).toLocaleString("en-BD")}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Expenses: ৳{(accountsSummary?.totalExpenses || 0).toLocaleString("en-BD")}
              </p>
            </div>
          </div>

          {/* Low Stock Warning */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat relative overflow-hidden group hover:shadow-neu-elevated transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Alert</span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${lowStockMedicines.length > 0 ? "bg-amber-100 text-amber-700" : "bg-brand-50 text-brand-600"}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                {lowStockMedicines.length}
              </div>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                {lowStockMedicines.length > 0 ? "Requires restock attention" : "All medicines stocked"}
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Revenue Trend Chart */}
        <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue &amp; Profit Performance (7 Days)</h2>
              <p className="text-xs text-gray-400">Daily financial trajectory in Asia/Dhaka accounting timezone</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    formatter={(val: any) => [`৳${val}`, ""]} 
                    contentStyle={{ borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="revenue"     name="Revenue"      stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="grossProfit" name="Gross Profit"  stroke="#F97316" strokeWidth={2}   fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No recent transactions to plot trend. Start selling to see analytics.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid: Low Stock Alert & Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Low Stock Items */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-gray-900">Low Stock Medicines</h2>
              </div>
              <Link href="/medicines" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Manage Stock
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto max-h-80 space-y-2">
              {lowStockMedicines.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-brand-400/50 mb-2" />
                  Inventory is healthy. All medicines are above minimum thresholds.
                </div>
              ) : (
                lowStockMedicines.map((med) => (
                  <div
                    key={med._id}
                    className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900">{med.name}</div>
                      {med.banglaName && (
                        <div className="text-[11px] text-gray-400">{med.banglaName}</div>
                      )}
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Selling: ৳{med.baseSellingPrice} / {med.baseUnit}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                        {med.currentStock} {med.baseUnit} left
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Min threshold: {med.lowStockThreshold}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent POS Transactions */}
          <div className="bg-white rounded-3xl p-6 border border-red-950/5 shadow-neu-flat flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
              </div>
              <Link href="/accounts" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View Accounts
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto max-h-80 space-y-2">
              {recentSales.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <ShoppingCart className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  No transactions recorded yet today.
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale._id}
                    className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{sale.invoiceNumber}</span>
                        {sale.isCancelled && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-brand-100 text-brand-700 rounded-md">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span>{formatDhakaDateTime(sale.createdAt)}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-500">{sale.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">
                        ৳{sale.finalTotal.toLocaleString("en-BD")}
                      </div>
                      <div className="text-[10px] text-orange-600 font-medium">
                        Profit: ৳{sale.grossProfit.toLocaleString("en-BD")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
