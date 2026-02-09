import { z } from "zod";

/**
 * Zod validation schemas for Gayla
 * Used by: Frontend forms with react-hook-form
 */

// Product validation
export const productSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  titleAR: z.string().min(1, "Arabic title is required"),
  titleFR: z.string().min(1, "French title is required"),
  titleEN: z.string().min(1, "English title is required"),
  descriptionAR: z.string().optional(),
  descriptionFR: z.string().optional(),
  descriptionEN: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  categories: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .optional(),
  isVisible: z.boolean().default(true),
});

// Order validation
export const orderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .regex(/^(05|06|07)[0-9]{8}$/, "Invalid Algerian phone number (e.g., 0555123456)"),
  customerWilaya: z.string().min(1, "Wilaya is required"),
  customerCommune: z.string().min(1, "Commune is required"),
  customerAddress: z.string().min(10, "Address must be at least 10 characters"),
  deliveryType: z.enum(["Domicile", "Stopdesk"]),
  productId: z.string(),
  selectedVariant: z
    .object({
      size: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
  languagePreference: z.enum(["ar", "fr", "en"]),
});

// Site content validation
export const siteContentSchema = z.object({
  heroTitleAR: z.string().optional(),
  heroTitleFR: z.string().optional(),
  heroTitleEN: z.string().optional(),
  heroSubtitleAR: z.string().optional(),
  heroSubtitleFR: z.string().optional(),
  heroSubtitleEN: z.string().optional(),
});

// Auth validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Delivery cost validation
export const deliveryCostSchema = z.object({
  wilayaId: z.number().min(1).max(58),
  domicileCost: z.number().nonnegative("Cost cannot be negative"),
  stopdeskCost: z.number().nonnegative("Cost cannot be negative"),
});

// Helper: Extract type from schema
export type ProductFormData = z.infer<typeof productSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
