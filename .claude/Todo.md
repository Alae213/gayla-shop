# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 5 (CURRENT)

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
- [x] Removed `useQuery` from `add-to-cart-button.tsx`
- [x] Added `variantGroups` prop, updated caller
- **Status:** complete

### Phase 4: Architecture — Fix Route Group Structure ✓
- [x] Moved `app/order-confirmation/[orderId]/` → `app/(public)/order-confirmation/[orderId]/`
- [x] Confirmed no `layout.tsx` conflict (only `page.tsx` existed)
- [x] Deleted old location
- **Status:** complete
- **Note:** Route now resolves at `/order-confirmation/[id]` with Header + Footer from `(public)/layout.tsx`

---

### Phase 5: Architecture — Resolve Directory Duplications (CURRENT)
- [ ] Audit root `/providers` vs `components/providers/` — consolidate if needed
- [ ] Add comment to `lib/utils.ts` explaining cn() + `lib/utils/` coexistence
- **Status:** in_progress

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
- [ ] Manual test: add to cart → checkout → confirmation (verify Header/Footer render)
- [ ] Update `.claude/rules/*.md` if needed
- **Status:** pending

---

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is | Imported as `@/lib/utils` everywhere — renaming breaks 50+ files |
| Hook-extracted checkout | Architecture rule: hooks own state+mutations, components own JSX |
| `AddToCartButton` no longer fetches | Parent has product data — no duplicate queries |
| Move order-confirmation into `(public)/` | All public routes must share Header+Footer via route group |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search: 0 results (template literals) | 1 | Manually read files |
| `create_or_update_file` stale SHA | 1 | Re-fetched SHA |
| GitHub code search: 0 results (AddToCartButton) | 1 | Checked known callers directly |

## Notes
- Phase 4 complete: `/order-confirmation/[id]` now has Header+Footer
- Test manually after Phase 9
