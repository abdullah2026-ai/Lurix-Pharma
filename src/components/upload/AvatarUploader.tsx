"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Trash2, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";
import imageCompression from "browser-image-compression";

interface AvatarUploaderProps {
  currentPhotoUrl?: string | null;
  displayName: string;
  onPhotoChanged: (photoUrl: string | null) => void;
  disabled?: boolean;
}

/**
 * Compression config for avatars — very aggressive since we only need
 * a small profile photo. Server crops to 400×400 anyway.
 */
const AVATAR_COMPRESSION_OPTIONS: Parameters<typeof imageCompression>[1] = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 600,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.85,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarUploader({
  currentPhotoUrl,
  displayName,
  onPhotoChanged,
  disabled = false,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }

    try {
      setIsUploading(true);
      setProgress("Compressing photo...");

      // Client-side compression first
      const compressed = await imageCompression(file, {
        ...AVATAR_COMPRESSION_OPTIONS,
        onProgress: (p) => setProgress(`Compressing... ${p}%`),
      });

      setProgress("Uploading to server...");

      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : "";

      const formData = new FormData();
      formData.append("file", compressed, file.name);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onPhotoChanged(data.photoUrl);
      const savedKB = Math.round((1 - compressed.size / file.size) * 100);
      toast.success(`Profile photo updated! (${savedKB}% compression applied)`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const handleRemove = async () => {
    if (!currentPhotoUrl) return;

    try {
      setIsUploading(true);
      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : "";

      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove photo");
      }

      onPhotoChanged(null);
      toast.success("Profile photo removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {/* Avatar circle */}
      <div className="relative group">
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-emerald-800 to-brand-900 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : currentPhotoUrl ? (
            <Image
              src={currentPhotoUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <span className="text-3xl font-bold text-white select-none">
              {getInitials(displayName) || <User className="w-8 h-8 text-white" />}
            </span>
          )}
        </div>

        {/* Camera badge */}
        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center shadow-md hover:bg-brand-600 transition-colors"
            title="Change profile photo"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Status / action text */}
      {isUploading && progress ? (
        <p className="text-xs text-brand-600 font-medium animate-pulse">{progress}</p>
      ) : (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="hover:text-brand-700 font-semibold transition-colors"
          >
            Change Photo
          </button>
          {currentPhotoUrl && (
            <>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center max-w-[200px]">
        PNG, JPG, WebP up to 20MB · Auto-compressed &amp; cropped to 400×400
      </p>
    </div>
  );
}
