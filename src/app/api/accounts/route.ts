import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { ISale, IExpense } from "@/lib/types";
import { getDhakaDayRange } from "@/lib/timezone";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES as any),
  customCategory: z.string().optional(),
  amount: z.number().positive("Expense amount must be positive"),
  note: z.string().optional(),
  expenseDate: z.string().optional(), // ISO string or YYYY-MM-DD
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "manage_accounts");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const dateInput = searchParams.get("date") || undefined;
    const { start, end } = getDhakaDayRange(dateInput);

    const { db } = await connectToDatabase();

    // 1. Fetch sales for the day
    const sales = await db
      .collection<ISale>("sales")
      .find({
        createdAt: { $gte: start, $lte: end },
      })
      .toArray();

    // 2. Fetch expenses for the day
    const expenses = await db
      .collection<IExpense>("expenses")
      .find({
        expenseDate: { $gte: start, $lte: end },
      })
      .sort({ createdAt: -1 })
      .toArray();

    let totalRevenue = 0;
    let totalCOGS = 0;
    let cashSales = 0;
    let bkashSales = 0;
    let nagadSales = 0;
    let nonCancelledSalesCount = 0;
    let cancelledSalesCount = 0;
    let cancelledAmount = 0;

    for (const sale of sales) {
      if (sale.isCancelled) {
        cancelledSalesCount += 1;
        cancelledAmount += sale.finalTotal;
      } else {
        nonCancelledSalesCount += 1;
        totalRevenue += sale.finalTotal;
        totalCOGS += sale.totalBaseCost;

        if (sale.paymentMethod === "Cash") cashSales += sale.finalTotal;
        else if (sale.paymentMethod === "bKash") bkashSales += sale.finalTotal;
        else if (sale.paymentMethod === "Nagad") nagadSales += sale.finalTotal;
      }
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const grossProfit = Math.round((totalRevenue - totalCOGS) * 100) / 100;
    const netProfit = Math.round((grossProfit - totalExpenses) * 100) / 100;

    return NextResponse.json({
      dateRange: { start, end },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        grossProfit,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit,
        cashSales: Math.round(cashSales * 100) / 100,
        bkashSales: Math.round(bkashSales * 100) / 100,
        nagadSales: Math.round(nagadSales * 100) / 100,
        transactionCount: nonCancelledSalesCount,
        cancelledCount: cancelledSalesCount,
        cancelledAmount: Math.round(cancelledAmount * 100) / 100,
      },
      expenses,
    });
  } catch (error: any) {
    console.error("GET accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch daily accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "manage_expenses");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = createExpenseSchema.parse(body);

    const { db } = await connectToDatabase();
    const now = new Date();
    const expenseDate = validated.expenseDate ? new Date(validated.expenseDate) : now;

    const expenseDoc: IExpense = {
      category: validated.category,
      customCategory: validated.customCategory,
      amount: validated.amount,
      note: validated.note,
      expenseDate,
      createdByUid: auth.firebaseUid,
      createdByName: auth.user.displayName,
      createdAt: now,
    };

    const result = await db.collection<IExpense>("expenses").insertOne(expenseDoc);

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "CREATE_EXPENSE",
      "expense",
      result.insertedId.toString(),
      {
        category: validated.category,
        amount: validated.amount,
        note: validated.note,
      }
    );

    return NextResponse.json({
      success: true,
      expense: { ...expenseDoc, _id: result.insertedId },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("POST expense error:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
