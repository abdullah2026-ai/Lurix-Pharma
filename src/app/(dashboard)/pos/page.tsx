"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  X, 
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { IMedicine, ISale, ISaleItem, UnitConversion } from "@/lib/types";
import { PaymentMethod, PAYMENT_METHODS, APP_CONFIG } from "@/lib/constants";
import { formatDhakaDateTime } from "@/lib/timezone";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

interface CartItem {
  medicine: IMedicine;
  selectedUnit: string;
  conversionFactor: number;
  unitPrice: number;
  quantity: number;
}

export default function PosPage() {
  const { userProfile, hasPermission } = useAuth();
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout controls
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal
  const [completedSale, setCompletedSale] = useState<ISale | null>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const fetchMedicines = async (query = "") => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const url = query.trim()
        ? `/api/medicines?q=${encodeURIComponent(query.trim())}&limit=40`
        : "/api/medicines?limit=40";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load medicines");
      const data = await res.json();
      setMedicines(data.medicines || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load inventory for POS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMedicines(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicines.length > 0) {
      handleAddToCart(medicines[0]);
    }
  };

  const handleAddToCart = (med: IMedicine) => {
    if (med.currentStock <= 0) {
      toast.error(`"${med.name}" is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex(
      (it) => it.medicine._id === med._id && it.selectedUnit === med.baseUnit
    );

    if (existingIndex !== -1) {
      const item = cart[existingIndex];
      const newQty = item.quantity + 1;
      const totalBaseQtyNeeded = newQty * item.conversionFactor;

      if (totalBaseQtyNeeded > med.currentStock) {
        toast.error(`Cannot add more. Stock limit: ${med.currentStock} ${med.baseUnit}s.`);
        return;
      }

      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicine: med,
          selectedUnit: med.baseUnit,
          conversionFactor: 1,
          unitPrice: med.baseSellingPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateUnit = (cartIdx: number, newUnitName: string) => {
    const item = cart[cartIdx];
    const med = item.medicine;

    let convFactor = 1;
    let price = med.baseSellingPrice;

    if (newUnitName !== med.baseUnit) {
      const conv = (med.conversions || []).find((c) => c.unitName === newUnitName);
      if (conv) {
        convFactor = conv.conversionFactor;
        price = conv.sellingPrice;
      }
    }

    const totalBaseNeeded = item.quantity * convFactor;
    if (totalBaseNeeded > med.currentStock) {
      toast.error(`Cannot select ${newUnitName}: Exceeds available stock (${med.currentStock} ${med.baseUnit}s).`);
      return;
    }

    const updated = [...cart];
    updated[cartIdx] = {
      ...item,
      selectedUnit: newUnitName,
      conversionFactor: convFactor,
      unitPrice: price,
    };
    setCart(updated);
  };

  const handleUpdateQty = (cartIdx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartIdx);
      return;
    }

    const item = cart[cartIdx];
    const totalBaseNeeded = newQty * item.conversionFactor;

    if (totalBaseNeeded > item.medicine.currentStock) {
      toast.error(`Stock limit reached! Available: ${item.medicine.currentStock} ${item.medicine.baseUnit}s.`);
      return;
    }

    const updated = [...cart];
    updated[cartIdx].quantity = newQty;
    setCart(updated);
  };

  const handleRemoveItem = (cartIdx: number) => {
    setCart(cart.filter((_, i) => i !== cartIdx));
  };

  // Cart financial totals
  const subtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

  // Discount validation
  const isSuperAdminOrAdmin = userProfile?.role === "SuperAdmin" || userProfile?.role === "Admin";
  const maxPercent = isSuperAdminOrAdmin ? 100 : (userProfile?.maxDiscountPercent || 0);
  const maxFixed = isSuperAdminOrAdmin ? 1000000 : (userProfile?.maxDiscountFixed || 0);

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * Math.min(discountValue, maxPercent)) / 100;
  } else {
    discountAmount = Math.min(discountValue, subtotal, maxFixed);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = paymentMethod === "Cash" && cashTendered > finalTotal ? cashTendered - finalTotal : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (paymentMethod === "Cash" && cashTendered > 0 && cashTendered < finalTotal) {
      toast.error("Tendered cash is less than the total bill");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const payload = {
        items: cart.map((it) => ({
          medicineId: it.medicine._id!.toString(),
          unit: it.selectedUnit,
          quantity: it.quantity,
        })),
        discountType,
        discountValue: Number(discountValue),
        paymentMethod,
        cashTendered: paymentMethod === "Cash" ? Number(cashTendered) || finalTotal : undefined,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sale failed to process");

      toast.success(`Sale completed! Invoice: ${data.sale.invoiceNumber}`);
      setCompletedSale(data.sale);
      setCart([]);
      setDiscountValue(0);
      setCashTendered(0);
      fetchMedicines(); // Refresh stock counts
    } catch (err: any) {
      toast.error(err.message || "Failed to complete checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Point of Sale (POS)" />

      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-emerald-950/5 shadow-neu-flat">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across 21,000+ medicines (e.g. Napa, Seclo, Square, Paracetamol)... Press Enter to pick"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-emerald-950/10 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </form>
          </div>

          {/* Medicines Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {loading ? (
              <div className="col-span-full py-16 text-center text-xs text-gray-400">
                Searching 21,000+ medicines...
              </div>
            ) : medicines.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-gray-400">
                No matching medicines found for "{searchQuery}".
              </div>
            ) : (
              medicines.map((med) => {
                const isOutOfStock = med.currentStock <= 0;
                return (
                  <button
                    key={med._id?.toString()}
                    onClick={() => handleAddToCart(med)}
                    disabled={isOutOfStock}
                    className={`p-3.5 rounded-3xl bg-white border text-left transition-all relative group flex flex-col justify-between shadow-neu-flat active:scale-[0.98] ${
                      isOutOfStock
                        ? "opacity-50 border-gray-200 cursor-not-allowed"
                        : "border-emerald-950/5 hover:border-brand-500/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 truncate max-w-[80px]">
                          {med.category || "General"}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isOutOfStock
                              ? "text-rose-600"
                              : med.currentStock <= med.lowStockThreshold
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {med.currentStock} {med.baseUnit}
                        </span>
                      </div>

                      <div className="font-bold text-gray-900 text-xs line-clamp-1">
                        {med.name}
                      </div>
                      {med.banglaName && (
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {med.banglaName}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-xs font-extrabold text-brand-700">
                        ৳{med.baseSellingPrice.toFixed(2)}
                      </div>
                      <div className="w-6 h-6 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Cart & Billing Terminal (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-neu-flat max-h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-gray-900">Current Cart ({cart.length})</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 my-2 pr-1 space-y-2">
            {cart.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center">
                <ShoppingCart className="w-10 h-10 text-gray-200 mb-2" />
                Cart is currently empty. Click on medicines on the left to add items.
              </div>
            ) : (
              cart.map((item, idx) => {
                const med = item.medicine;
                const availableUnits = [
                  med.baseUnit,
                  ...(med.conversions || []).map((c) => c.unitName),
                ];

                return (
                  <div key={idx} className="pt-2.5 pb-2 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">{med.name}</div>
                        <div className="text-[10px] text-gray-400">
                          ৳{item.unitPrice.toFixed(2)} per {item.selectedUnit}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">
                        ৳{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Unit Selector */}
                      <select
                        value={item.selectedUnit}
                        onChange={(e) => handleUpdateUnit(idx, e.target.value)}
                        className="px-2 py-1 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700"
                      >
                        {availableUnits.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-0.5">
                        <button
                          onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout & Totals Panel */}
          <div className="border-t border-gray-100 pt-3 space-y-3 bg-gray-50/50 -mx-5 -mb-5 p-5 rounded-b-3xl">
            {/* Subtotal */}
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">৳{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount Control with Limit Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 flex items-center gap-1">
                  <span>Discount</span>
                  <span className="text-[10px] text-gray-400">
                    (Max: {isSuperAdminOrAdmin ? "100%" : `${maxPercent}% / ৳${maxFixed}`})
                  </span>
                </span>
                <span className="text-rose-600 font-bold">-৳{discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-gray-200/70 p-0.5 text-[11px] font-semibold">
                  <button
                    onClick={() => setDiscountType("fixed")}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      discountType === "fixed" ? "bg-white shadow text-gray-900" : "text-gray-600"
                    }`}
                  >
                    ৳ Fixed
                  </button>
                  <button
                    onClick={() => setDiscountType("percentage")}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      discountType === "percentage" ? "bg-white shadow text-gray-900" : "text-gray-600"
                    }`}
                  >
                    % Percent
                  </button>
                </div>

                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-900 text-right focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      paymentMethod === pm
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Tendered & Change (only if Cash) */}
            {paymentMethod === "Cash" && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-500">Cash Received (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={cashTendered || ""}
                    placeholder={finalTotal.toFixed(0)}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Change Due (৳)</label>
                  <div className="px-2.5 py-1.5 rounded-xl bg-gray-100 font-bold text-xs text-emerald-800">
                    ৳{changeAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Final Total Big Display */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/80">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Final Payable:
              </span>
              <span className="text-xl font-extrabold text-brand-700">
                ৳{finalTotal.toFixed(2)}
              </span>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-neu-flat transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing Sale..." : "Complete & Print Receipt"}</span>
            </button>
          </div>
        </div>

        {/* Printable Receipt Modal */}
        {completedSale && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold">Transaction Successful</span>
                </div>
                <button
                  onClick={() => setCompletedSale(null)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Printable Ticket */}
              <div ref={receiptPrintRef} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-3 font-mono text-gray-800">
                <div className="text-center space-y-0.5 border-b border-gray-300 pb-2">
                  <div className="font-bold text-sm tracking-tight">{APP_CONFIG.name}</div>
                  <div className="text-[10px] text-gray-500">Dhaka, Bangladesh • Ph: +880 1700-000000</div>
                  <div className="text-[10px] text-gray-500">Invoice: {completedSale.invoiceNumber}</div>
                  <div className="text-[9px] text-gray-400">{formatDhakaDateTime(completedSale.createdAt)}</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {completedSale.items.map((it, i) => (
                    <div key={i} className="py-1.5 flex justify-between">
                      <div>
                        <div className="font-bold">{it.medicineName}</div>
                        <div className="text-[10px] text-gray-500">
                          {it.quantity} {it.unit} × ৳{it.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-bold">৳{it.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{completedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {completedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-৳{completedSale.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-300">
                    <span>TOTAL:</span>
                    <span>৳{completedSale.finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>Payment Method:</span>
                    <span>{completedSale.paymentMethod}</span>
                  </div>
                  {completedSale.cashTendered && (
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Cash Tendered:</span>
                      <span>৳{completedSale.cashTendered.toFixed(2)}</span>
                    </div>
                  )}
                  {completedSale.changeAmount && completedSale.changeAmount > 0 && (
                    <div className="flex justify-between text-[10px] text-emerald-700 font-bold">
                      <span>Change Given:</span>
                      <span>৳{completedSale.changeAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-300">
                  Sold by: {completedSale.soldByName}
                  <br />
                  Thank you for visiting! Get well soon.
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-neu-flat"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setCompletedSale(null)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
