# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 2 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
> All template-literal `className` strings break Tailwind PurgeCSS. Classes get stripped in production.

- [x] `components/checkout/checkout-form.tsx` — Replace all template-literal classNames with `cn()` calls
- [x] `components/layout/header.tsx` — Replace nav link active/inactive template strings with `cn()`
- [x] `components/products/order-form.tsx` — Replace delivery type buttons + variant selector with `cn()`
- [x] `components/products/product-gallery.tsx` — Replace thumbnail border with `cn()`
- [x] Bonus: added `isLoaded` guard on cart badge in Header (prevents flash of "0" on hydration)
- **Status:** complete

---

### Phase 2: Architecture — Extract CheckoutForm God Component (CURRENT)
> `checkout-form.tsx` contains form state, validation, Convex mutation, delivery cost calc, cart clearing, and navigation — all in one 300-line component.

- [ ] Create `hooks/use-checkout.ts`
  - Move all `useState` calls (customerName, phone, deliveryType, wilayaId, commune, address, errors, isSubmitting)
  - Move `validate()` function
  - Move `handleSubmit()` async function
  - Move `useMutation(api.orders.create)` call
  - Move `useQuery(api.deliveryCosts.getByWilayaId, ...)` call
  - Move `deliveryCost` and `totalAmount` calculations
  - Move `availableCommunes` derived value
  - Return clean interface: `{ form, setForm, errors, isSubmitting, deliveryCost, totalAmount, availableCommunes, submit }`
- [ ] Refactor `components/checkout/checkout-form.tsx` to be a thin UI shell that calls `useCheckout()`
- [ ] Verify checkout still works end-to-end
- **Status:** in_progress

---

### Phase 3: Architecture — Remove Duplicate Query in AddToCartButton
> `AddToCartButton` fires its own `useQuery(api.products.getById)` even though the parent product page already has the product data.

- [ ] Update `AddToCartButtonProps` interface to accept `variantGroups?: VariantGroup[]` prop
- [ ] Remove `useQuery(api.products.getById, { id: productId })` from `components/product/add-to-cart-button.tsx`
- [ ] Update auto-select logic to use `variantGroups` prop instead of fetched `product?.variantGroups`
- [ ] Update all parent components that render `AddToCartButton` to pass `variantGroups`
- [ ] Remove `disabled={isAdding || !product}` — replace with `disabled={isAdding}` (no longer needs product fetch)
- **Status:** pending

---

### Phase 4: Architecture — Fix Route Group Structure
> `app/order-confirmation/` is outside the `(public)` layout group, so it renders without the Header and Footer.

- [ ] Move `app/order-confirmation/` → `app/(public)/order-confirmation/`
- [ ] Verify the route still resolves at `/order-confirmation/[id]`
- [ ] Verify Header and Footer now render on the confirmation page
- **Status:** pending

---

### Phase 5: Architecture — Resolve Directory Duplications
> Two `providers/` locations and a `lib/utils.ts` vs `lib/utils/` namespace collision create import confusion.

- [ ] **Providers:** Audit what lives in `/providers` (root) vs `components/providers/`
  - If root `/providers` contains React context providers → move contents into `components/providers/` and delete root dir
  - Update all imports accordingly
- [ ] **Utils namespace:** Rename `lib/utils.ts` → keep as-is (it exports `cn()` and is imported everywhere as `@/lib/utils`)
  - Add a comment at the top of `lib/utils.ts`: `// cn() helper — imported as @/lib/utils throughout the codebase`
  - Add a note in `architecture.md` explaining the coexistence (already done in Phase 1 of rules update)
- **Status:** pending

---

### Phase 6: Performance — Fix React Keys
> `cart-side-panel.tsx` uses `JSON.stringify(item.variants)` as a React key. This is slow and produces unstable output.

