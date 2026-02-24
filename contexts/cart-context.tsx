"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type {
  AddToCartPayload,
  AddToCartResult,
  CartAction,
  CartItem,
  CartState,
} from "@/lib/types/cart";
import { CART_MAX_ITEMS } from "@/lib/types/cart";
import {
  clearCartStorage,
  readCartFromStorage,
  writeCartToStorage,
} from "@/lib/cart-storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────────

function genId(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function variantsMatch(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}

// ─── Reducer ──────────────────────────────────────────────────────────────────────

const INITIAL: CartState = { items: [], updatedAt: 0 };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_ITEM": {
      const qty = action.payload.quantity ?? 1;
      const idx = state.items.findIndex(
        (i) =>
          i.productId === action.payload.productId &&
          variantsMatch(i.variants, action.payload.variants),
      );

      if (idx !== -1) {
        // Same product+variant → increment quantity only
        return {
          items: state.items.map((item, i) =>
            i === idx ? { ...item, quantity: item.quantity + qty } : item,
          ),
          updatedAt: Date.now(),
        };
      }

      // New unique line item — hard limit enforced in context (not here)
      // Reducer still guards as second layer of defense
      if (state.items.length >= CART_MAX_ITEMS) return state;

      return {
        items: [
          ...state.items,
          { ...action.payload, cartItemId: genId(), quantity: qty },
        ],
        updatedAt: Date.now(),
      };
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((i) => i.cartItemId !== action.cartItemId),
        updatedAt: Date.now(),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((i) => i.cartItemId !== action.cartItemId),
          updatedAt: Date.now(),
        };
      }
      return {
        items: state.items.map((i) =>
          i.cartItemId === action.cartItemId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
        updatedAt: Date.now(),
      };
    }

    case "CLEAR_CART":
      return { items: [], updatedAt: Date.now() };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────────

interface CartCtx {
  items: CartItem[];
  /** Number of unique line items (0–10) */
  itemCount: number;
  /** Sum of productPrice × quantity for all items */
  subtotal: number;
  addItem: (payload: AddToCartPayload) => AddToCartResult;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartCtx | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = readCartFromStorage();
    if (stored.items.length > 0) {
      dispatch({ type: "HYDRATE", state: stored });
    }
  }, []);

  // Persist on every cart change
  useEffect(() => {
    if (state.updatedAt > 0) {
      writeCartToStorage(state);
    }
  }, [state]);

  /**
   * CART LIMIT ENFORCEMENT — Primary guard (Layer 1).
   * Returns { success: false, error: "..." } if adding a new unique item
   * would exceed CART_MAX_ITEMS. Incrementing an existing item always succeeds.
   */
  const addItem = useCallback(
    (payload: AddToCartPayload): AddToCartResult => {
      const alreadyExists = state.items.some(
        (i) =>
          i.productId === payload.productId &&
          variantsMatch(i.variants, payload.variants),
      );

      if (!alreadyExists && state.items.length >= CART_MAX_ITEMS) {
        return {
          success: false,
          error: `Your cart is full (max ${CART_MAX_ITEMS} items). Remove an item to add a new one.`,
        };
      }

      dispatch({ type: "ADD_ITEM", payload });
      return { success: true };
    },
    [state.items],
  );

  const removeItem = useCallback(
    (cartItemId: string) => dispatch({ type: "REMOVE_ITEM", cartItemId }),
    [],
  );

  const updateQuantity = useCallback(
    (cartItemId: string, qty: number) =>
      dispatch({ type: "UPDATE_QUANTITY", cartItemId, quantity: qty }),
    [],
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    clearCartStorage();
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const itemCount = state.items.length;
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
