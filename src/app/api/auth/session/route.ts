import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { connectToDatabase } from "@/lib/mongodb";
import { IUserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { db } = await connectToDatabase();
    let user = await db.collection<IUserProfile>("users").findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!user) {
      // If user profile does not exist yet (e.g., registered directly via Firebase), create default pending record
      const newUser: IUserProfile = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || (decodedToken.email ? decodedToken.email.split("@")[0] : "Staff Member"),
        role: "Employee",
        status: "Pending", // Pending by default!
        permissions: [],
        maxDiscountPercent: 0,
        maxDiscountFixed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection<IUserProfile>("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
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
      },
    });
  } catch (error: any) {
    console.error("Session verification error:", error);
    return NextResponse.json({ error: "Failed to authenticate session" }, { status: 401 });
  }
}
