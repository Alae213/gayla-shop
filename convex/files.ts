import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate upload URL for file storage
 * Used by: Admin image upload (hero, products)
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

/**
 * Get file URL from storage ID
 * Used by: Display images on frontend
 */
export const getUrl = query({
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
