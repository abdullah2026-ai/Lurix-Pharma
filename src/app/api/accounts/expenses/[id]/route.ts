import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IExpense } from "@/lib/types";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, "manage_expenses");
  if (auth instanceof NextResponse) return auth;

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const expenseId = new ObjectId(params.id);

    const expense = await db.collection<IExpense>("expenses").findOne({ _id: expenseId });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await db.collection<IExpense>("expenses").deleteOne({ _id: expenseId });

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "DELETE_EXPENSE",
      "expense",
      params.id,
      {
        category: expense.category,
        amount: expense.amount,
        note: expense.note,
      }
    );

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error: any) {
    console.error("DELETE expense error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
