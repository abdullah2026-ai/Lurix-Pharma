import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { ALL_PERMISSIONS } from "@/lib/constants";
import { IUserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { secret, email, uid, displayName } = await request.json();
    const serverSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET;

    if (!serverSecret || secret !== serverSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing bootstrap secret" },
        { status: 403 }
      );
    }

    if (!email || !uid) {
      return NextResponse.json(
        { error: "Missing required fields: email and uid" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const existingUser = await db.collection<IUserProfile>("users").findOne({ firebaseUid: uid });

    if (existingUser) {
      await db.collection<IUserProfile>("users").updateOne(
        { firebaseUid: uid },
        {
          $set: {
            role: "SuperAdmin",
            status: "Active",
            permissions: [...ALL_PERMISSIONS],
            maxDiscountPercent: 100,
            maxDiscountFixed: 100000,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await db.collection<IUserProfile>("users").insertOne({
        firebaseUid: uid,
        email,
        displayName: displayName || "Super Administrator",
        role: "SuperAdmin",
        status: "Active",
        permissions: [...ALL_PERMISSIONS],
        maxDiscountPercent: 100,
        maxDiscountFixed: 100000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `SuperAdmin successfully provisioned for ${email}`,
    });
  } catch (error: any) {
    console.error("Bootstrap error:", error);
    return NextResponse.json(
      { error: "Failed to execute bootstrap provision" },
      { status: 500 }
    );
  }
}