- [ ] Open `components/cart/cart-side-panel.tsx`
- [ ] Replace `` key={`${item.productId}-${JSON.stringify(item.variants)}`} ``
  with `key={getCartItemKey(item)}` (import from `@/lib/types/cart`)
- [ ] Verify `getCartItemKey` is already exported from `lib/types/cart.ts` ✓ (confirmed in review)
- **Status:** pending

---

### Phase 7: State — Document Cart Limitation + Add isLoaded Guard
> Header shows badge count before cart loads from localStorage (flashes "0"). Cart state isolation risk undocumented.

- [x] `components/layout/header.tsx` — `isLoaded` guard added in Phase 1 (done early)
- [ ] Extract `useCartCount()` lightweight hook in `hooks/use-cart-count.ts` that returns only `{ count, isLoaded }`
  to avoid full cart state load in Header
- [ ] Update Header to use `useCartCount()` instead of full `useCart()`
- **Status:** in_progress (isLoaded guard done, hook extraction pending)

---

### Phase 8: Developer Experience — Cleanup
> Leftover junk, redundant files, and inconsistent tooling.

- [ ] Delete `Clothes test/` directory from repo root (space in name, no purpose)
- [ ] Decide: keep `use-toast.ts` OR `sonner` direct calls — delete whichever is unused
  - Audit: `grep -r "use-toast" --include="*.tsx" --include="*.ts"`
  - If no imports found → delete `hooks/use-toast.ts`
- [ ] Add `eslint-plugin-import` to enforce import order from `components.md`
  - Install: `npm install -D eslint-plugin-import`
  - Add rule to `eslint.config.mjs`: `import/order` with the 6-tier order
- **Status:** pending

---

### Phase 9: Verification & Rules Update
> Confirm all fixes are live and update `.claude/rules/` if new patterns were discovered during implementation.

- [ ] Run `grep -r 'className={`' --include="*.tsx"` — expect 0 results
- [ ] Run `grep -r 'JSON.stringify' --include="*.tsx"` — expect 0 results in React keys
- [ ] Run `grep -r 'useQuery' components/ --include="*.tsx"` — verify no leaf component has direct Convex queries
- [ ] Manually test: Add to cart → cart panel opens → checkout → order confirmation (check Header renders)
- [ ] If new violation patterns found during implementation → update relevant `.claude/rules/*.md`
- **Status:** pending

---

## Key Questions

1. Does `app/order-confirmation/` have its own `layout.tsx`? If yes, moving it may conflict with `(public)/layout.tsx`
2. What lives in root `/providers` vs `components/providers/`? Audit before deleting
3. Is `use-toast.ts` imported anywhere, or is it dead code?
4. After extracting `useCheckout()`, does the Convex `useQuery` for delivery costs still re-run reactively on wilaya change?

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is (not renamed to `cn.ts`) | Imported as `@/lib/utils` across the entire codebase — renaming would require 50+ import updates |
| Extract checkout logic to `hooks/use-checkout.ts` | Follows architecture layer rule: hooks own state + mutations, components own JSX only |
| Use `getCartItemKey()` for React keys | Already exists in `lib/types/cart.ts`, designed specifically for this, stable key ordering |
| Move `order-confirmation` into `(public)/` | All public-facing routes must share the Header+Footer layout via the route group |
| `useCartCount()` lightweight hook for Header | Header only needs count + isLoaded — pulling full cart state is wasteful on every page render |
| Added `isLoaded` guard in Phase 1 | Prevented cart badge flash — low-risk change, done early while already editing header.tsx |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search returned 0 results for template literals | 1 | Manually listed component directories and read each file directly |

## Notes

- Work phases in order — Phase 2 (CheckoutForm) is the highest-risk change, do it first after design system
- Each phase is independently deployable — commit after each phase, do not batch all 9 into one PR
- After Phase 4 (route move), test the `/order-confirmation/[id]` URL manually before moving on
- Re-read this file before starting each phase to keep goals fresh
- Update phase status: `pending` → `in_progress` → `complete` as you go
