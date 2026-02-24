/* ============================================================
   VoltBio — Client-Side Image Compression Utility
   
   Uses Canvas API to resize + compress images to keep 
   Base64 strings small enough for localStorage (~5MB limit).
   ============================================================ */

/** Maximum output dimensions */
const MAX_SIZE = 400;

/** Target file size in bytes (150KB) */
const TARGET_BYTES = 150 * 1024;

/** Minimum JPEG quality to try */
const MIN_QUALITY = 0.3;

/**
 * Compresses an image file using Canvas API.
 * 
 * Steps:
 * 1. Load the file into an Image element
 * 2. Resize to fit within MAX_SIZE × MAX_SIZE (preserving aspect ratio)
 * 3. Draw onto a canvas
 * 4. Export as WebP first (better compression), fallback to JPEG
 * 5. Iteratively lower quality until output < TARGET_BYTES
 * 
 * @param file - The image File from <input type="file">
 * @returns A Base64 data URL string, guaranteed < 150KB
 * @throws Error if the image cannot be processed
 */
export async function compressAvatar(file: File): Promise<string> {
  // Validate input
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Load image into memory
  const img = await loadImage(file);

  // Calculate scaled dimensions
  const { width, height } = calculateDimensions(img.width, img.height, MAX_SIZE);

  // Create canvas and draw resized image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Use high-quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Try WebP first (much better compression), then fall back to JPEG
  const formats = supportsWebP()
    ? ["image/webp", "image/jpeg"]
    : ["image/jpeg"];

  for (const format of formats) {
    let quality = 0.8;

    while (quality >= MIN_QUALITY) {
      const dataUrl = canvas.toDataURL(format, quality);
      const sizeBytes = estimateBase64Size(dataUrl);

      if (sizeBytes <= TARGET_BYTES) {
        return dataUrl;
      }

      quality -= 0.1;
    }
  }

  // Last resort: smallest possible JPEG
  return canvas.toDataURL("image/jpeg", MIN_QUALITY);
}

/**
 * Validates file before compression.
 * Returns an error message or null if valid.
 */
export function validateImageFile(file: File): string | null {
  const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB max input
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported format. Please use JPG, PNG, WebP, or GIF.";
  }

  if (file.size > MAX_INPUT_SIZE) {
    return "Image is too large (max 10MB). Choose a smaller file.";
  }

  return null;
}

/* ─────────────────────────────────────────────
   Internal Helpers
   ───────────────────────────────────────────── */

/** Load a file into an HTMLImageElement */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

/** Calculate resized dimensions preserving aspect ratio */
function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxSize: number
): { width: number; height: number } {
  if (srcWidth <= maxSize && srcHeight <= maxSize) {
    return { width: srcWidth, height: srcHeight };
  }

  const ratio = Math.min(maxSize / srcWidth, maxSize / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

/** Estimate the byte size of a base64 data URL */
function estimateBase64Size(dataUrl: string): number {
  // data:image/webp;base64,XXXXX → extract base64 part
  const base64 = dataUrl.split(",")[1] || "";
  // Base64 encodes 3 bytes into 4 characters
  return Math.ceil((base64.length * 3) / 4);
}

/** Feature-detect WebP support */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}
