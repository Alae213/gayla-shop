import { z } from "zod";

/**
 * Zod validation schemas for Gayla
 * Used by: Frontend forms with react-hook-form
 *
 * FIX 24: productSchema previously validated fields that don't exist in the
 * Convex schema (titleAR/FR/EN, descriptionAR/FR/EN, categories, isVisible).
 * The actual convex/schema.ts defines: title (string), description (string),
 * category (singular, optional string), status ("Active"|"Draft"|"Out of stock").
 * Forms using the old schema submitted the wrong shape and Convex rejected them.
 */

// Product validation — aligned with convex/schema.ts products table
export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().optional(),
  status: z.enum(["Active", "Draft", "Out of stock"]),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .optional(),
  sortOrder: z.number().optional(),
});

// Order validation — aligned with convex/schema.ts orders table
export const orderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .regex(/^(05|06|07)[0-9]{8}$/, "Invalid Algerian phone number (e.g., 0555123456)"),
  customerWilaya: z.string().min(1, "Wilaya is required"),
  customerCommune: z.string().optional(),
  customerAddress: z.string().optional(),
  deliveryType: z.enum(["Domicile", "Stopdesk"]),
  deliveryCost: z.number().nonnegative("Delivery cost cannot be negative"),
  productId: z.string().min(1, "Product is required"),
  selectedVariant: z
    .object({
      size: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
});

// Site content validation
export const siteContentSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCtaText: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

// Auth validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Delivery cost validation — aligned with convex/schema.ts deliveryCosts table
export const deliveryCostSchema = z.object({
  wilayaId: z.number().min(1).max(58),
  wilayaName: z.string().min(1, "Wilaya name is required"),
  domicileCost: z.number().nonnegative("Cost cannot be negative"),
  stopdeskCost: z.number().nonnegative("Cost cannot be negative"),
});

// Type exports
export type ProductFormData     = z.infer<typeof productSchema>;
export type OrderFormData        = z.infer<typeof orderSchema>;
export type LoginFormData        = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SiteContentFormData  = z.infer<typeof siteContentSchema>;
export type DeliveryCostFormData = z.infer<typeof deliveryCostSchema>;
