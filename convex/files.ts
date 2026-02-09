import { v } from "convex/values";
import { mutation, action } from "./_generated/server";

/**
 * Generate upload URL for file storage
 * Used by: Admin image upload (hero, products)
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate upload URL from Convex file storage
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

/**
 * Get file URL from storage ID
 * Used by: Display images on frontend
 */
export const getUrl = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

/**
 * Delete file from storage
 * Used by: Admin removes image (optional cleanup)
 */
export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});

/**
 * Upload and process image
 * This action handles the complete flow: upload + get URL
 */
export const uploadImage = action({
  args: {
    // Image will be uploaded as base64 or blob from frontend
  },
  handler: async (ctx) => {
    // This is handled client-side with generateUploadUrl
    // This is just a placeholder for reference
    return { success: true };
  },
});
