"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  DollarSign, 
  Receipt, 
  Package, 
  Award,
  CreditCard,
  PieChart as PieIcon
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const [range, setRange] = useState<"today" | "7days" | "30days">("7days");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/reports?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load business reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const summary = reportData?.summary;
  const topMedicines = reportData?.topMedicines || [];
  const dailyTrend = reportData?.dailyTrend || [];
  const paymentMethods = reportData?.paymentMethods || { Cash: 0, bKash: 0, Nagad: 0 };

  const paymentChartData = [
    { name: "Cash", value: paymentMethods.Cash || 0, color: "#059669" },
    { name: "bKash", value: paymentMethods.bKash || 0, color: "#DB2777" },
    { name: "Nagad", value: paymentMethods.Nagad || 0, color: "#D97706" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Business Reports & Analytics" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Controls */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-950/5 shadow-neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Intelligence</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Historical profit calculations, revenue velocity, and top-moving medicines
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Range Toggle */}
            <div className="flex rounded-2xl bg-gray-100 p-1 text-xs font-semibold">
              {(["today", "7days", "30days"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                    range === r ? "bg-white shadow text-gray-900 font-bold" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {r === "today" ? "Today" : r === "7days" ? "Past 7 Days" : "Past 30 Days"}
                </button>
              ))}
            </div>

            <button
              onClick={fetchReports}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* 6 Metric Summaries */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Gross Revenue</span>
            <div className="text-lg sm:text-xl font-extrabold text-gray-900 mt-1">
              ৳{(summary?.totalRevenue || 0).toLocaleString("en-BD")}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Inventory Cost (COGS)</span>
            <div className="text-lg sm:text-xl font-extrabold text-gray-600 mt-1">
              ৳{(summary?.totalCOGS || 0).toLocaleString("en-BD")}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Gross Profit</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
              ৳{(summary?.totalGrossProfit || 0).toLocaleString("en-BD")}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Expenses</span>
            <div className="text-lg sm:text-xl font-extrabold text-rose-600 mt-1">
              ৳{(summary?.totalExpenses || 0).toLocaleString("en-BD")}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Net Profit</span>
            <div className={`text-lg sm:text-xl font-extrabold mt-1 ${(summary?.netProfit || 0) >= 0 ? "text-brand-700" : "text-rose-600"}`}>
              ৳{(summary?.netProfit || 0).toLocaleString("en-BD")}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Avg Sale Value</span>
            <div className="text-lg sm:text-xl font-extrabold text-gray-900 mt-1">
              ৳{(summary?.averageOrderValue || 0).toLocaleString("en-BD")}
            </div>
          </div>
        </div>

        {/* Financial Velocity Chart */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Revenue vs Net Profit Trajectory</h2>
            <p className="text-xs text-gray-500">Asia/Dhaka day-to-day accounting curve</p>
          </div>

          <div className="h-72 w-full">
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    formatter={(val: any) => [`৳${val}`, ""]} 
                    contentStyle={{ borderRadius: "16px", border: "1px solid #e5e7eb" }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#repRev)" />
                  <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#repNet)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No transaction data in this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid: Top Selling Medicines & Payment Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top 10 Medicines (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900">Top Moving Medicines by Revenue</h2>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400">
                        No sales recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    topMedicines.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/70">
                        <td className="py-3 px-4 font-bold text-gray-400">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {m.name}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-600">
                          {m.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-brand-700">
                          ৳{m.revenue.toLocaleString("en-BD")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Share (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-gray-900">Payment Breakdown</h2>
              </div>

              <div className="space-y-4">
                {paymentChartData.map((pm) => {
                  const total = (summary?.totalRevenue || 1);
                  const pct = Math.round((pm.value / (total || 1)) * 100);
                  return (
                    <div key={pm.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">{pm.name}</span>
                        <span className="text-gray-900">৳{pm.value.toLocaleString("en-BD")} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: pm.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 mt-6">
              <div className="font-semibold mb-1">Financial Reconciliation:</div>
              <p className="text-[11px] text-emerald-800/80">
                All receipts and historical costs are locked to exact sales snapshots to preserve accounting integrity.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
