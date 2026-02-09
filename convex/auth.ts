import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Get current authenticated admin user
 * Used by: Admin dashboard to verify session
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    return null;
  },
});

/**
 * Login with email and password
 * Used by: Admin login page
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Import bcrypt with SYNC methods
    const bcrypt = require("bcryptjs");

    // Find admin user
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password using SYNC method
    const isValid = bcrypt.compareSync(args.password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
    };
  },
});

/**
 * Verify admin session by user ID
 * Used by: Admin dashboard on load
 */
export const verifySession = query({
  args: {
    userId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      lastLogin: user.lastLogin,
    };
  },
});

/**
 * Check if admin exists (helper query)
 */
export const checkAdminExists = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !!user;
  },
});

/**
 * Insert admin user (helper mutation)
 */
export const insertAdmin = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("adminUsers", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
    });

    return { userId, email: args.email, name: args.name };
  },
});

/**
 * Create admin user (only for initial setup)
 * Used by: Setup script (one-time)
 * Uses action to allow async bcrypt
 */
export const createAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"adminUsers">; email: string; name: string }> => {
    const bcrypt = require("bcryptjs");

    // Check if admin already exists
    const existing = await ctx.runQuery(api.auth.checkAdminExists, {
      email: args.email.toLowerCase(),
    });

    if (existing) {
      throw new Error("Admin user already exists");
    }

    // Validate password strength
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Hash password using SYNC method
    const passwordHash = bcrypt.hashSync(args.password, 10);

    // Create admin user via mutation
    const result = await ctx.runMutation(api.auth.insertAdmin, {
      email: args.email.toLowerCase(),
      passwordHash,
      name: args.name,
    });

    return result;
  },
});

/**
 * Get admin user with password hash (helper query)
 */
export const getAdminWithPassword = query({
  args: {
    userId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Update admin password (helper mutation)
 */
export const updatePassword = mutation({
  args: {
    userId: v.id("adminUsers"),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
    });

    return { success: true };
  },
});

/**
 * Change admin password
 * Used by: Admin settings page
 */
export const changePassword = action({
  args: {
    userId: v.id("adminUsers"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const bcrypt = require("bcryptjs");

    const user = await ctx.runQuery(api.auth.getAdminById, {
      userId: args.userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get the full user with password hash
    const fullUser = await ctx.runQuery(api.auth.getAdminWithPassword, {
      userId: args.userId,
    });

    if (!fullUser) {
      throw new Error("User not found");
    }

    // Verify current password using SYNC method
    const isValid = bcrypt.compareSync(args.currentPassword, fullUser.passwordHash);

    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    // Hash new password using SYNC method
    const newPasswordHash = bcrypt.hashSync(args.newPassword, 10);

    // Update password via mutation
    await ctx.runMutation(api.auth.updatePassword, {
      userId: args.userId,
      passwordHash: newPasswordHash,
    });

    return { success: true };
  },
});

/**
 * Get admin user by ID
 * Used by: Admin dashboard
 */
export const getAdminById = query({
  args: {
    userId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    // Don't return password hash
    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      lastLogin: user.lastLogin,
    };
  },
});
