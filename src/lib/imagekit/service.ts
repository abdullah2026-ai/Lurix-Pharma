import ImageKit from "imagekit";
import sharp from "sharp";

let imagekitInstance: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (imagekitInstance) return imagekitInstance;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.warn("ImageKit environment variables are missing.");
  }

  imagekitInstance = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  return imagekitInstance;
}

export interface OptimizedUploadResult {
  url: string;
  fileId: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Optimizes an image buffer using Sharp:
 * - Resizes to max width/height of 1200px (preserving aspect ratio)
 * - Converts to WebP format at 80% quality
 * - Strips unnecessary metadata to reduce payload
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
  } catch (err) {
    console.error("Sharp optimization fallback:", err);
    return buffer; // fallback to original buffer if sharp fails on unusual formats
  }
}

/**
 * Uploads an optimized medicine image to ImageKit in `/pharmacy/medicines/`
 */
export async function uploadMedicineImage(
  buffer: Buffer,
  fileName: string
): Promise<OptimizedUploadResult> {
  const ik = getImageKitClient();
  const optimizedBuffer = await optimizeImage(buffer);
  
  // Clean file name
  const cleanName = fileName.replace(/\.[^/.]+$/, "") + ".webp";

  const response = await ik.upload({
    file: optimizedBuffer,
    fileName: cleanName,
    folder: "/pharmacy/medicines/",
    useUniqueFileName: true,
    tags: ["medicine", "pharmacy-app"],
  });

  return {
    url: response.url,
    fileId: response.fileId,
    name: response.name,
    size: response.size,
    width: response.width,
    height: response.height,
  };
}

/**
 * Uploads a user profile avatar to ImageKit in `/pharmacy/avatars/`
 * Avatar is resized to 400×400 square (center-crop) then encoded as WebP.
 */
export async function uploadUserAvatar(
  buffer: Buffer,
  fileName: string
): Promise<OptimizedUploadResult> {
  const ik = getImageKitClient();

  const optimizedBuffer = await sharp(buffer)
    .resize({ width: 400, height: 400, fit: "cover", position: "centre" })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  const cleanName = fileName.replace(/\.[^/.]+$/, "") + "-avatar.webp";

  const response = await ik.upload({
    file: optimizedBuffer,
    fileName: cleanName,
    folder: "/pharmacy/avatars/",
    useUniqueFileName: true,
    tags: ["avatar", "user-profile", "pharmacy-app"],
  });

  return {
    url: response.url,
    fileId: response.fileId,
    name: response.name,
    size: response.size,
    width: response.width,
    height: response.height,
  };
}

/**
 * Safely deletes an asset from ImageKit
 */
export async function deleteImageKitFile(fileId: string): Promise<boolean> {
  if (!fileId) return false;
  try {
    const ik = getImageKitClient();
    await ik.deleteFile(fileId);
    return true;
  } catch (err) {
    console.error(`Failed to delete ImageKit asset ${fileId}:`, err);
    return false;
  }
}
