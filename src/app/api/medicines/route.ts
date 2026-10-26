import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IMedicine } from "@/lib/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const unitConversionSchema = z.object({
  unitName: z.string().min(1),
  conversionFactor: z.number().positive(),
  sellingPrice: z.number().nonnegative(),
});

const createMedicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  banglaName: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  baseUnit: z.string().min(1, "Base unit is required"),
  baseSellingPrice: z.number().nonnegative("Selling price cannot be negative"),
  averagePurchaseCost: z.number().nonnegative("Purchase cost cannot be negative"),
  currentStock: z.number().nonnegative("Stock cannot be negative").default(0),
  lowStockThreshold: z.number().nonnegative().default(10),
  conversions: z.array(unitConversionSchema).default([]),
  imageUrl: z.string().optional(),
  imageFileId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "view_stock");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const { db } = await connectToDatabase();
    const filter: Record<string, any> = {};

    const limit = Math.min(parseInt(searchParams.get("limit") || (q.trim() ? "50" : "80"), 10), 250);

    if (q.trim()) {
      const cleanQ = q.trim();
      filter.$or = [
        { name: { $regex: cleanQ, $options: "i" } },
        { banglaName: { $regex: cleanQ, $options: "i" } },
        { category: { $regex: cleanQ, $options: "i" } },
        { notes: { $regex: cleanQ, $options: "i" } },
      ];
    }

    if (category.trim()) {
      filter.category = category.trim();
    }

    if (lowStockOnly) {
      filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
    }

    const totalCount = await db.collection<IMedicine>("medicines").countDocuments(filter);
    const medicines = await db
      .collection<IMedicine>("medicines")
      .find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ medicines, totalCount });
  } catch (error: any) {
    console.error("GET medicines error:", error);
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "manage_stock");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = createMedicineSchema.parse(body);

    const normalizedName = validated.name.trim().toLowerCase();
    const { db } = await connectToDatabase();

    // Check duplicate
    const existing = await db.collection<IMedicine>("medicines").findOne({ normalizedName });
    if (existing) {
      return NextResponse.json(
        { error: `A medicine with the name "${validated.name}" already exists.` },
        { status: 409 }
      );
    }

    const now = new Date();
    const newMedicine: IMedicine = {
      ...validated,
      normalizedName,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<IMedicine>("medicines").insertOne(newMedicine);

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "CREATE_MEDICINE",
      "medicine",
      result.insertedId.toString(),
      { name: validated.name, initialStock: validated.currentStock, unit: validated.baseUnit }
    );

    return NextResponse.json({
      success: true,
      medicine: { ...newMedicine, _id: result.insertedId },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("POST medicine error:", error);
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 });
  }
}
