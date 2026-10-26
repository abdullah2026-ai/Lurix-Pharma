import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IMedicine } from "@/lib/types";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const dynamic = "force-dynamic";

const unitConversionSchema = z.object({
  unitName: z.string().min(1),
  conversionFactor: z.number().positive(),
  sellingPrice: z.number().nonnegative(),
});

const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  banglaName: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  baseUnit: z.string().min(1).optional(),
  baseSellingPrice: z.number().nonnegative().optional(),
  averagePurchaseCost: z.number().nonnegative().optional(),
  currentStock: z.number().nonnegative().optional(),
  lowStockThreshold: z.number().nonnegative().optional(),
  conversions: z.array(unitConversionSchema).optional(),
  imageUrl: z.string().optional(),
  imageFileId: z.string().optional(),
  // For restocking action
  restock: z
    .object({
      quantity: z.number().positive("Restock quantity must be positive"),
      costPerBaseUnit: z.number().nonnegative("Purchase cost cannot be negative"),
      note: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, "view_stock");
  if (auth instanceof NextResponse) return auth;

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const medicine = await db
      .collection<IMedicine>("medicines")
      .findOne({ _id: new ObjectId(params.id) });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json({ medicine });
  } catch (error: any) {
    console.error("GET medicine by id error:", error);
    return NextResponse.json({ error: "Failed to fetch medicine" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, "manage_stock");
  if (auth instanceof NextResponse) return auth;

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const body = await request.json();
    const validated = updateMedicineSchema.parse(body);
    const { db } = await connectToDatabase();
    const medicineId = new ObjectId(params.id);

    const currentMedicine = await db
      .collection<IMedicine>("medicines")
      .findOne({ _id: medicineId });

    if (!currentMedicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const now = new Date();
    const updateDoc: Partial<IMedicine> = {
      updatedAt: now,
    };

    if (validated.name !== undefined) {
      updateDoc.name = validated.name;
      updateDoc.normalizedName = validated.name.trim().toLowerCase();
    }
    if (validated.banglaName !== undefined) updateDoc.banglaName = validated.banglaName;
    if (validated.category !== undefined) updateDoc.category = validated.category;
    if (validated.notes !== undefined) updateDoc.notes = validated.notes;
    if (validated.baseUnit !== undefined) updateDoc.baseUnit = validated.baseUnit;
    if (validated.baseSellingPrice !== undefined) updateDoc.baseSellingPrice = validated.baseSellingPrice;
    if (validated.lowStockThreshold !== undefined) updateDoc.lowStockThreshold = validated.lowStockThreshold;
    if (validated.conversions !== undefined) updateDoc.conversions = validated.conversions;
    if (validated.imageUrl !== undefined) updateDoc.imageUrl = validated.imageUrl;
    if (validated.imageFileId !== undefined) updateDoc.imageFileId = validated.imageFileId;

    // Handle Restock with Weighted Average Cost calculation
    if (validated.restock) {
      const { quantity, costPerBaseUnit, note } = validated.restock;
      const oldStock = currentMedicine.currentStock || 0;
      const oldAvgCost = currentMedicine.averagePurchaseCost || 0;
      const newStock = oldStock + quantity;

      // Weighted average cost formula:
      // (oldStock * oldAvgCost + addedQuantity * newCost) / newStock
      let newAvgCost = costPerBaseUnit;
      if (newStock > 0 && oldStock > 0) {
        newAvgCost = (oldStock * oldAvgCost + quantity * costPerBaseUnit) / newStock;
      }

      // Round to 2 decimal places for financial stability
      newAvgCost = Math.round(newAvgCost * 100) / 100;

      updateDoc.currentStock = newStock;
      updateDoc.averagePurchaseCost = newAvgCost;

      await recordAudit(
        { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
        "RESTOCK_MEDICINE",
        "medicine",
        params.id,
        {
          medicineName: currentMedicine.name,
          addedQuantity: quantity,
          oldStock,
          newStock,
          costPerBaseUnit,
          oldAvgCost,
          newAvgCost,
          note,
        }
      );
    } else if (validated.currentStock !== undefined) {
      updateDoc.currentStock = validated.currentStock;
    }

    if (validated.averagePurchaseCost !== undefined && !validated.restock) {
      updateDoc.averagePurchaseCost = validated.averagePurchaseCost;
    }

    await db.collection<IMedicine>("medicines").updateOne(
      { _id: medicineId },
      { $set: updateDoc }
    );

    const updated = await db
      .collection<IMedicine>("medicines")
      .findOne({ _id: medicineId });

    return NextResponse.json({ success: true, medicine: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("PUT medicine error:", error);
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, "manage_stock");
  if (auth instanceof NextResponse) return auth;

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const medicineId = new ObjectId(params.id);
    const existing = await db.collection<IMedicine>("medicines").findOne({ _id: medicineId });

    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    await db.collection<IMedicine>("medicines").deleteOne({ _id: medicineId });

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "DELETE_MEDICINE",
      "medicine",
      params.id,
      { medicineName: existing.name }
    );

    return NextResponse.json({ success: true, message: "Medicine deleted successfully" });
  } catch (error: any) {
    console.error("DELETE medicine error:", error);
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}
