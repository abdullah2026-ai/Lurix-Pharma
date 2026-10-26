import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IUserProfile } from "@/lib/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name too long")
    .optional(),
});

/** GET /api/user/profile — returns current user's full profile */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { db } = await connectToDatabase();
  const user = await db.collection<IUserProfile>("users").findOne({
    firebaseUid: auth.firebaseUid,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      permissions: user.permissions || [],
      maxDiscountPercent: user.maxDiscountPercent || 0,
      maxDiscountFixed: user.maxDiscountFixed || 0,
      photoUrl: user.photoUrl || null,
      photoFileId: user.photoFileId || null,
      createdAt: user.createdAt,
    },
  });
}

/** PATCH /api/user/profile — update display name */
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation failed" },
      { status: 422 }
    );
  }

  const { displayName } = parsed.data;
  if (!displayName) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  await db.collection<IUserProfile>("users").updateOne(
    { firebaseUid: auth.firebaseUid },
    { $set: { displayName, updatedAt: new Date() } }
  );

  await recordAudit(
    { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
    "UPDATE_PROFILE",
    "user",
    auth.firebaseUid,
    { updatedFields: ["displayName"], newDisplayName: displayName }
  );

  return NextResponse.json({ success: true, displayName });
}
