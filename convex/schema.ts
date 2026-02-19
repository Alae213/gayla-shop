import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Out of stock")
    ),
    images: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          url: v.string(),
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
    viewCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  orders: defineTable({
    orderNumber: v.string(),
    productId: v.id("products"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerWilaya: v.string(),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    deliveryType: v.union(v.literal("Stopdesk"), v.literal("Domicile")),
    deliveryCost: v.number(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
    selectedVariant: v.optional(
      v.object({
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"]),

  deliveryCosts: defineTable({
    wilayaId: v.number(),
    wilayaName: v.string(),
    stopdeskCost: v.number(),
    domicileCost: v.number(),
    updatedAt: v.number(),
  }).index("by_wilayaId", ["wilayaId"]),

  siteContent: defineTable({
    heroTitle: v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    heroCtaText: v.optional(v.string()),
    heroBackgroundImage: v.optional(
      v.object({
        storageId: v.string(),
        url: v.string(),
      })
    ),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    homepageViewCount: v.optional(v.number()),
    updatedAt: v.number(),
  }),
  // Admin users table for authentication
  adminUsers: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),
});
