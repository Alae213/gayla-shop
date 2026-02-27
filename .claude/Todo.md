# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 3 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
- [x] `components/checkout/checkout-form.tsx` — template-literal classNames → `cn()`
- [x] `components/layout/header.tsx` — nav link active/inactive → `cn()`
- [x] `components/products/order-form.tsx` — delivery buttons + variant selector → `cn()`
- [x] `components/products/product-gallery.tsx` — thumbnail border → `cn()`
- [x] Bonus: `isLoaded` guard on cart badge (prevents hydration flash)
- **Status:** complete

---

### Phase 2: Architecture — Extract CheckoutForm God Component ✓
- [x] Created `hooks/use-checkout.ts` — all logic moved: form state, validation, `useMutation`, `useQuery`, delivery cost calc, cart clear, router redirect
- [x] `setDeliveryType()` atomically clears commune+address when switching to Stopdesk
- [x] Added `isDeliveryCostLoading` state for better UX during wilaya query
- [x] `components/checkout/checkout-form.tsx` → thin UI shell (~130 lines, pure JSX + `useCheckout()`)
- **Status:** complete

---

### Phase 3: Architecture — Remove Duplicate Query in AddToCartButton (CURRENT)
> `AddToCartButton` fires its own `useQuery(api.products.getById)` even though the parent product page already has the product data.

- [ ] Read `components/product/add-to-cart-button.tsx` to understand current implementation
- [ ] Update `AddToCartButtonProps` to accept `variantGroups?: VariantGroup[]` prop
- [ ] Remove `useQuery(api.products.getById, ...)` from the component
- [ ] Update auto-select logic to use `variantGroups` prop
- [ ] Update all parent callers to pass `variantGroups`
- [ ] Replace `disabled={isAdding || !product}` with `disabled={isAdding}`
- **Status:** in_progress

---

### Phase 4: Architecture — Fix Route Group Structure
> `app/order-confirmation/` renders without Header + Footer (outside `(public)/` group).

- [ ] Move `app/order-confirmation/` → `app/(public)/order-confirmation/`
- [ ] Verify route resolves and Header/Footer render
- **Status:** pending

---

### Phase 5: Architecture — Resolve Directory Duplications
- [ ] Audit root `/providers` vs `components/providers/` — consolidate
- [ ] Add explanatory comment to `lib/utils.ts` (cn() coexistence with `lib/utils/`)
- **Status:** pending

---

### Phase 6: Performance — Fix React Keys
> `cart-side-panel.tsx` uses `JSON.stringify(item.variants)` as key.

- [ ] Replace with `getCartItemKey(item)` from `@/lib/types/cart`
- **Status:** pending

---

### Phase 7: State — Lightweight Cart Hook for Header
- [x] `isLoaded` guard on badge (done in Phase 1)
- [ ] Create `hooks/use-cart-count.ts` returning `{ count, isLoaded }`
- [ ] Update Header to use `useCartCount()` instead of full `useCart()`
- **Status:** in_progress

---

### Phase 8: Developer Experience — Cleanup
- [ ] Delete `Clothes test/` directory
- [ ] Audit + delete `hooks/use-toast.ts` if unused
- [ ] Add `eslint-plugin-import` with 6-tier import order rule
- **Status:** pending

---

### Phase 9: Verification & Rules Update
- [ ] Grep: template literals, JSON.stringify keys, direct useQuery in components/
- [ ] Manual test: add to cart → checkout → order confirmation
- [ ] Update `.claude/rules/*.md` if new patterns found
- **Status:** pending

---

## Key Questions
1. Does `app/order-confirmation/` have its own `layout.tsx`? Check before Phase 4.
2. What lives in root `/providers` vs `components/providers/`? Audit before Phase 5.
3. Is `use-toast.ts` imported anywhere? Check before Phase 8.

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is | Imported as `@/lib/utils` everywhere — renaming breaks 50+ files |
| Hook-extracted checkout | Architecture rule: hooks own state+mutations, components own JSX |
| `setDeliveryType()` clears commune+address | Prevents stale Domicile data submitted with Stopdesk orders |
| `getCartItemKey()` for React keys | Already exists, stable ordering |
| Move `order-confirmation` into `(public)/` | All public routes need Header+Footer via route group |
| `useCartCount()` for Header | Header only needs count+isLoaded, full cart state is wasteful |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search returned 0 for template literals | 1 | Manually listed and read each component file |
| `create_or_update_file` failed with stale SHA | 1 | Re-fetched current file SHA then retried |

## Notes
- Each phase committed independently
- After Phase 4 (route move), test `/order-confirmation/[id]` manually before proceeding
- Re-read this file before each phase
