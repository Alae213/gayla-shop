import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Gayla Database Schema
 */
const schema = defineSchema({
  // Admin users table
  adminUsers: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    lastLogin: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Products table
  products: defineTable({
    slug: v.string(),
    titleAR: v.string(),
    titleFR: v.string(),
    titleEN: v.string(),
    descriptionAR: v.optional(v.string()),
    descriptionFR: v.optional(v.string()),
    descriptionEN: v.optional(v.string()),
    price: v.number(),
    images: v.array(
      v.object({
        storageId: v.string(),
        url: v.string(),
      })
    ),
    variants: v.optional(
      v.array(
        v.object({
          size: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      )
    ),
    categories: v.optional(v.array(v.string())),
    isVisible: v.boolean(),
    viewCount: v.number(),
  }).index("by_slug", ["slug"]),

  // Orders table
  orders: defineTable({
    orderNumber: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Confirmed"),
      v.literal("Cancelled"),
      v.literal("Called no respond"),
      v.literal("Packaged"),
      v.literal("Shipped"),
      v.literal("Delivered")
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
    selectedVariant: v.optional(
      v.object({
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
    totalAmount: v.number(),
    languagePreference: v.union(
      v.literal("ar"),
      v.literal("fr"),
      v.literal("en")
    ),
    lastUpdated: v.number(),
  }).index("by_order_number", ["orderNumber"]),

  // Site content (singleton)
  siteContent: defineTable({
    heroTitleAR: v.string(),
    heroTitleFR: v.string(),
    heroTitleEN: v.string(),
    heroSubtitleAR: v.string(),
    heroSubtitleFR: v.string(),
    heroSubtitleEN: v.string(),
    heroBackgroundImage: v.object({
      storageId: v.string(),
      url: v.string(),
    }),
    homepageViewCount: v.number(),
  }),

  // Delivery costs
  deliveryCosts: defineTable({
    wilayaId: v.number(),
    wilayaName: v.string(),
    domicileCost: v.number(),
    stopdeskCost: v.number(),
    lastFetched: v.number(),
    isManualOverride: v.boolean(),
  }).index("by_wilaya_id", ["wilayaId"]),
});

export default schema;
