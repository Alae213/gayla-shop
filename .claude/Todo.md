# Task Plan: Frontend Architecture Cleanup — gayla-shop

## Goal
Fix all 9 critical architectural violations identified in the V2 frontend review so the codebase is
scalable, production-safe, and fully aligned with the rules in `.claude/rules/`.

## Current Phase
Phase 9 (CURRENT)

---

## Phases

### Phase 1: Design System — Fix Tailwind Class Scanning ✓
- [x] Replaced template-literal classNames with `cn()` in 4 files

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
- [x] Created `hooks/use-cart-count.ts`, updated Header

### Phase 8: Developer Experience — Cleanup ✓
- [x] Deleted `hooks/use-toast.ts` (unused — codebase uses `sonner` directly)
- [x] Added `eslint-plugin-import` to `package.json` devDependencies
- [x] Configured 6-tier import order rule in `eslint.config.mjs`
- [ ] ~~Delete `Clothes test/`~~ — skipped (GitHub API limitation for bulk directory deletion)
- **Status:** complete
- **Note:** After `npm install`, run `npm run lint` to see import order violations

---

### Phase 9: Verification & Rules Update (CURRENT)
- [ ] Grep audits: template literals in className, JSON.stringify in keys, direct useQuery in leaf components
- [ ] Manual test: add to cart → checkout → order confirmation (verify Header/Footer render)
- [ ] Update `.claude/rules/*.md` if needed (document new patterns from Phases 1-8)
- **Status:** in_progress

---

## Decisions Made

| Decision | Rationale |
|---|---|
| Keep `lib/utils.ts` as-is | Imported as `@/lib/utils` everywhere |
| Hook-extracted checkout | Hooks own state+mutations, components own JSX |
| `AddToCartButton` no longer fetches | Parent has data — no duplicate queries |
| Move order-confirmation into `(public)/` | All public routes share Header+Footer |
| Keep `providers/convex-provider.tsx` | Used by layout, has error handling |
| Use `getCartItemKey()` for React keys | Pre-sorted, stable, no JSON serialization |
| `useCartCount()` for Header | Header only needs count — full cart wasteful |
| Delete `use-toast.ts` | Codebase uses `sonner` library (`toast.success()`, etc.) |
| Skip `Clothes test/` deletion | Too many files, GitHub API limitation |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| GitHub code search: 0 results (multiple) | 3 | Manually read files |
| `create_or_update_file` stale SHA | 1 | Re-fetched SHA |

## Notes
- Phase 8: ESLint import order configured — requires `npm install` to take effect
- Phase 9: Final verification before closing
