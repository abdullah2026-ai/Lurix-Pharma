import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IMedicine, ISale, ISaleItem } from "@/lib/types";
import { PaymentMethod, PAYMENT_METHODS } from "@/lib/constants";
import { getDhakaDayRange } from "@/lib/timezone";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const dynamic = "force-dynamic";

const saleItemInputSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().positive("Quantity must be greater than zero"),
});

const createSaleSchema = z.object({
  items: z.array(saleItemInputSchema).min(1, "At least one item is required"),
  discountType: z.enum(["percentage", "fixed"]).default("fixed"),
  discountValue: z.number().nonnegative().default(0),
  paymentMethod: z.enum(PAYMENT_METHODS as any).default("Cash"),
  cashTendered: z.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "manage_sales");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const invoice = searchParams.get("invoice");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const { db } = await connectToDatabase();
    const query: Record<string, any> = {};

    if (invoice?.trim()) {
      query.invoiceNumber = { $regex: invoice.trim(), $options: "i" };
    } else if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (date) {
      const { start, end } = getDhakaDayRange(date);
      query.createdAt = { $gte: start, $lte: end };
    }

    const sales = await db
      .collection<ISale>("sales")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ sales });
  } catch (error: any) {
    console.error("GET sales error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "manage_sales");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = createSaleSchema.parse(body);

    const { db } = await connectToDatabase();

    // 1. Fetch all requested medicines
    const medicineObjectIds = validated.items.map((it) => new ObjectId(it.medicineId));
    const medicines = await db
      .collection<IMedicine>("medicines")
      .find({ _id: { $in: medicineObjectIds } })
      .toArray();

    const medicineMap = new Map<string, IMedicine>();
    medicines.forEach((m) => medicineMap.set(m._id!.toString(), m));

    // 2. Validate availability and calculate items
    const saleItems: ISaleItem[] = [];
    let subtotal = 0;
    let totalBaseCost = 0;

    for (const itemInput of validated.items) {
      const med = medicineMap.get(itemInput.medicineId);
      if (!med) {
        return NextResponse.json(
          { error: `Medicine not found for ID: ${itemInput.medicineId}` },
          { status: 400 }
        );
      }

      // Determine conversion factor and unit selling price
      let conversionFactor = 1;
      let unitPrice = med.baseSellingPrice;

      if (itemInput.unit === med.baseUnit) {
        conversionFactor = 1;
        unitPrice = med.baseSellingPrice;
      } else {
        const conv = (med.conversions || []).find((c) => c.unitName === itemInput.unit);
        if (!conv) {
          return NextResponse.json(
            { error: `Invalid unit "${itemInput.unit}" for medicine "${med.name}"` },
            { status: 400 }
          );
        }
        conversionFactor = conv.conversionFactor;
        unitPrice = conv.sellingPrice;
      }

      const baseQuantity = itemInput.quantity * conversionFactor;

      // Check stock sufficiency
      if (med.currentStock < baseQuantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${med.name}". Required: ${baseQuantity} ${med.baseUnit}(s), Available: ${med.currentStock} ${med.baseUnit}(s).`,
          },
          { status: 400 }
        );
      }

      const itemSubtotal = Math.round(unitPrice * itemInput.quantity * 100) / 100;
      const historicalBaseCost = med.averagePurchaseCost || 0;
      const itemCost = Math.round(historicalBaseCost * baseQuantity * 100) / 100;

      subtotal += itemSubtotal;
      totalBaseCost += itemCost;

      saleItems.push({
        medicineId: med._id!.toString(),
        medicineName: med.name,
        unit: itemInput.unit,
        quantity: itemInput.quantity,
        baseQuantity,
        unitPrice,
        historicalBaseCost,
        subtotal: itemSubtotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    totalBaseCost = Math.round(totalBaseCost * 100) / 100;

    // 3. Discount calculation & server-side discount cap enforcement
    let discountAmount = 0;
    const isSuperAdminOrAdmin = auth.user.role === "SuperAdmin" || auth.user.role === "Admin";
    const maxPercentAllowed = isSuperAdminOrAdmin ? 100 : (auth.user.maxDiscountPercent || 0);
    const maxFixedAllowed = isSuperAdminOrAdmin ? 1000000 : (auth.user.maxDiscountFixed || 0);

    if (validated.discountType === "percentage") {
      if (validated.discountValue > maxPercentAllowed) {
        return NextResponse.json(
          {
            error: `Discount of ${validated.discountValue}% exceeds your authorized limit of ${maxPercentAllowed}%.`,
          },
          { status: 403 }
        );
      }
      discountAmount = Math.round((subtotal * (validated.discountValue / 100)) * 100) / 100;
    } else {
      if (validated.discountValue > maxFixedAllowed) {
        return NextResponse.json(
          {
            error: `Discount of ৳${validated.discountValue} exceeds your authorized limit of ৳${maxFixedAllowed}.`,
          },
          { status: 403 }
        );
      }
      discountAmount = Math.min(validated.discountValue, subtotal);
    }

    const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const grossProfit = Math.round((finalTotal - totalBaseCost) * 100) / 100;

    let changeAmount = 0;
    if (validated.paymentMethod === "Cash" && validated.cashTendered !== undefined) {
      changeAmount = Math.max(0, Math.round((validated.cashTendered - finalTotal) * 100) / 100);
    }

    // 4. Generate invoice number: INV-YYYYMMDD-XXXX
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const countToday = await db.collection("sales").countDocuments({
      invoiceNumber: { $regex: `^INV-${datePrefix}` },
    });
    const seqStr = String(countToday + 1).padStart(4, "0");
    const invoiceNumber = `INV-${datePrefix}-${seqStr}`;

    // 5. Deduct stock for each medicine atomically
    for (const item of saleItems) {
      await db.collection<IMedicine>("medicines").updateOne(
        { _id: new ObjectId(item.medicineId) },
        {
          $inc: { currentStock: -item.baseQuantity },
          $set: { updatedAt: now },
        }
      );
    }

    // 6. Insert Sale document
    const saleDoc: ISale = {
      invoiceNumber,
      items: saleItems,
      subtotal,
      discountType: validated.discountType,
      discountValue: validated.discountValue,
      discountAmount,
      finalTotal,
      totalBaseCost,
      grossProfit,
      paymentMethod: validated.paymentMethod,
      cashTendered: validated.cashTendered,
      changeAmount,
      soldByUid: auth.firebaseUid,
      soldByName: auth.user.displayName,
      isCancelled: false,
      createdAt: now,
    };

    const result = await db.collection<ISale>("sales").insertOne(saleDoc);

    // 7. Record audit log
    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "POS_SALE",
      "sale",
      result.insertedId.toString(),
      {
        invoiceNumber,
        finalTotal,
        grossProfit,
        paymentMethod: validated.paymentMethod,
        itemsCount: saleItems.length,
      }
    );

    return NextResponse.json({
      success: true,
      sale: { ...saleDoc, _id: result.insertedId },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("POST sale error:", error);
    return NextResponse.json({ error: "Failed to complete sale" }, { status: 500 });
  }
}
