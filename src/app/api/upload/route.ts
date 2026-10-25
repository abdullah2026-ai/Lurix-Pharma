import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { uploadMedicineImage, deleteImageKitFile } from "@/lib/imagekit/service";

export const dynamic = "force-dynamic";

// Maximum allowed image upload size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication and permission
    const authResult = await requireAuth(request, "manage_stock");
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const oldFileId = formData.get("oldFileId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in request" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit" },
        { status: 400 }
      );
    }

    // 3. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload and optimize via ImageKit & Sharp
    const uploadResult = await uploadMedicineImage(buffer, file.name);

    // 5. If this is replacing an old image, safely remove the old asset from ImageKit
    if (oldFileId) {
      deleteImageKitFile(oldFileId).catch((err) =>
        console.warn(`Failed to clean up old ImageKit asset ${oldFileId}:`, err)
      );
    }

    // 6. Record audit log
    await recordAudit(
      {
        uid: authResult.firebaseUid,
        name: authResult.user.displayName || authResult.email,
        email: authResult.email,
      },
      "UPLOAD_IMAGE",
      "medicine",
      uploadResult.fileId,
      {
        fileName: file.name,
        size: uploadResult.size,
        url: uploadResult.url,
        oldFileIdReplaced: oldFileId,
      }
    );

    return NextResponse.json({
      success: true,
      image: {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
        name: uploadResult.name,
      },
    });
  } catch (error: any) {
    console.error("Image upload API error:", error);
    return NextResponse.json(
      { error: "Failed to upload and optimize image asset" },
      { status: 500 }
    );
  }
}
