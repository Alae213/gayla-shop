import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a presigned upload URL.
 * Client uploads directly to Convex storage using this URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Resolve a storageId into its guaranteed serving URL via ctx.storage.getUrl.
 * Call this imperatively after every upload so you store the real URL.
 * Never construct the URL manually from the upload URL origin — that is unreliable.
 */
export const resolveUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error(`Could not resolve URL for storageId: ${args.storageId}`);
    return url;
  },
});

/**
 * Reactive query version — use in components that need live URL resolution.
 */
export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from Convex storage.
 */
export const deleteFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});
