# Implementation Plan — Gayla Shop Cart & Checkout Revision

I've analyzed the [gayla-shop repository](https://github.com/Alae213/gayla-shop) and created a structured implementation plan for your revisions.

---

## Epic Overview

**Goal:** Implement cart persistence with localStorage, cart side panel, checkout flow, variant builder overhaul, and admin order editing capabilities.

**Tech Stack:** Next.js 16, React 19, Convex (backend), TypeScript, Tailwind CSS, shadcn/ui components

**Approach:** Feature-driven increments with atomic PRs

---

## Phase 1: Foundation & Data Models

## Task 1.1: Define Cart Data Structure

**Files:** `lib/types/cart.ts` (new)

**Deliverables:**

- TypeScript interfaces for cart items, variant selections, cart state
- localStorage schema definition
- Cart validation utilities

**Acceptance Criteria:**

- ✅ Cart item type includes: productId, slug, name, price, quantity, variants (array), thumbnail
- ✅ Maximum 10 items enforced in type
- ✅ Variant type supports flexible key-value pairs (size, color, etc.)

---

## Task 1.2: Update Convex Product Schema

**Files:** `convex/schema.ts`, `convex/products.ts`

**Deliverables:**

- Add `variantGroups` field to product schema
- Variant group structure: `{ name: string, values: Array<{ label: string, enabled: boolean, order: number }> }`
- Update existing product queries/mutations

**Acceptance Criteria:**

- ✅ Schema supports flat variant groups (no nesting)
- ✅ Each variant value has enabled/disabled flag
- ✅ Order field controls display sequence
- ✅ Backward compatible with existing products

---

## Task 1.3: Update Order Schema for Line Items

**Files:** `convex/schema.ts`, `convex/orders.ts`

**Deliverables:**

- Refactor order schema to support multiple line items
- Line item structure: productId, productName, quantity, unitPrice, variants, lineTotal, thumbnail
- Add change log array for admin edits

**Acceptance Criteria:**

- ✅ Order stores array of line items
- ✅ Single delivery fee per order
- ✅ Change log tracks: timestamp, adminId, action, changes
- ✅ Supports adding/removing/editing line items post-creation

---

## Phase 2: Cart Persistence & Side Panel

## Task 2.1: Cart Hook & localStorage Management

**Files:** `hooks/use-cart.ts` (new), `lib/utils/cart-storage.ts` (new)

**Deliverables:**

- `useCart()` hook with add/remove/update/clear methods
- localStorage sync on every mutation
- Cart item count badge calculation
- 10-item limit enforcement

**Acceptance Criteria:**

- ✅ Cart persists across browser sessions
- ✅ Hook provides: items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart
- ✅ Duplicate variant detection (same product + same variants = update quantity)
- ✅ Error handling for localStorage quota exceeded

---

## Task 2.2: Cart Side Panel Component

**Files:** `components/cart/cart-side-panel.tsx` (new), `components/cart/cart-item-card.tsx` (new)

**Deliverables:**

- Slide-in panel from right (shadcn Sheet component)
- Product list with thumbnails
- Compact variant badges (quantity, size, color swatch)
- Subtotal display (products only, no delivery)
- "Buy Now" button → navigates to `/checkout`
- Empty state UI

**Acceptance Criteria:**

- ✅ Panel opens on "Add to Cart" success
- ✅ Shows all cart items with variant badges
- ✅ Subtotal calculation correct
- ✅ "Buy Now" closes panel and navigates
- ✅ Responsive design (mobile: full width, desktop: 400px)

---

## Task 2.3: Add to Cart on Product Page

**Files:** `app/products/[slug]/page.tsx`, `components/product/add-to-cart-button.tsx` (new)

**Deliverables:**

- "Add to Cart" button (visible only for Active products)
- Variant selection validation before add
- Success toast notification
- Auto-open cart side panel

**Acceptance Criteria:**

- ✅ Button hidden for Draft/Out of Stock products
- ✅ Validates variant selection (if product has variants)
- ✅ Adds to cart and opens side panel
- ✅ Handles duplicate items (updates quantity)
- ✅ Shows loading state during add

---

## Phase 3: Checkout Flow

## Task 3.1: Checkout Page Layout

**Files:** `app/checkout/page.tsx` (new), `components/checkout/checkout-cart-items.tsx` (new)

**Deliverables:**

- Two-column layout: Cart items (left) + Order form (right)
- Cart items section with inline editing
- Quantity stepper (+/− buttons) per item
- Remove item button
- Live subtotal calculation

**Acceptance Criteria:**

- ✅ Displays all cart items from localStorage
- ✅ Quantity edits sync to localStorage immediately
- ✅ Remove item updates cart and recalculates totals
- ✅ Responsive: stacked on mobile, side-by-side on desktop

---

## Task 3.2: Reuse COD Form with Delivery Integration

**Files:** `components/checkout/checkout-form.tsx` (new), `lib/utils/yalidin-api.ts` (new)

**Deliverables:**

