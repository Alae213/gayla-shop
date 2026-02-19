import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Products table
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          storageId: v.string(),
        })
      )
    ),
    variants: v.optional(
      v.array(
        v.object({
          size: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      )
    ),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Out of stock")
    ),
    viewCount: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // Orders table
  orders: defineTable({
    orderNumber: v.string(),
    // ─── Core status ───────────────────────────────────────────────────────────
    // Keep legacy literals so existing documents stay valid.
    // New statuses added: Called 01, Called 02, Retour.
    status: v.union(
      v.literal("Pending"),
      v.literal("Confirmed"),
      v.literal("Cancelled"),
      v.literal("Called no respond"), // legacy — kept for existing data
      v.literal("Called 01"),
      v.literal("Called 02"),
      v.literal("Packaged"),
      v.literal("Shipped"),
      v.literal("Delivered"),
      v.literal("Retour")
    ),
    customerName: v.string(),
    customerPhone: v.string(),
    customerWilaya: v.string(),
    customerCommune: v.string(),
    customerAddress: v.string(),
    deliveryType: v.union(v.literal("Domicile"), v.literal("Stopdesk")),
    deliveryCost: v.number(),
    productId: v.id("products"),
    productName: v.string(),
    productPrice: v.number(),
    productSlug: v.optional(v.string()),
    selectedVariant: v.optional(
      v.object({
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
    totalAmount: v.number(),
    lastUpdated: v.number(),
    updatedAt: v.optional(v.number()),

    // ─── Call tracking ─────────────────────────────────────────────────────────
    callAttempts: v.optional(v.number()), // 0 | 1 | 2
    callLog: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          outcome: v.union(
            v.literal("answered"),
            v.literal("no_answer")
          ),
          note: v.optional(v.string()),
        })
      )
    ),

    // ─── Status history / audit trail ──────────────────────────────────────────
    statusHistory: v.optional(
      v.array(
        v.object({
          status: v.string(),
          timestamp: v.number(),
          reason: v.optional(v.string()),
        })
      )
    ),

    // ─── Admin notes ───────────────────────────────────────────────────────────
    adminNotes: v.optional(
      v.array(
        v.object({
          text: v.string(),
          timestamp: v.number(),
        })
      )
    ),

    // ─── Fraud / ban ───────────────────────────────────────────────────────────
    fraudScore: v.optional(v.number()),  // default 0 — increments on retour / cancel patterns
    isBanned: v.optional(v.boolean()),   // default false

    // ─── Courier integration ───────────────────────────────────────────────────
    courierSentAt: v.optional(v.number()),
    courierTrackingId: v.optional(v.string()),
    courierError: v.optional(v.string()),

    // ─── Retour ────────────────────────────────────────────────────────────────
    retourReason: v.optional(v.string()),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_customer_phone", ["customerPhone"]),

  // Delivery costs table
  deliveryCosts: defineTable({
    wilayaId: v.number(),
    wilayaName: v.string(),
    domicileCost: v.number(),
    stopdeskCost: v.number(),
    lastFetched: v.number(),
    isManualOverride: v.boolean(),
  }).index("by_wilaya_id", ["wilayaId"]),

  // Admin users table
  adminUsers: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    lastLogin: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Site content table
  siteContent: defineTable({
    heroTitle: v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    heroCtaText: v.optional(v.string()),
    heroBackgroundImage: v.optional(
      v.object({
        url: v.string(),
        storageId: v.string(),
      })
    ),
    homepageViewCount: v.number(),
  }),
});
