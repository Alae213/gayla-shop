# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 4 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
- [x] All template-literal classNames replaced with `cn()` in 4 files
- **Status:** complete

### Phase 2: Architecture — Extract CheckoutForm God Component ✓
- [x] Created `hooks/use-checkout.ts` — all logic extracted
- [x] `checkout-form.tsx` → thin UI shell (~130 lines)
- **Status:** complete

### Phase 3: Architecture — Remove Duplicate Query in AddToCartButton ✓
- [x] Removed `useQuery(api.products.getById)` from `add-to-cart-button.tsx`
- [x] Added `variantGroups?: VariantGroup[]` prop to component interface
- [x] Updated `order-form.tsx` to pass `variantGroups={product.variantGroups}`
- [x] Changed `disabled={isAdding || !product}` → `disabled={isAdding}`
- [x] Added architecture note explaining parent must pass variantGroups (no duplicate queries)
- **Status:** complete

---

### Phase 4: Architecture — Fix Route Group Structure (CURRENT)
> `app/order-confirmation/` renders without Header + Footer (outside `(public)/` group).

- [ ] Check if `app/order-confirmation/` has its own `layout.tsx` (may conflict with move)
- [ ] Move `app/order-confirmation/` → `app/(public)/order-confirmation/`
- [ ] Verify route resolves at `/order-confirmation/[id]`
- [ ] Verify Header/Footer render on confirmation page
- **Status:** in_progress

---

### Phase 5: Architecture — Resolve Directory Duplications
- [ ] Audit root `/providers` vs `components/providers/` — consolidate
- [ ] Add comment to `lib/utils.ts` explaining cn() + `lib/utils/` coexistence
- **Status:** pending

---

### Phase 6: Performance — Fix React Keys
- [ ] Replace `JSON.stringify(item.variants)` with `getCartItemKey(item)` in cart-side-panel.tsx
- **Status:** pending

---

### Phase 7: State — Lightweight Cart Hook for Header
- [x] `isLoaded` guard (done Phase 1)
- [ ] Create `hooks/use-cart-count.ts`
- [ ] Update Header to use `useCartCount()`
- **Status:** in_progress

---

### Phase 8: Developer Experience — Cleanup
- [ ] Delete `Clothes test/` directory
- [ ] Audit + delete `hooks/use-toast.ts` if unused
- [ ] Add `eslint-plugin-import` with 6-tier import order
- **Status:** pending

---

### Phase 9: Verification & Rules Update
- [ ] Grep audits: template literals, JSON keys, direct useQuery
- [ ] Manual test: add to cart → checkout → confirmation
- [ ] Update `.claude/rules/*.md` if needed
- **Status:** pending

---

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is | Imported as `@/lib/utils` everywhere — renaming breaks 50+ files |
| Hook-extracted checkout | Architecture rule: hooks own state+mutations, components own JSX |
| `AddToCartButton` no longer fetches product | Parent already has product data — no duplicate queries |
| Pass `variantGroups` as prop | Explicit data flow, testable, no hidden dependencies |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search returned 0 for template literals | 1 | Manually listed and read each component file |
| `create_or_update_file` stale SHA | 1 | Re-fetched current file SHA then retried |
| GitHub code search returned 0 for AddToCartButton usage | 1 | Checked known callers (order-form.tsx) directly |

## Notes
- Each phase committed independently
- After Phase 4, test `/order-confirmation/[id]` manually
