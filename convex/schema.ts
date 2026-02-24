import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── products ──────────────────────────────────────────────────────────────
  products: defineTable({
    title:       v.string(),
    slug:        v.string(),
    description: v.optional(v.string()),
    price:       v.number(),
    category:    v.optional(v.string()),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Out of stock"),
    ),
    images: v.optional(
      v.array(v.object({ storageId: v.string(), url: v.string() }))
    ),
    variants: v.optional(
      v.array(v.object({
        size:  v.optional(v.string()),
        color: v.optional(v.string()),
      }))
    ),
    viewCount:  v.optional(v.number()),
    sortOrder:  v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
    createdAt:  v.optional(v.number()),
    updatedAt:  v.optional(v.number()),
  })
    .index("by_slug",   ["slug"])
    .index("by_status", ["status"]),

  // ─── orders ────────────────────────────────────────────────────────────────
  orders: defineTable({
    orderNumber:      v.string(),
    productId:        v.id("products"),
    productName:      v.optional(v.string()),
    productPrice:     v.optional(v.number()),
    productSlug:      v.optional(v.string()),
    customerName:     v.string(),
    customerPhone:    v.string(),
    customerWilaya:   v.string(),
    customerCommune:  v.optional(v.string()),
    customerAddress:  v.optional(v.string()),
    deliveryType:     v.union(v.literal("Stopdesk"), v.literal("Domicile")),
    deliveryCost:     v.number(),
    totalAmount:      v.optional(v.number()),
    quantity:         v.optional(v.number()),
    // Tracking Mode MVP Core Statuses (includes "hold" for wrong-number flow)
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("confirmed"),
        v.literal("packaged"),
        v.literal("shipped"),
        v.literal("canceled"),
        v.literal("blocked"),
        v.literal("hold")
      )
    ),
    selectedVariant: v.optional(v.object({
      size:  v.optional(v.string()),
      color: v.optional(v.string()),
    })),
    notes:         v.optional(v.string()),
    statusHistory: v.optional(v.array(v.object({
      status:    v.string(),
      timestamp: v.number(),
      note:      v.optional(v.string()),
      reason:    v.optional(v.string()),
    }))),
    callAttempts: v.optional(v.number()),
    callLog: v.optional(v.array(v.object({
      timestamp: v.number(),
      outcome:   v.union(
        v.literal("answered"),
        v.literal("no answer"),
        v.literal("wrong number"),
        v.literal("refused")
      ),
      note:      v.optional(v.string()),
    }))),
    adminNotes: v.optional(v.array(v.object({
      text:      v.string(),
      timestamp: v.number(),
    }))),
    isBanned:          v.optional(v.boolean()),
    cancelReason:      v.optional(v.string()),
    retourReason:      v.optional(v.string()),
    fraudScore:        v.optional(v.number()),
    courierTrackingId: v.optional(v.string()),
    courierSentAt:     v.optional(v.number()),
    courierError:      v.optional(v.string()),
    lastUpdated:       v.optional(v.number()),
    createdAt:         v.optional(v.number()),
    updatedAt:         v.optional(v.number()),
  })
    .index("by_orderNumber",    ["orderNumber"])
    .index("by_status",         ["status"])
    .index("by_customer_phone", ["customerPhone"]),

  // ─── deliveryCosts ─────────────────────────────────────────────────────────
  deliveryCosts: defineTable({
    wilayaId:         v.number(),
    wilayaName:       v.string(),
    stopdeskCost:     v.number(),
    domicileCost:     v.number(),
    isManualOverride: v.optional(v.boolean()),
    lastFetched:      v.optional(v.number()),
    updatedAt:        v.optional(v.number()),
  })
    .index("by_wilayaId", ["wilayaId"]),

  // ─── siteContent ───────────────────────────────────────────────────────────
  siteContent: defineTable({
    heroTitle:    v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    heroCtaText:  v.optional(v.string()),
    heroBackgroundImage: v.optional(v.object({
      storageId: v.string(),
      url:       v.string(),
    })),
    contactEmail:      v.optional(v.string()),
    contactPhone:      v.optional(v.string()),
    homepageViewCount: v.optional(v.number()),
    updatedAt:         v.optional(v.number()),
  }),

  // ─── adminUsers ────────────────────────────────────────────────────────────
  adminUsers: defineTable({
    username:     v.optional(v.string()),
    passwordHash: v.string(),
    email:        v.optional(v.string()),
    name:         v.optional(v.string()),
    lastLogin:    v.optional(v.number()),
    createdAt:    v.optional(v.number()),
  })
    .index("by_username", ["username"])
    .index("by_email",    ["email"]),
});
