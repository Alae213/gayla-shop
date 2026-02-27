# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 8 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
- [x] All template-literal classNames replaced with `cn()` in 4 files

### Phase 2: Architecture — Extract CheckoutForm God Component ✓
- [x] Created `hooks/use-checkout.ts`, thin UI shell

### Phase 3: Architecture — Remove Duplicate Query in AddToCartButton ✓
- [x] Removed `useQuery`, added `variantGroups` prop

### Phase 4: Architecture — Fix Route Group Structure ✓
- [x] Moved `order-confirmation` into `(public)/` route group

### Phase 5: Architecture — Resolve Directory Duplications ✓
- [x] Deleted duplicate provider, added doc comment to `lib/utils.ts`

### Phase 6: Performance — Fix React Keys ✓
- [x] Replaced `JSON.stringify` with `getCartItemKey(item)`

### Phase 7: State — Lightweight Cart Hook for Header ✓
- [x] Created `hooks/use-cart-count.ts` — returns only `{ count, isLoaded }`
- [x] Listens to `storage` event (cross-tab) + `cart-updated` event (same-tab)
- [x] Updated `header.tsx` to use `useCartCount()` instead of full `useCart()`
- [x] Added `window.dispatchEvent(new Event('cart-updated'))` in `use-cart.ts` syncCart + clearCart
- **Status:** complete
- **Note:** Header no longer loads full cart state on every page — only subscribes to count changes

---

### Phase 8: Developer Experience — Cleanup (CURRENT)
- [ ] Delete `Clothes test/` directory
- [ ] Audit + delete `hooks/use-toast.ts` if unused
- [ ] Add `eslint-plugin-import` with 6-tier import order rule
- **Status:** in_progress

---

### Phase 9: Verification & Rules Update
- [ ] Grep audits: template literals, JSON keys, direct useQuery
- [ ] Manual test: add to cart → checkout → confirmation (verify Header/Footer)
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
| Keep `providers/convex-provider.tsx` | Used by layout, has error handling |
| Use `getCartItemKey()` for React keys | Pre-sorted, stable output, no JSON serialization |
| `useCartCount()` for Header | Header only needs count — full cart state wasteful |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search: 0 results (multiple) | 3 | Manually read files |
| `create_or_update_file` stale SHA | 1 | Re-fetched SHA |

## Notes
- Phase 7: `useCartCount` listens to both cross-tab and same-tab updates
- After Phase 9: manual test `/order-confirmation/[id]`
