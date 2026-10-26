import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { ISale, IExpense } from "@/lib/types";
import { getDhakaDayRange } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "view_reports");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7days";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date;

    const now = new Date();
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else if (range === "today") {
      const { start, end } = getDhakaDayRange();
      startDate = start;
      endDate = end;
    } else if (range === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else {
      // Default 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
    }

    const { db } = await connectToDatabase();

    // 1. Fetch non-cancelled sales
    const sales = await db
      .collection<ISale>("sales")
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
        isCancelled: { $ne: true },
      })
      .toArray();

    // 2. Fetch expenses
    const expenses = await db
      .collection<IExpense>("expenses")
      .find({
        expenseDate: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    // 3. Compute summaries
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalGrossProfit = 0;
    const paymentMethods: Record<string, number> = { Cash: 0, bKash: 0, Nagad: 0 };
    const medicineSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const dailyMap: Record<string, { date: string; revenue: number; grossProfit: number; expenses: number; netProfit: number }> = {};

    for (const sale of sales) {
      totalRevenue += sale.finalTotal;
      totalCOGS += sale.totalBaseCost;
      totalGrossProfit += sale.grossProfit;

      paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.finalTotal;

      const dayKey = sale.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { date: dayKey, revenue: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      }
      dailyMap[dayKey].revenue += sale.finalTotal;
      dailyMap[dayKey].grossProfit += sale.grossProfit;

      // Item level tracking
      for (const it of sale.items) {
        if (!medicineSalesMap[it.medicineName]) {
          medicineSalesMap[it.medicineName] = { name: it.medicineName, quantity: 0, revenue: 0 };
        }
        medicineSalesMap[it.medicineName].quantity += it.quantity;
        medicineSalesMap[it.medicineName].revenue += it.subtotal;
      }
    }

    let totalExpenses = 0;
    for (const exp of expenses) {
      totalExpenses += exp.amount;
      const dayKey = exp.expenseDate.toISOString().slice(0, 10);
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { date: dayKey, revenue: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      }
      dailyMap[dayKey].expenses += exp.amount;
    }

    // Compute net profit for daily map
    Object.values(dailyMap).forEach((d) => {
      d.netProfit = Math.round((d.grossProfit - d.expenses) * 100) / 100;
      d.revenue = Math.round(d.revenue * 100) / 100;
      d.grossProfit = Math.round(d.grossProfit * 100) / 100;
      d.expenses = Math.round(d.expenses * 100) / 100;
    });

    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Sort top medicines
    const topMedicines = Object.values(medicineSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((m) => ({
        ...m,
        revenue: Math.round(m.revenue * 100) / 100,
      }));

    const netProfit = Math.round((totalGrossProfit - totalExpenses) * 100) / 100;
    const averageOrderValue =
      sales.length > 0 ? Math.round((totalRevenue / sales.length) * 100) / 100 : 0;

    return NextResponse.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        totalGrossProfit: Math.round(totalGrossProfit * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit,
        salesCount: sales.length,
        averageOrderValue,
      },
      paymentMethods,
      topMedicines,
      dailyTrend,
    });
  } catch (error: any) {
    console.error("GET reports error:", error);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
