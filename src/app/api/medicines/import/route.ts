import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IMedicine, UnitConversion } from "@/lib/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface ParsedCsvRow {
  name: string;
  banglaName?: string;
  category?: string;
  baseUnit: string;
  currentStock: number;
  baseSellingPrice: number;
  averagePurchaseCost: number;
  lowStockThreshold?: number;
  conversions?: UnitConversion[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "csv_import_export");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const rows: any[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for import" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const medicinesCollection = db.collection<IMedicine>("medicines");

    const inserted: string[] = [];
    const updated: string[] = [];
    const errors: { row: number; name?: string; error: string }[] = [];

    const now = new Date();

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const rowNum = i + 1;

      // Extract column values supporting multiple header naming conventions
      const name = String(raw.name || raw["Medicine / Item"] || raw["Medicine Name"] || raw["Item"] || "").trim();
      const banglaName = String(raw.banglaName || raw["Bangla Name"] || raw["Bangla"] || "").trim() || undefined;
      const category = String(raw.category || raw["Category"] || "").trim() || undefined;
      const baseUnit = String(raw.baseUnit || raw["Base Unit"] || raw["Unit"] || "Tablet").trim();
      const notes = String(raw.notes || raw["Notes"] || raw["Generic"] || "").trim() || undefined;

      const currentStock = Number(raw.currentStock ?? raw["Stock Level"] ?? raw["Stock"] ?? 0);
      const baseSellingPrice = Number(raw.baseSellingPrice ?? raw["Selling Price"] ?? raw["Price"] ?? 0);
      const averagePurchaseCost = Number(raw.averagePurchaseCost ?? raw["Avg Cost (COGS)"] ?? raw["Purchase Cost"] ?? raw["Cost"] ?? 0);
      const lowStockThreshold = Number(raw.lowStockThreshold ?? raw["Low Stock Alert"] ?? raw["Low Stock Threshold"] ?? 10);

      if (!name) {
        errors.push({ row: rowNum, error: "Medicine / Item name is missing" });
        continue;
      }

      if (isNaN(baseSellingPrice) || baseSellingPrice < 0) {
        errors.push({ row: rowNum, name, error: "Invalid selling price" });
        continue;
      }

      // Parse Conversions column if string format like "Strip:10:35;Box:100:320"
      const conversions: UnitConversion[] = [];
      const rawConv = raw.conversions ?? raw["Conversions"];

      if (typeof rawConv === "string" && rawConv.trim()) {
        const parts = rawConv.split(";");
        for (const part of parts) {
          const [uName, factorStr, priceStr] = part.split(":").map((s) => s.trim());
          const factor = Number(factorStr);
          const price = Number(priceStr);
          if (uName && !isNaN(factor) && factor > 0 && !isNaN(price) && price >= 0) {
            conversions.push({
              unitName: uName,
              conversionFactor: factor,
              sellingPrice: price,
            });
          }
        }
      } else if (Array.isArray(rawConv)) {
        conversions.push(...rawConv);
      }

      const normalizedName = name.toLowerCase();

      // Check if medicine already exists
      const existing = await medicinesCollection.findOne({ normalizedName });

      if (existing) {
        // Update existing medicine stock and prices
        await medicinesCollection.updateOne(
          { _id: existing._id },
          {
            $set: {
              name,
              banglaName: banglaName || existing.banglaName,
              category: category || existing.category,
              baseUnit,
              currentStock: isNaN(currentStock) ? existing.currentStock : currentStock,
              baseSellingPrice,
              averagePurchaseCost: isNaN(averagePurchaseCost) ? existing.averagePurchaseCost : averagePurchaseCost,
              lowStockThreshold: isNaN(lowStockThreshold) ? existing.lowStockThreshold : lowStockThreshold,
              conversions: conversions.length > 0 ? conversions : existing.conversions,
              notes: notes || existing.notes,
              updatedAt: now,
            },
          }
        );
        updated.push(name);
      } else {
        // Insert new medicine
        const newDoc: IMedicine = {
          name,
          banglaName,
          normalizedName,
          category,
          baseUnit,
          baseSellingPrice: Math.max(0, baseSellingPrice),
          averagePurchaseCost: Math.max(0, isNaN(averagePurchaseCost) ? 0 : averagePurchaseCost),
          currentStock: Math.max(0, isNaN(currentStock) ? 0 : currentStock),
          lowStockThreshold: Math.max(1, isNaN(lowStockThreshold) ? 10 : lowStockThreshold),
          conversions,
          notes,
          createdAt: now,
          updatedAt: now,
        };

        await medicinesCollection.insertOne(newDoc);
        inserted.push(name);
      }
    }

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "CSV_IMPORT",
      "medicine",
      undefined,
      {
        totalRows: rows.length,
        insertedCount: inserted.length,
        updatedCount: updated.length,
        errorCount: errors.length,
      }
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: rows.length,
        insertedCount: inserted.length,
        updatedCount: updated.length,
        errorCount: errors.length,
        errors,
      },
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 });
  }
}