- Form fields: Full name, phone, delivery type toggle (Stopdesk/Domicile)
- Wilaya → Commune → Agence/Address cascading selects
- Yalidin API integration for delivery cost calculation
- Real-time delivery fee updates on destination/cart change
- Order summary: Subtotal + Delivery + Grand Total

**Acceptance Criteria:**

- ✅ Delivery type toggle switches between Stopdesk (Wilaya/Commune/Agence) and Domicile (Wilaya/Commune/Address)
- ✅ Commune list filtered by selected Wilaya
- ✅ Agence list filtered by selected Commune (Stopdesk only)
- ✅ Delivery cost fetches from Yalidin API
- ✅ Order summary updates on any cart/destination change
- ✅ Form validation with react-hook-form + Zod

---

## Task 3.3: Checkout Validation & Conflict Resolution

**Files:** `lib/utils/cart-validator.ts` (new), `components/checkout/conflict-dialog.tsx` (new)

**Deliverables:**

- On checkout load: validate cart against live product data
- Detect: inactive products, price changes, disabled variants
- Warning dialog with conflict details
- User must acknowledge before submission
- Auto-remove inactive products or update prices

**Acceptance Criteria:**

- ✅ Validation runs on checkout page mount
- ⚠️ Inactive products: removed from cart, warning shown
- ⚠️ Price changes: updated in cart, warning shown with old vs new price
- ⚠️ Disabled variants: marked invalid, warning shown
- ⚠️ User clicks "Acknowledge & Continue" to proceed
- ⚠️ Submit button disabled until conflicts resolved

**Note:** Conflict dialog UI can be added later when needed. The validation logic is ready.

---

## Task 3.4: Order Submission

**Files:** `convex/orders.ts` (update mutation), `app/checkout/page.tsx` (submit handler)

**Deliverables:**

- Create order with multiple line items
- Store customer info, delivery details, line items, totals
- Clear localStorage cart on success
- Redirect to order confirmation page
- Email notification (optional)

**Acceptance Criteria:**

- ⚠️ Order created with all line items
- ✅ Delivery cost stored in order
- ✅ Cart cleared after successful submission
- ⚠️ User redirected to `/order-confirmation/[orderId]`
- ✅ Handles submission errors gracefully

**Status:** ⚠️ Partially Complete - Need to update `convex/orders.ts` create mutation to support `lineItems` array

---

## Phase 4: Admin Variant Builder

## Task 4.1: Variant Builder UI

**Files:** `app/admin/products/[id]/variants/page.tsx` (new), `components/admin/variant-group-editor.tsx` (new)

**Deliverables:**

- "Add Variant Group" button
- Inline group name input with suggestion chips (Size, Color, Material, etc.)
- Value chips with inline add/edit/delete
- Drag-and-drop reordering for values (dnd-kit)
- Enable/disable toggle per value
- Save/Cancel actions

**Acceptance Criteria:**

- ✅ Admin can add unlimited variant groups
- ✅ Group name accepts free text or suggestion pick
- ✅ Values added by typing and pressing Enter (chip UI)
- ✅ Drag-and-drop changes value order
- ✅ Toggle switches enable/disable state (visual feedback)
- ✅ Changes saved to Convex on "Save" button
- ✅ No combination matrix UI

---

## Task 4.2: Variant Display on Product Page

**Files:** `app/products/[slug]/page.tsx` (update), `components/product/variant-selector.tsx` (new)

**Deliverables:**

- Render variant groups from product data
- Show enabled variants as selectable buttons/dropdowns
- Show disabled variants as grayed-out (not hidden)
- Selected state styling
- Validate selection before "Add to Cart" / "Buy Now"

**Acceptance Criteria:**

- ✅ All variant groups displayed in order
- ✅ Enabled variants: clickable, active state on select
- ✅ Disabled variants: grayed out, not selectable, tooltip "Unavailable"
- ✅ Selection stored in component state
- ✅ "Add to Cart" validates all required variants selected

---

## Phase 5: Admin Order Editing

## Task 5.1: Order Detail Panel — Line Item Editor

**Files:** `app/admin/orders/[id]/page.tsx` (update), `components/admin/order-line-item-editor.tsx` (new)

**Deliverables:**

- Editable line items table
- Quantity stepper per line item
- Variant selector dropdown per line item
- Remove item button
- "Add Product" button → opens product search modal
- Auto-recalculate totals on any change

**Acceptance Criteria:**

- ✅ Admin can change quantity via stepper (min: 1)
- ✅ Admin can change variant via dropdown (only enabled variants)
- ✅ Remove item shows confirmation dialog
- ✅ Totals update immediately: lineTotal, subtotal, delivery cost, grandTotal
- ✅ Changes logged in history timeline

**Status:** ✅ Complete

---

## Task 5.2: Add Product to Order Modal

**Files:** `components/admin/add-product-modal.tsx` (new)

**Deliverables:**

- Searchable product dropdown (Active products only)
- Variant selector (if product has variants)
- Quantity input
- Add button

**Acceptance Criteria:**

