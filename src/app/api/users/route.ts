import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IUserProfile } from "@/lib/types";
import { USER_ROLES, USER_STATUS, ALL_PERMISSIONS } from "@/lib/constants";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(USER_ROLES as any).optional(),
  status: z.enum(USER_STATUS as any).optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS as any)).optional(),
  maxDiscountPercent: z.number().min(0).max(100).optional(),
  maxDiscountFixed: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const { db } = await connectToDatabase();
    const users = await db
      .collection<IUserProfile>("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    if (!ObjectId.isValid(validated.userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const targetUserId = new ObjectId(validated.userId);

    const targetUser = await db.collection<IUserProfile>("users").findOne({ _id: targetUserId });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protection: Only SuperAdmin can modify another SuperAdmin or promote to SuperAdmin
    if (
      (targetUser.role === "SuperAdmin" || validated.role === "SuperAdmin") &&
      auth.user.role !== "SuperAdmin"
    ) {
      return NextResponse.json(
        { error: "Only Super Administrators can assign or modify SuperAdmin accounts." },
        { status: 403 }
      );
    }

    // Protection: Prevent disabling your own account
    if (targetUser.firebaseUid === auth.firebaseUid && validated.status === "Disabled") {
      return NextResponse.json(
        { error: "You cannot disable your own administrator account." },
        { status: 400 }
      );
    }

    const updateDoc: Partial<IUserProfile> = {
      updatedAt: new Date(),
    };

    if (validated.role !== undefined) updateDoc.role = validated.role;
    if (validated.status !== undefined) updateDoc.status = validated.status;
    if (validated.permissions !== undefined) updateDoc.permissions = validated.permissions;
    if (validated.maxDiscountPercent !== undefined) updateDoc.maxDiscountPercent = validated.maxDiscountPercent;
    if (validated.maxDiscountFixed !== undefined) updateDoc.maxDiscountFixed = validated.maxDiscountFixed;

    await db.collection<IUserProfile>("users").updateOne(
      { _id: targetUserId },
      { $set: updateDoc }
    );

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "USER_MANAGEMENT_UPDATE",
      "user",
      validated.userId,
      {
        targetUserEmail: targetUser.email,
        changes: updateDoc,
      }
    );

    const updated = await db.collection<IUserProfile>("users").findOne({ _id: targetUserId });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("PATCH users error:", error);
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
  }
}
