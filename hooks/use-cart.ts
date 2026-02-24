"use client";

/**
 * useCart Hook - Main cart state management
 * Provides cart operations with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  CartState,
  CartItem,
  VariantSelection,
  EMPTY_CART,
  CART_MAX_ITEMS,
  findExistingItem,
  canAddToCart,
  calculateCartTotals,
  getCartItemKey,
} from "@/lib/types/cart";
import {
  getCart,
  saveCart,
  clearCart as clearStorageCart,
  isStorageNearCapacity,
} from "@/lib/utils/cart-storage";

export function useCart() {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loaded = getCart();
    setCart(loaded);
    setIsLoaded(true);
  }, []);

  // Sync to localStorage on cart changes
  const syncCart = useCallback((newCart: CartState) => {
    const success = saveCart(newCart);
    if (!success && isStorageNearCapacity()) {
      console.warn(
        "Cart storage near capacity. Consider clearing old data."
      );
    }
  }, []);

  /**
   * Add item to cart (or update quantity if exists)
   */
  const addItem = useCallback(
    (
      productId: Id<"products">,
      slug: string,
      name: string,
      price: number,
      variants: VariantSelection,
      thumbnail?: string,
      quantity: number = 1
    ) => {
      setCart((prev) => {
        const existing = findExistingItem(prev.items, productId, variants);

        let newItems: CartItem[];

        if (existing) {
          // Update quantity of existing item
          newItems = prev.items.map((item) =>
            getCartItemKey(item) === getCartItemKey(existing)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          if (!canAddToCart(prev.items)) {
            console.error(`Cannot add more than ${CART_MAX_ITEMS} items to cart`);
            return prev; // Return unchanged cart
          }

          const newItem: CartItem = {
            productId,
            slug,
            name,
            price,
            quantity,
            variants,
            thumbnail,
          };
          newItems = [...prev.items, newItem];
        }

        const { itemCount, subtotal } = calculateCartTotals(newItems);
        const newCart: CartState = {
          items: newItems,
          itemCount,
          subtotal,
          updatedAt: Date.now(),
        };

        syncCart(newCart);
        return newCart;
      });
    },
    [syncCart]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    (productId: Id<"products">, variants: VariantSelection) => {
      setCart((prev) => {
        const newItems = prev.items.filter((item) => {
          const existing = findExistingItem([item], productId, variants);
          return !existing;
        });

        const { itemCount, subtotal } = calculateCartTotals(newItems);
        const newCart: CartState = {
          items: newItems,
          itemCount,
          subtotal,
          updatedAt: Date.now(),
        };

        syncCart(newCart);
        return newCart;
      });
    },
    [syncCart]
  );

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    (
      productId: Id<"products">,
      variants: VariantSelection,
      quantity: number
    ) => {
      if (quantity < 1) {
        removeItem(productId, variants);
        return;
      }

      setCart((prev) => {
        const newItems = prev.items.map((item) => {
          const existing = findExistingItem([item], productId, variants);
          return existing ? { ...item, quantity } : item;
        });

        const { itemCount, subtotal } = calculateCartTotals(newItems);
        const newCart: CartState = {
          items: newItems,
          itemCount,
          subtotal,
          updatedAt: Date.now(),
        };

        syncCart(newCart);
        return newCart;
      });
    },
    [syncCart, removeItem]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
    clearStorageCart();
  }, []);

  /**
   * Get item by productId and variants
   */
  const getItem = useCallback(
    (productId: Id<"products">, variants: VariantSelection) => {
      return findExistingItem(cart.items, productId, variants);
    },
    [cart.items]
  );

  /**
   * Check if cart has items
   */
  const isEmpty = cart.items.length === 0;

  /**
   * Check if can add more items
   */
  const canAdd = canAddToCart(cart.items);

  return {
    // State
    cart,
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    isEmpty,
    canAdd,
    isLoaded,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
  };
}
