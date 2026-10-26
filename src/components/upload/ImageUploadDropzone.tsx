"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, Loader2, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";
import imageCompression from "browser-image-compression";

interface ImageUploadDropzoneProps {
  currentImageUrl?: string;
  currentImageFileId?: string;
  onImageUploaded: (result: { url: string; fileId: string }) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Client-side image compression options using browser-image-compression.
 * Reduces file size before sending to the server, saving bandwidth and
 * improving upload speed. The server still applies Sharp for format
 * conversion and final optimization.
 */
const COMPRESSION_OPTIONS: Parameters<typeof imageCompression>[1] = {
  maxSizeMB: 1.5,          // compress to max 1.5MB before upload
  maxWidthOrHeight: 1400,  // downscale large images
  useWebWorker: true,      // non-blocking compression
  fileType: "image/webp",  // convert to WebP in browser too
  initialQuality: 0.82,
};

export function ImageUploadDropzone({
  currentImageUrl,
  currentImageFileId,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
  label = "medicine photo",
}: ImageUploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size cannot exceed 20MB");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Client-side compression via browser-image-compression
      setCompressionProgress("Compressing image in browser...");
      const compressedFile = await imageCompression(file, {
        ...COMPRESSION_OPTIONS,
        onProgress: (progress) => {
          setCompressionProgress(`Compressing... ${progress}%`);
        },
      });

      setCompressionProgress("Uploading to ImageKit...");

      // Step 2: Get Firebase auth token
      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : "";

      // Step 3: Upload compressed file
      const formData = new FormData();
      formData.append("file", compressedFile, file.name);
      if (currentImageFileId) {
        formData.append("oldFileId", currentImageFileId);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const originalKB = Math.round(file.size / 1024);
      const compressedKB = Math.round(compressedFile.size / 1024);
      toast.success(
        `Image uploaded! Compressed ${originalKB}KB → ${compressedKB}KB (${Math.round((1 - compressedKB / originalKB) * 100)}% saved)`
      );

      onImageUploaded({ url: data.image.url, fileId: data.image.fileId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      setCompressionProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleRemove = async () => {
    if (!currentImageFileId) {
      onImageRemoved();
      return;
    }

    try {
      setIsUploading(true);
      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : "";

      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId: currentImageFileId }),
      });

      toast.success("Image removed");
      onImageRemoved();
    } catch {
      toast.error("Failed to delete image asset");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          // Reset so re-selecting same file triggers onChange
          e.target.value = "";
        }}
        disabled={disabled || isUploading}
      />

      {currentImageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-950/10 shadow-neu-sm bg-white p-2">
          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group">
            <Image
              src={currentImageUrl}
              alt="Image preview"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 300px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 px-1 text-xs">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ✓ Compressed + WebP via ImageKit
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-2.5 py-1 text-xs font-semibold text-brand-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-brand-500 bg-brand-50/60 scale-[0.99]"
              : "border-gray-300 hover:border-brand-600 bg-white shadow-neu-sm"
          } ${disabled || isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs font-medium text-gray-600">
                {compressionProgress || "Processing..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Click to upload or drag &amp; drop {label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  PNG, JPG, WebP, GIF up to 20MB (auto-compressed before upload)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
