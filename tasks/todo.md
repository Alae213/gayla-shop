# Gayla Shop Cart & Checkout Implementation Progress

## Phase 1: Foundation & Data Models ✅

### Task 1.1: Define Cart Data Structure ✅
- [x] Created `lib/types/cart.ts` with TypeScript interfaces
- [x] CartItem interface (productId, slug, name, price, quantity, variants, thumbnail)
- [x] CartState interface (items, itemCount, subtotal, updatedAt)
- [x] CART_MAX_ITEMS constant (10 items limit)
- [x] Validation utilities (areVariantsEqual, findExistingItem, canAddToCart)
- [x] Cart calculation utilities (calculateCartTotals)
- [x] Variant formatting and display helpers

**Commit:** [2ad6ccf](https://github.com/Alae213/gayla-shop/commit/2ad6ccf08fec45b1a71d1dcc7fcd3418067e4b3a)

### Task 1.2: Update Convex Product Schema ✅
- [x] Added `variantGroups` field to product schema
- [x] Variant group structure: name + values array
- [x] Each value has: label, enabled, order fields
- [x] Backward compatible with existing variants field
- [x] Flat structure (no nesting)

**Commit:** [a468f9a](https://github.com/Alae213/gayla-shop/commit/a468f9ab0dcf4661d55fa692f5c3c10d52feb3f2)

### Task 1.3: Update Order Schema for Line Items ✅
- [x] Added `lineItems` array to order schema
- [x] Line item structure: productId, productName, quantity, unitPrice, variants, lineTotal, thumbnail
- [x] Added `changeLog` array for admin edit tracking
- [x] Change log tracks: timestamp, adminId, adminName, action, changes
- [x] Backward compatible with legacy single-product fields
- [x] Flexible variant support via Record<string, string>

**Commit:** [a468f9a](https://github.com/Alae213/gayla-shop/commit/a468f9ab0dcf4661d55fa692f5c3c10d52feb3f2)

---

## Phase 2: Cart Persistence & Side Panel 🔄

### Task 2.1: Cart Hook & localStorage Management
- [ ] Create `hooks/use-cart.ts` with cart operations
- [ ] Create `lib/utils/cart-storage.ts` for localStorage sync
- [ ] Implement add/remove/update/clear methods
- [ ] localStorage sync on every mutation
- [ ] Cart item count calculation
- [ ] 10-item limit enforcement
- [ ] Duplicate variant detection

### Task 2.2: Cart Side Panel Component
- [ ] Create `components/cart/cart-side-panel.tsx`
- [ ] Create `components/cart/cart-item-card.tsx`
- [ ] Implement slide-in panel (shadcn Sheet)
- [ ] Product list with thumbnails
- [ ] Compact variant badges
- [ ] Subtotal display
- [ ] "Buy Now" button → `/checkout` navigation
- [ ] Empty state UI

### Task 2.3: Add to Cart on Product Page
- [ ] Create `components/product/add-to-cart-button.tsx`
- [ ] Integrate button in `app/products/[slug]/page.tsx`
- [ ] Variant selection validation
- [ ] Success toast notification
- [ ] Auto-open cart side panel
- [ ] Handle duplicate items (update quantity)

---

## Phase 3: Checkout Flow

### Task 3.1: Checkout Page Layout
- [ ] Create `app/checkout/page.tsx`
- [ ] Create `components/checkout/checkout-cart-items.tsx`
- [ ] Two-column layout (cart items + order form)
- [ ] Quantity stepper per item
- [ ] Remove item button
- [ ] Live subtotal calculation

### Task 3.2: Reuse COD Form with Delivery Integration
- [ ] Create `components/checkout/checkout-form.tsx`
- [ ] Create `lib/utils/yalidin-api.ts`
- [ ] Delivery type toggle (Stopdesk/Domicile)
- [ ] Wilaya → Commune → Agence/Address cascading
- [ ] Yalidin API integration
- [ ] Real-time delivery cost updates
- [ ] Order summary (Subtotal + Delivery + Total)

### Task 3.3: Checkout Validation & Conflict Resolution
- [ ] Create `lib/utils/cart-validator.ts`
- [ ] Create `components/checkout/conflict-dialog.tsx`
- [ ] Validate cart against live product data
- [ ] Detect inactive products, price changes, disabled variants
- [ ] Warning dialog with conflict details
- [ ] Auto-remove/update conflicts

### Task 3.4: Order Submission
- [ ] Update `convex/orders.ts` mutation
- [ ] Create order with multiple line items
- [ ] Store delivery details and totals
- [ ] Clear localStorage cart on success
- [ ] Redirect to order confirmation

---

## Phase 4: Admin Variant Builder

### Task 4.1: Variant Builder UI
- [ ] Create `app/admin/products/[id]/variants/page.tsx`
- [ ] Create `components/admin/variant-group-editor.tsx`
- [ ] "Add Variant Group" button
- [ ] Inline group name input with suggestions
- [ ] Value chips with add/edit/delete
- [ ] Drag-and-drop reordering (dnd-kit)
- [ ] Enable/disable toggle per value
- [ ] Save/Cancel actions

### Task 4.2: Variant Display on Product Page
- [ ] Create `components/product/variant-selector.tsx`
- [ ] Render variant groups from product data
- [ ] Show enabled variants as selectable
- [ ] Show disabled variants as grayed-out
- [ ] Selected state styling
- [ ] Validate selection before add to cart

---

## Phase 5: Admin Order Editing

### Task 5.1: Order Detail Panel — Line Item Editor
- [ ] Update `app/admin/orders/[id]/page.tsx`
- [ ] Create `components/admin/order-line-item-editor.tsx`
- [ ] Editable line items table
- [ ] Quantity stepper per line item
- [ ] Variant selector per line item
- [ ] Remove item button
- [ ] "Add Product" button → search modal
- [ ] Auto-recalculate totals

### Task 5.2: Add Product to Order Modal
- [ ] Create `components/admin/add-product-modal.tsx`
- [ ] Searchable product dropdown
- [ ] Variant selector
- [ ] Quantity input
- [ ] Add button with validation

### Task 5.3: Delivery Destination Editor & Recalculation
- [ ] Create `components/admin/order-delivery-editor.tsx`
- [ ] Update `convex/orders.ts` mutation
- [ ] Edit button on delivery section
- [ ] Wilaya/Commune selector
- [ ] Delivery cost recalculation
- [ ] Save with history log

### Task 5.4: History Timeline — Enhanced Logging
- [ ] Update `components/admin/order-history-timeline.tsx`
- [ ] Update `convex/orders.ts` logging
- [ ] Log all order modifications
- [ ] Format line item edits
- [ ] Collapse/expand long entries
- [ ] Sort by newest first

---

## Phase 6: Admin UI Adjustments

### Task 6.1: Product Grid — 3 Columns
- [ ] Update `app/admin/products/page.tsx`
- [ ] Update `app/page.tsx` (homepage)
- [ ] Change from 5 to 3 columns
- [ ] Responsive breakpoints

---

## Phase 7: Testing & Polish

### Task 7.1: E2E Testing
- [ ] Test cart persistence across sessions
- [ ] Test cart editing on checkout
- [ ] Test conflict resolution
- [ ] Test order submission
- [ ] Test admin order editing
- [ ] Verify history logs

### Task 7.2: Edge Cases & Error Handling
- [ ] localStorage unavailable
- [ ] Yalidin API failure
- [ ] Product deleted while in cart
- [ ] Concurrent admin edits
- [ ] 10-item cart limit
- [ ] Variant no longer exists

### Task 7.3: Documentation
- [ ] Create `docs/cart-checkout-flow.md`
- [ ] Create `docs/admin-order-editing.md`
- [ ] Document cart architecture
- [ ] Document variant builder usage
- [ ] Document Yalidin integration

---

## Current Status

**Completed:** Phase 1 (Foundation & Data Models)

**Next Up:** Phase 2 - Task 2.1 (Cart Hook & localStorage Management)

**Overall Progress:** 3/31 tasks completed (10%)
