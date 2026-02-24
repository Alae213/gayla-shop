import type { Id } from "@/convex/_generated/dataModel";

export const CART_MAX_ITEMS = 10;
export const CART_STORAGE_KEY = "gayla-cart";

/**
 * Flexible variant map — forward-compatible with Phase 4 variant builder.
 * e.g. { size: "M", color: "Red" } or { flavor: "Chocolate" }
 */
export type CartVariant = Record<string, string>;

export interface CartItem {
  /** Unique identifier for this line item (product + variant combo) */
  cartItemId: string;
  /** Convex product ID — stored as string, cast back to Id<"products"> on submit */
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  thumbnail: string | null;
  quantity: number;
  variants: CartVariant;
}

export interface CartState {
  items: CartItem[];
  updatedAt: number;
}

/** Payload for adding a new item — quantity defaults to 1 */
export type AddToCartPayload = Omit<CartItem, "cartItemId" | "quantity"> & {
  quantity?: number;
};

export interface AddToCartResult {
  success: boolean;
  error?: string;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: AddToCartPayload }
  | { type: "REMOVE_ITEM"; cartItemId: string }
  | { type: "UPDATE_QUANTITY"; cartItemId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; state: CartState };
