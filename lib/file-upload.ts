/**
 * Client-side file upload helper
 * Used by: Admin dashboard image upload components
 */

export async function uploadImageToConvex(
    file: File,
    generateUploadUrl: () => Promise<string>
  ): Promise<{ storageId: string; url: string }> {
    try {
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
  
      // Step 3: Get public URL
      const url = await fetch(`${uploadUrl}/${storageId}`).then((r) => r.url);
  
      return { storageId, url };
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  }
  
  /**
   * Validate image file
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
   * Create thumbnail from image file
   */
  export async function createThumbnail(
    file: File,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      img.onload = () => {
        let width = img.width;
        let height = img.height;
  
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
  
        canvas.width = width;
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
  
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }
  