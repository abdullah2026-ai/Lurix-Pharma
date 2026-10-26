import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { ISale, IMedicine } from "@/lib/types";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const dynamic = "force-dynamic";

const cancelSaleSchema = z.object({
  reason: z.string().min(3, "Cancellation reason is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, "edit_cancel_sales");
  if (auth instanceof NextResponse) return auth;

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
    }

    const body = await request.json();
    const validated = cancelSaleSchema.parse(body);

    const { db } = await connectToDatabase();
    const saleId = new ObjectId(params.id);

    const sale = await db.collection<ISale>("sales").findOne({ _id: saleId });
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.isCancelled) {
      return NextResponse.json({ error: "Sale has already been cancelled" }, { status: 400 });
    }

    const now = new Date();

    // Revert stock for all items
    for (const item of sale.items) {
      if (ObjectId.isValid(item.medicineId)) {
        await db.collection<IMedicine>("medicines").updateOne(
          { _id: new ObjectId(item.medicineId) },
          {
            $inc: { currentStock: item.baseQuantity },
            $set: { updatedAt: now },
          }
        );
      }
    }

    // Mark sale as cancelled
    await db.collection<ISale>("sales").updateOne(
      { _id: saleId },
      {
        $set: {
          isCancelled: true,
          cancelledAt: now,
          cancelledByUid: auth.firebaseUid,
          cancelledByName: auth.user.displayName,
          cancellationReason: validated.reason,
        },
      }
    );

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "CANCEL_SALE",
      "sale",
      params.id,
      {
        invoiceNumber: sale.invoiceNumber,
        refundAmount: sale.finalTotal,
        reason: validated.reason,
        itemsCount: sale.items.length,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Sale ${sale.invoiceNumber} has been successfully cancelled and stock restored.`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Cancel sale error:", error);
    return NextResponse.json({ error: "Failed to cancel sale" }, { status: 500 });
  }
}
