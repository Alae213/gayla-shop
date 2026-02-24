import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Password hashing ──────────────────────────────────────────────────────────────────────────────────────────────────
//
// FIX 22: Replaced raw SHA-256 (no salt, instant to crack) with
// PBKDF2-SHA-256 (100,000 iterations + random 16-byte salt per password).
//
// Why PBKDF2 instead of bcrypt/argon2:
//   Convex runs on V8 (same as Cloudflare Workers). bcrypt and argon2 are
//   native C libraries unavailable in this runtime. PBKDF2 is part of the
//   Web Crypto API and works natively in crypto.subtle.
//
// Storage format: "<hex-salt>:<hex-derivedKey>"  (stored in passwordHash field)
// Migration: existing SHA-256 hashes are detected by the absence of ":" and
//   will fail verification, forcing the admin to reset their password once.

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES        = 16;   // 128-bit random salt
const KEY_BITS          = 256;  // 256-bit derived key

/**
 * Hash a plaintext password with PBKDF2-SHA-256.
 * Returns "<hexSalt>:<hexKey>" — both parts needed for verification.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder  = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name:       "PBKDF2",
      salt:       saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash:       "SHA-256",
    },
    keyMaterial,
    KEY_BITS
  );

  const hexSalt = Array.from(saltBytes)
    .map(b => b.toString(16).padStart(2, "0")).join("");
  const hexKey  = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  return `${hexSalt}:${hexKey}`;
}

/**
 * Verify a plaintext password against a stored PBKDF2 hash.
 * Handles legacy SHA-256 hashes (no ":") by returning false, so admins
 * whose passwords were stored with the old scheme must reset once.
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Legacy SHA-256 hash detection — no colon separator
  if (!storedHash.includes(":")) return false;

  const [hexSalt, hexKey] = storedHash.split(":");
  const saltBytes = new Uint8Array(
    hexSalt.match(/.{2}/g)!.map(b => parseInt(b, 16))
  );

  const encoder     = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name:       "PBKDF2",
      salt:       saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash:       "SHA-256",
    },
    keyMaterial,
    KEY_BITS
  );

  const computedHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  return computedHex === hexKey;
}

// ─── Mutations & Queries ───────────────────────────────────────────────────────────────────────────────────────

export const login = mutation({
  args: {
    email:    v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    // Use the same error for missing user and wrong password —
    // prevents email enumeration (attacker can’t tell which failed).
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      // Legacy hash detected (no ":" separator) — prompt re-registration.
      if (!user.passwordHash.includes(":")) {
        throw new Error(
          "Your password was stored with an outdated scheme. " +
          "Please ask an admin to reset your account."
        );
      }
      throw new Error("Invalid email or password");
    }

    await ctx.db.patch(user._id, { lastLogin: Date.now() });

    return {
      userId: user._id,
      email:  user.email,
      name:   user.name,
    };
  },
});

export const getCurrentUser = query({
  args: { userId: v.id("adminUsers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      userId:    user._id,
      email:     user.email,
      name:      user.name,
      lastLogin: user.lastLogin,
    };
  },
});

export const createAdminUser = mutation({
  args: {
    email:    v.string(),
    password: v.string(),
    name:     v.string(),
  },
  handler: async (ctx, args) => {
    // FIX 22B: Minimum password length — blank or trivial passwords must
    // be rejected at the mutation layer (not just the UI) so direct API
    // calls can’t bypass client-side validation.
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(args.password);
    const username     = args.email.toLowerCase().split("@")[0];

    const userId = await ctx.db.insert("adminUsers", {
      username,
      email:        args.email.toLowerCase(),
      passwordHash,
      name:         args.name,
      lastLogin:    Date.now(),
      createdAt:    Date.now(),
    });

    return { userId };
  },
});
