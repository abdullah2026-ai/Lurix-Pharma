import { NextRequest, NextResponse } from "next/server";
import { requireAuth, recordAudit } from "@/lib/auth-server";
import { uploadUserAvatar, deleteImageKitFile } from "@/lib/imagekit/service";
import { connectToDatabase } from "@/lib/mongodb";
import { IUserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_AVATAR_SIZE = 8 * 1024 * 1024; // 8MB — client compresses first, generous server limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];

/**
 * POST /api/user/avatar
 * Accepts a compressed image from the client, crops+converts to 400×400 WebP
 * via Sharp on the server, uploads to ImageKit /pharmacy/avatars/, and
 * persists the URL to the user's MongoDB profile.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 8MB limit" },
        { status: 400 }
      );
    }

    // Load the current user to get old photo file ID
    const { db } = await connectToDatabase();
    const currentUser = await db.collection<IUserProfile>("users").findOne({
      firebaseUid: auth.firebaseUid,
    });

    const oldFileId = currentUser?.photoFileId;

    // Convert to buffer and upload to ImageKit (Sharp does the 400×400 crop on server)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadUserAvatar(buffer, file.name);

    // Persist the new photo to the user profile
    await db.collection<IUserProfile>("users").updateOne(
      { firebaseUid: auth.firebaseUid },
      {
        $set: {
          photoUrl: result.url,
          photoFileId: result.fileId,
          updatedAt: new Date(),
        },
      }
    );

    // Cleanup old avatar from ImageKit (fire and forget)
    if (oldFileId) {
      deleteImageKitFile(oldFileId).catch((err) =>
        console.warn("Failed to delete old avatar from ImageKit:", err)
      );
    }

    // Audit log
    await recordAudit(
      {
        uid: auth.firebaseUid,
        name: auth.user.displayName,
        email: auth.email,
      },
      "UPDATE_AVATAR",
      "user",
      auth.firebaseUid,
      {
        newAvatarUrl: result.url,
        newFileId: result.fileId,
        fileSize: result.size,
        oldFileIdReplaced: oldFileId || null,
      }
    );

    return NextResponse.json({
      success: true,
      photoUrl: result.url,
      photoFileId: result.fileId,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Removes the user's avatar from ImageKit and clears the profile fields.
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { db } = await connectToDatabase();
    const currentUser = await db.collection<IUserProfile>("users").findOne({
      firebaseUid: auth.firebaseUid,
    });

    const oldFileId = currentUser?.photoFileId;

    await db.collection<IUserProfile>("users").updateOne(
      { firebaseUid: auth.firebaseUid },
      {
        $unset: { photoUrl: "", photoFileId: "" },
        $set: { updatedAt: new Date() },
      }
    );

    if (oldFileId) {
      deleteImageKitFile(oldFileId).catch((err) =>
        console.warn("Failed to delete avatar from ImageKit:", err)
      );
    }

    await recordAudit(
      { uid: auth.firebaseUid, name: auth.user.displayName, email: auth.email },
      "REMOVE_AVATAR",
      "user",
      auth.firebaseUid,
      { removedFileId: oldFileId || null }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Avatar delete error:", error);
    return NextResponse.json({ error: "Failed to remove profile photo" }, { status: 500 });
  }
}
