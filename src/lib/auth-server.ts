import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "./firebase/admin";
import { connectToDatabase } from "./mongodb";
import { IUserProfile, IAuditLog } from "./types";
import { Permission } from "./constants";

export interface AuthenticatedContext {
  firebaseUid: string;
  email: string;
  user: IUserProfile;
}

/**
 * Validates request authorization header and loads user from MongoDB.
 * Enforces:
 * - Valid Firebase token
 * - Active user status (Pending & Disabled accounts are denied)
 * - Required permissions (SuperAdmin has all permissions)
 */
export async function requireAuth(
  request: NextRequest,
  requiredPermission?: Permission
): Promise<AuthenticatedContext | NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      const admin = getFirebaseAdmin();
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (tokenErr) {
      console.error("Firebase token verification failed:", tokenErr);
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection<IUserProfile>("users").findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden: User profile not found in system" },
        { status: 403 }
      );
    }

    if (user.status !== "Active") {
      return NextResponse.json(
        {
          error:
            user.status === "Pending"
              ? "Account pending administrator approval"
              : "Account has been deactivated. Please contact administrator.",
          status: user.status,
        },
        { status: 403 }
      );
    }

    // Role-based and permission checks
    if (requiredPermission) {
      const isSuperAdmin = user.role === "SuperAdmin";
      const hasPermission = user.permissions && user.permissions.includes(requiredPermission);

      if (!isSuperAdmin && !hasPermission) {
        return NextResponse.json(
          { error: `Forbidden: Missing required permission [${requiredPermission}]` },
          { status: 403 }
        );
      }
    }

    return {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || user.email,
      user,
    };
  } catch (error: any) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Internal server authentication error" },
      { status: 500 }
    );
  }
}

/**
 * Creates an append-only audit log record
 */
export async function recordAudit(
  actor: { uid: string; name: string; email?: string },
  action: string,
  entityType: "medicine" | "sale" | "expense" | "user" | "setting",
  entityId: string | undefined,
  details: Record<string, any>
) {
  try {
    const { db } = await connectToDatabase();
    const auditRecord: IAuditLog = {
      actorUid: actor.uid,
      actorName: actor.name,
      actorEmail: actor.email,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date(),
    };
    await db.collection("audit_logs").insertOne(auditRecord);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
