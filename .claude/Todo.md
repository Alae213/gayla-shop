# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 6 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
- [x] All template-literal classNames replaced with `cn()` in 4 files

### Phase 2: Architecture — Extract CheckoutForm God Component ✓
- [x] Created `hooks/use-checkout.ts`, `checkout-form.tsx` → thin UI shell

### Phase 3: Architecture — Remove Duplicate Query in AddToCartButton ✓
- [x] Removed `useQuery`, added `variantGroups` prop

### Phase 4: Architecture — Fix Route Group Structure ✓
- [x] Moved `order-confirmation` into `(public)/` route group

### Phase 5: Architecture — Resolve Directory Duplications ✓
- [x] Deleted `components/providers/convex-client-provider.tsx` (duplicate, unused)
- [x] Kept `providers/convex-provider.tsx` (used by root layout, has error handling)
- [x] Added doc comment to `lib/utils.ts` explaining `@/lib/utils` vs `lib/utils/` namespace
- **Status:** complete

---

### Phase 6: Performance — Fix React Keys (CURRENT)
- [ ] Replace `JSON.stringify(item.variants)` with `getCartItemKey(item)` in cart-side-panel.tsx
- **Status:** in_progress

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
- [ ] Manual test: add to cart → checkout → confirmation (verify Header/Footer render)
- [ ] Update `.claude/rules/*.md` if needed
- **Status:** pending

---

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is | Imported as `@/lib/utils` everywhere |
| Hook-extracted checkout | Hooks own state+mutations, components own JSX |
| `AddToCartButton` no longer fetches | Parent has data — no duplicate queries |
| Move order-confirmation into `(public)/` | All public routes share Header+Footer |
| Keep `providers/convex-provider.tsx` | Used by layout, has error handling; deleted duplicate |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search: 0 results (multiple) | 3 | Manually read files |
| `create_or_update_file` stale SHA | 1 | Re-fetched SHA |

## Notes
- Each phase committed independently
- After Phase 9: manual test `/order-confirmation/[id]`
