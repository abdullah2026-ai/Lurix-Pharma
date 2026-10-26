"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Trash2, 
  Receipt, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Check, 
  CreditCard,
  Ban,
  FileText
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/lib/constants";
import { formatDhakaDateTime, formatDhakaDate } from "@/lib/timezone";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

export default function AccountsPage() {
  const { hasPermission } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Add Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("Rent");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Cancel sale modal
  const [saleToCancel, setSaleToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingSale, setCancellingSale] = useState(false);

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch daily summary & expenses
      const accRes = await fetch(`/api/accounts?date=${selectedDate}`, { headers });
      if (accRes.ok) {
        const accData = await accRes.json();
        setSummary(accData.summary);
        setExpenses(accData.expenses || []);
      }

      // 2. Fetch sales for the day
      const salesRes = await fetch(`/api/sales?date=${selectedDate}`, { headers });
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(salesData.sales || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load accounts for the selected date");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [selectedDate]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Expense amount must be greater than 0");
      return;
    }

    try {
      setSubmittingExpense(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const payload = {
        category,
        customCategory: category === "Custom" ? customCategory : undefined,
        amount: Number(amount),
        note: note || undefined,
        expenseDate: `${selectedDate}T12:00:00.000+06:00`,
      };

      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record expense");

      toast.success("Expense recorded successfully");
      setIsExpenseModalOpen(false);
      setAmount(0);
      setNote("");
      setCustomCategory("");
      fetchAccountsData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record expense");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/accounts/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Expense removed");
      fetchAccountsData();
    } catch (err: any) {
      toast.error(err.message || "Could not delete expense");
    }
  };

  const handleExecuteCancelSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleToCancel?._id) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      setCancellingSale(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/sales/${saleToCancel._id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel sale");

      toast.success(data.message || "Sale cancelled and stock restored");
      setSaleToCancel(null);
      setCancelReason("");
      fetchAccountsData();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel sale");
    } finally {
      setCancellingSale(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Daily Accounts & Expenses" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Controls Bar with Date Selector */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-950/5 shadow-neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Accounting Day Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily revenue, cash drawer reconciliation, COGS, and expense tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-200 shadow-inner">
              <Calendar className="w-4 h-4 text-brand-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            {hasPermission("manage_expenses") && (
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-neu-flat transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}

            <button
              onClick={fetchAccountsData}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
              title="Refresh Accounts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              ৳{(summary?.totalRevenue || 0).toLocaleString("en-BD")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {summary?.transactionCount || 0} valid sales
            </p>
          </div>

          {/* COGS */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Cost of Goods (COGS)
            </span>
            <div className="mt-2 text-2xl font-extrabold text-gray-600">
              ৳{(summary?.totalCOGS || 0).toLocaleString("en-BD")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Inventory cost sold</p>
          </div>

          {/* Gross Profit */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-700">
              ৳{(summary?.grossProfit || 0).toLocaleString("en-BD")}
            </div>
            <p className="text-[10px] text-emerald-600 mt-1">Revenue minus COGS</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="mt-2 text-2xl font-extrabold text-rose-600">
              ৳{(summary?.totalExpenses || 0).toLocaleString("en-BD")}
            </div>
            <p className="text-[10px] text-rose-500 mt-1">{expenses.length} expense items</p>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Net Profit
            </span>
            <div className={`mt-2 text-2xl font-extrabold ${(summary?.netProfit || 0) >= 0 ? "text-brand-700" : "text-rose-600"}`}>
              ৳{(summary?.netProfit || 0).toLocaleString("en-BD")}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Gross profit minus expenses</p>
          </div>
        </div>

        {/* Payment Methods Cash Drawer Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Collection by Payment Channel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-800">Cash in Drawer</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  ৳{(summary?.cashSales || 0).toLocaleString("en-BD")}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                Cash
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-pink-800">bKash Merchant</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  ৳{(summary?.bkashSales || 0).toLocaleString("en-BD")}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-900">
                bKash
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-800">Nagad Merchant</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  ৳{(summary?.nagadSales || 0).toLocaleString("en-BD")}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                Nagad
              </span>
            </div>
          </div>
        </div>

        {/* Expenses List & Sales Transactions Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Log */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Expenses for this Day</h2>
              <span className="text-xs text-gray-500 font-semibold">
                Total: ৳{(summary?.totalExpenses || 0).toLocaleString("en-BD")}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No expenses recorded for this date.
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {exp.category === "Custom" ? exp.customCategory : exp.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          by {exp.createdByName}
                        </span>
                      </div>
                      {exp.note && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{exp.note}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-rose-600">
                        ৳{exp.amount.toFixed(2)}
                      </span>
                      {hasPermission("manage_expenses") && (
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sales Transactions with Cancel Action */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-neu-flat flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Sales Transactions</h2>
              <span className="text-xs text-gray-500 font-semibold">
                {sales.length} transactions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-100">
              {sales.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No sales completed on this date.
                </div>
              ) : (
                sales.map((sale) => (
                  <div key={sale._id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{sale.invoiceNumber}</span>
                        {sale.isCancelled ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                            {sale.paymentMethod}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-gray-900">
                        ৳{sale.finalTotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>{sale.items.length} item(s) • Sold by {sale.soldByName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-medium">Profit: ৳{sale.grossProfit.toFixed(2)}</span>
                        {!sale.isCancelled && hasPermission("edit_cancel_sales") && (
                          <button
                            onClick={() => setSaleToCancel(sale)}
                            className="text-rose-600 hover:text-rose-700 font-semibold text-[10px] ml-2 underline"
                          >
                            Cancel Sale
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Record Pharmacy Expense</h2>
                <button onClick={() => setIsExpenseModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {category === "Custom" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Municipal License, Signboard Fee"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electric bill paid via bKash"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingExpense}
                    className="px-5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-neu-flat"
                  >
                    {submittingExpense ? "Saving..." : "Record Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Sale Dialog */}
        {saleToCancel && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 border-b border-gray-100 pb-3">
                <Ban className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold">Cancel Sale {saleToCancel.invoiceNumber}</h2>
              </div>

              <div className="text-xs text-gray-600 space-y-2">
                <p>
                  Cancelling this sale will mark it as cancelled in daily accounts and automatically
                  <strong> restore all {saleToCancel.items.length} item(s) back to inventory stock</strong>.
                </p>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 font-bold">
                  Refund Amount: ৳{saleToCancel.finalTotal.toFixed(2)}
                </div>
              </div>

              <form onSubmit={handleExecuteCancelSale} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cancellation Reason *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Customer returned goods, Wrong billing"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaleToCancel(null)}
                    className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={cancellingSale}
                    className="px-5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-neu-flat"
                  >
                    {cancellingSale ? "Reverting..." : "Confirm Cancellation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
