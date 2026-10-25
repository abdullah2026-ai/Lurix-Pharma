import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { deleteImageKitFile } from "@/lib/imagekit/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, "manage_stock");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId parameter" }, { status: 400 });
    }

    const success = await deleteImageKitFile(fileId);

    if (success) {
      await recordAudit(
        {
          uid: authResult.firebaseUid,
          name: authResult.user.displayName || authResult.email,
          email: authResult.email,
        },
        "DELETE_IMAGE",
        "medicine",
        fileId,
        { fileId }
      );
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Failed to delete ImageKit asset" }, { status: 500 });
  }
}
