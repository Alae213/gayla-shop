/**
 * Client-side file upload helper
 * Used by: Admin dashboard image upload components
 */

export async function uploadImageToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>
): Promise<{ storageId: string }> {
  // Step 1: Get upload URL from Convex
  const uploadUrl = await generateUploadUrl();

  // Step 2: Upload file to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!result.ok) {
    throw new Error(`Upload failed: ${result.statusText}`);
  }

  const { storageId } = await result.json();

  // FIX 23: Do NOT attempt to reconstruct the public URL on the client.
  //
  // The old code did:
  //   const url = await fetch(`${uploadUrl}/${storageId}`).then(r => r.url)
  //
  // That appended the storageId to the one-time pre-signed UPLOAD endpoint
  // (a POST-only URL) and used the redirected response URL as the image URL.
  // This is wrong — the result was a broken or non-public URL stored in the DB.
  //
  // The correct pattern in Convex is:
  //   ctx.storage.getUrl(storageId)   — call this on the BACKEND
  //
  // products.ts already does this correctly in resolveImages().
  // Callers of uploadImageToConvex should store only { storageId } and
  // let the backend resolve the URL at read time via resolveImages.
  return { storageId };
}

/**
 * Validate image file before upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPG, PNG, or WebP",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 5MB",
    };
  }

  return { valid: true };
}

/**
 * Create a downscaled thumbnail Blob from an image File.
 * FIX 26: Revoke the blob URL in both onload and onerror to prevent
 * memory leaks — each un-revoked URL holds a reference to the file
 * data in memory until the tab is closed.
 */
export async function createThumbnail(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img    = new Image();
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // FIX 26: Revoke immediately after the image has loaded into memory —
      // the canvas drawImage call doesn't need the blob URL anymore.
      URL.revokeObjectURL(objectUrl);

      let width  = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width   = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width  *= maxHeight / height;
          height  = maxHeight;
        }
      }

      canvas.width  = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create thumbnail"));
          }
        },
        file.type,
        0.9
      );
    };

    img.onerror = () => {
      // FIX 26: Also revoke on error path to avoid the same leak.
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
