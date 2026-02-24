/**
 * Cart Type Definitions and Validation Utilities
 * Supports localStorage persistence and max 10 items enforcement
 */

import { Id } from "@/convex/_generated/dataModel";

// ─── Constants ─────────────────────────────────────────────────────────────

export const CART_MAX_ITEMS = 10;
export const CART_STORAGE_KEY = "gayla-shop-cart";

// ─── Core Types ────────────────────────────────────────────────────────────

/**
 * Flexible variant representation (e.g., { size: "M", color: "Red" })
 */
export type VariantSelection = Record<string, string>;

/**
 * Single cart item with product info and variant selections
 */
export interface CartItem {
  /** Convex product ID */
  productId: Id<"products">;
  /** Product URL slug */
  slug: string;
  /** Product name */
  name: string;
  /** Unit price (in DZD) */
  price: number;
  /** Quantity (min: 1) */
  quantity: number;
  /** Selected variants (e.g., { size: "M", color: "Blue" }) */
  variants: VariantSelection;
  /** Product thumbnail URL */
  thumbnail?: string;
}

/**
 * Complete cart state
 */
export interface CartState {
  /** Array of cart items (max 10) */
  items: CartItem[];
  /** Total item count (sum of quantities) */
  itemCount: number;
  /** Subtotal in DZD (products only, no delivery) */
  subtotal: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Empty cart initial state
 */
export const EMPTY_CART: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  updatedAt: Date.now(),
};

// ─── Validation Utilities ──────────────────────────────────────────────────

/**
 * Check if two variant selections are identical
 */
export function areVariantsEqual(
  v1: VariantSelection,
  v2: VariantSelection
): boolean {
  const keys1 = Object.keys(v1).sort();
  const keys2 = Object.keys(v2).sort();

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => v1[key] === v2[key]);
}

/**
 * Check if cart item already exists (same product + same variants)
 */
export function findExistingItem(
  items: CartItem[],
  productId: Id<"products">,
  variants: VariantSelection
): CartItem | undefined {
  return items.find(
    (item) =>
      item.productId === productId && areVariantsEqual(item.variants, variants)
  );
}

/**
 * Validate cart doesn't exceed max items limit
 */
export function canAddToCart(currentItems: CartItem[]): boolean {
  return currentItems.length < CART_MAX_ITEMS;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): {
  itemCount: number;
  subtotal: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { itemCount, subtotal };
}

/**
 * Validate cart item structure
 */
export function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;

  const candidate = item as Partial<CartItem>;

  return (
    typeof candidate.productId === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0 &&
    typeof candidate.variants === "object" &&
    candidate.variants !== null
  );
}

/**
 * Validate complete cart state structure
 */
export function isValidCartState(state: unknown): state is CartState {
  if (typeof state !== "object" || state === null) return false;

  const candidate = state as Partial<CartState>;

  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isValidCartItem) &&
    typeof candidate.itemCount === "number" &&
    typeof candidate.subtotal === "number" &&
    typeof candidate.updatedAt === "number"
  );
}

/**
 * Format variant selection for display (e.g., "Size: M, Color: Blue")
 */
export function formatVariants(variants: VariantSelection): string {
  return Object.entries(variants)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

/**
 * Generate unique cart item key for React rendering
 */
export function getCartItemKey(item: CartItem): string {
  const variantStr = Object.entries(item.variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");

  return `${item.productId}-${variantStr}`;
}
