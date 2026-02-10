import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  // Simple hash for development (use proper bcrypt in production)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Login
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(args.password, user.passwordHash);
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

// Get current user
export const getCurrentUser = query({
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

// Create admin user (for initial setup)
export const createAdminUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("adminUsers", {
      email: args.email.toLowerCase(),
      passwordHash,
      name: args.name,
      lastLogin: Date.now(),
    });

    return { userId };
  },
});