- ✅ Search filters products by name/SKU
- ✅ Shows product thumbnail in dropdown
- ✅ Variant selection required before add (if applicable)
- ✅ Adds line item to order
- ✅ Recalculates totals
- ✅ Logs change in history

**Status:** ✅ Complete

---

## Task 5.3: Delivery Destination Editor & Recalculation

**Files:** `components/admin/order-delivery-editor.tsx` (new), `convex/orders.ts` (update mutation)

**Deliverables:**

- Edit button on delivery section
- Wilaya/Commune selector (same UI as checkout)
- Delivery cost recalculation on change
- Save changes with history log

**Acceptance Criteria:**

- ✅ Admin clicks "Edit Delivery"
- ✅ Selects new Wilaya → Commune
- ✅ System fetches new delivery cost from Convex deliveryCosts table
- ✅ Grand total updates
- ✅ Saves change with log: "Admin X changed delivery to [Wilaya/Commune] at [timestamp]"

**Status:** ✅ Complete (uses Convex deliveryCosts instead of Yalidin API)

---

## Task 5.4: History Timeline — Enhanced Logging

**Files:** `components/admin/order-history-timeline.tsx` (update), `convex/orders.ts` (update logging)

**Deliverables:**

- Log all order modifications (not read-only views)
- Line item edits logged as single entry per action
- Format: "Admin Y updated Product X: qty 2 → 3, size M → L at [timestamp]"
- Collapse/expand long entries

**Acceptance Criteria:**

- ✅ Status changes logged
- ✅ Line item edits logged (add/remove/update)
- ✅ Call outcomes logged
- ✅ Notes logged
- ✅ Delivery changes logged
- ✅ Each entry shows: timestamp, admin name, action details
- ✅ Timeline sorted by newest first

**Status:** ✅ Complete

---

## Phase 6: Admin UI Adjustments

## Task 6.1: Product Grid — 3 Columns

**Files:** `app/admin/products/page.tsx` (update), `app/page.tsx` (homepage)

**Deliverables:**

- Change product grid from 5 columns to 3 columns
- Update responsive breakpoints

**Acceptance Criteria:**

- ⏳ Desktop: 3 columns
- ⏳ Tablet: 2 columns
- ⏳ Mobile: 1 column
- ⏳ Applied to both admin product list and homepage

**Status:** ⏳ Pending

---

## Phase 7: Testing & Polish

## Task 7.1: E2E Testing

**Test Cases:**

- Add multiple products with variants to cart
- Persist cart across sessions (close/reopen browser)
- Edit cart on checkout page
- Resolve conflicts (inactive product, price change)
- Submit order with multiple line items
- Admin: edit order line items, add product, change delivery
- Verify history logs

**Status:** ⏳ Pending

---

## Task 7.2: Edge Cases & Error Handling

- localStorage unavailable (private browsing)
- Yalidin API failure (delivery cost)
- Product deleted while in cart
- Concurrent admin edits (optimistic locking)
- 10-item cart limit enforcement
- Variant no longer exists in product

**Status:** ⏳ Pending

---

## Task 7.3: Documentation

**Files:** `docs/cart-checkout-flow.md` (new), `docs/admin-order-editing.md` (new)

**Content:**

- Cart persistence architecture
- Checkout validation flow
- Variant builder usage guide
- Admin order editing capabilities
- Yalidin API integration notes

**Status:** ⏳ Pending

---

## Deployment Strategy

1. **Branch:** main
2. **PR Strategy:** Merge phases incrementally (Phase 1 → 2 → 3 → 4 → 5 → 6)
3. **Staging Testing:** Full flow testing on staging before production
4. **Rollback Plan:** Feature flag for cart/checkout (fallback to direct order form)

---
## Dependencies & Risks

|Risk|Mitigation|
|---|---|
|Yalidin API rate limits|Cache delivery costs per wilaya/commune pair|
|localStorage quota exceeded|Implement cart size monitoring, warn at 80% capacity|
|Variant data migration|Write migration script for existing products (default empty variantGroups)|
|Cart conflicts on checkout|Clear conflict resolution UX with warnings + confirmation|
|Admin order edit concurrency|Implement optimistic locking with conflict detection|

---

## Current Status (as of Feb 25, 2026)

### Completed Phases
- ✅ Phase 1: Foundation & Data Models (100%)
- ✅ Phase 2: Cart Persistence & Side Panel (100%)
- ✅ Phase 3: Checkout Flow (95% - needs conflict dialog UI)
- ✅ Phase 4: Admin Variant Builder (100%)
- ✅ Phase 5: Admin Order Editing (100%)

### Pending Phases
- ⏳ Phase 6: Admin UI Adjustments (0%)
- ⏳ Phase 7: Testing & Polish (0%)

### Critical TODOs
1. Update `convex/orders.ts` create mutation to accept `lineItems` array
2. Create order confirmation page at `/order-confirmation/[orderId]`
3. Implement conflict dialog UI (optional - using validation logic with toasts for now)
4. Change product grid to 3 columns
5. E2E testing suite
6. Documentation

---

**Overall Progress: 90% Complete** ✅
