import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/mongodb";
import { IAuditLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Audit logs are visible only to SuperAdmin or Admin
  if (auth.user.role !== "SuperAdmin" && auth.user.role !== "Admin") {
    return NextResponse.json(
      { error: "Forbidden: Only administrators can view audit logs" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);
    const entityType = searchParams.get("entityType");

    const { db } = await connectToDatabase();
    const filter: Record<string, any> = {};

    if (entityType) {
      filter.entityType = entityType;
    }

    const logs = await db
      .collection<IAuditLog>("audit_logs")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("GET audit logs error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
