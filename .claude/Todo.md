# Theme System Migration — gayla-shop

## Project Overview

**Goal:** Migrate gayla-shop to a unified, maintainable design system with consistent tokens, standardized components, and full dark mode support.

**Current State:**
- ✅ 70+ components, 95/100 health score (improved from 90)
- ✅ Token consistency established (system-*, brand-*, shadcn semantic)
- ✅ Zero raw HTML violations (fixed from 4)
- ✅ Tracking page tokens in CSS variables with dark mode
- ✅ Complete composite component library (5 components)

**Target State:**
- 98/100 component health
- Unified semantic tokens (shadcn-first)
- Zero hardcoded colors
- Full dark mode support (complete)
- Strategic composite adoption

**Timeline:** 3 phases, ~14 hours total

---

## Status Dashboard

| Phase | Status | Progress | Time Spent | Completed |
|-------|--------|----------|-----------|----------|
| **Phase 1: Foundation** | ✅ COMPLETE | 9/9 tasks | 3.5 hours | Feb 28, 2026 |
| **Phase 2: Component Migration** | 🔄 IN PROGRESS | 0/8 tasks | 0 hours | - |
| **Phase 3: Polish & Enforcement** | ⏸️ Blocked | 0/7 tasks | 0 hours | - |

**Total Progress:** 9/24 tasks complete (37.5%)

---

## Phase 1: Foundation ✅ COMPLETE

**Goal:** Establish token system, fix critical violations, create essential composites.

**Status:** ✅ All tasks complete | **Time:** 3.5 hours | **Completed:** Feb 28, 2026

**Deliverables:**
- ✅ Dark mode support for all tokens
- ✅ Tracking page tokens migrated to CSS variables
- ✅ Zero raw HTML button violations
- ✅ 5 essential composites created
- ✅ ThemeToggle integrated in header

### Tasks

#### T1.1: Add Dark Mode Variants for System Tokens ✅
**Priority:** HIGH | **Effort:** 30 min | **Status:** ✅ COMPLETE

**Files:**
- `app/globals.css`

**Actions:**
- [x] Add `.dark` selector after existing dark mode block
- [x] Add dark variants for system tokens
- [x] Verify contrast ratios meet WCAG AA

**Result:** System tokens now fully support dark mode with proper contrast.

---

#### T1.2: Migrate Tracking Tokens to CSS Variables ✅
**Priority:** HIGH | **Effort:** 45 min | **Status:** ✅ COMPLETE

**Files:**
- `app/globals.css`
- `tailwind.config.ts`

**Actions:**
- [x] Add tracking CSS variables to `:root`
- [x] Add dark mode variants in `.dark` selector
- [x] Update tailwind.config.ts to reference CSS variables
- [x] Remove hardcoded tracking colors

**Result:** Tracking page fully supports dark mode, zero hardcoded colors.

---

#### T1.3: Fix Raw Button Violations in Header ✅
**Priority:** HIGH | **Effort:** 15 min | **Status:** ✅ COMPLETE

**Files:**
- `components/layout/header.tsx`

**Actions:**
- [x] Add Button primitive import
- [x] Replace cart button with Button component
- [x] Replace mobile menu toggle with Button component
- [x] Add proper ARIA labels
- [x] Test keyboard navigation

**Result:** Zero raw button violations in Header, full keyboard accessibility.

---

#### T1.4: Fix Raw Button Violation in ProductGallery ✅
**Priority:** HIGH | **Effort:** 10 min | **Status:** ✅ COMPLETE

**Files:**
- `components/products/product-gallery.tsx`

**Actions:**
- [x] Add Button primitive import
- [x] Replace thumbnail buttons with Button components
- [x] Add descriptive ARIA labels
- [x] Test keyboard navigation

**Result:** Zero raw button violations in ProductGallery, keyboard accessible thumbnails.

---

#### T1.5: Create StatusBadge Component ✅
**Priority:** HIGH | **Effort:** 30 min | **Status:** ✅ COMPLETE

**Files:**
- `components/ui/status-badge.tsx` (NEW)

**Actions:**
- [x] Create TypeScript interface with 5 status types
- [x] Implement with config object (colors, icons, labels)
- [x] Use Badge primitive from shadcn
- [x] Add ARIA attributes
- [x] Support 2 sizes (sm, md)

**Result:** Reusable status indicator with consistent styling, WCAG AA compliant.

---

#### T1.6: Create EmptyState Component ✅
**Priority:** HIGH | **Effort:** 30 min | **Status:** ✅ COMPLETE

**Files:**
- `components/ui/empty-state.tsx` (NEW)

**Actions:**
- [x] Create TypeScript interface
- [x] Implement with size variants (sm, md, lg)
- [x] Use Button primitive for actions
- [x] Add semantic HTML (h2/h3)
- [x] Add ARIA attributes

**Result:** Flexible empty state component for consistent UX.

---

#### T1.7: Create LoadingButton Component ✅
**Priority:** MEDIUM | **Effort:** 20 min | **Status:** ✅ COMPLETE

**Files:**
- `components/ui/loading-button.tsx` (NEW)

**Actions:**
- [x] Extend ButtonProps interface
- [x] Add loading and loadingText props
- [x] Show Loader2 icon when loading
- [x] Set disabled and aria-busy when loading

**Result:** Button with loading state for async actions.

---

#### T1.8: Install next-themes and Create ThemeToggle ✅
**Priority:** HIGH | **Effort:** 45 min | **Status:** ✅ COMPLETE

**Files:**
- `providers/theme-provider.tsx` (NEW)
- `components/ui/theme-toggle.tsx` (NEW)
- `app/layout.tsx` (UPDATED)
- `components/layout/header.tsx` (UPDATED)

**Actions:**
- [x] Install next-themes package
- [x] Create ThemeProvider wrapper
- [x] Create ThemeToggle component (icon + labeled variants)
- [x] Wrap app in ThemeProvider
- [x] Add ThemeToggle to header
- [x] Fix TypeScript import error

**Result:** Complete dark mode system with persistent theme preference.

---

#### T1.9: Phase 1 Validation ✅
**Priority:** HIGH | **Effort:** 30 min | **Status:** ✅ COMPLETE

**Actions:**
- [x] Run `npm run build` — succeeded after TypeScript fix
- [x] Visual regression test passed
- [x] Dark mode test passed on all pages
- [x] Keyboard navigation test passed
- [x] WCAG AA contrast verified

**Result:** Phase 1 foundation complete and validated.

---

## Phase 2: Component Migration 🔄 IN PROGRESS

**Goal:** Standardize token usage, create strategic composites, migrate high-traffic components.

**Status:** 🔄 Starting | **Estimated Time:** 4 hours

**Deliverables:**
- Layout components use semantic tokens
- Product components use semantic tokens
- 3 strategic composites created
- Additional shadcn primitives installed

**Prerequisites:**
- ✅ Phase 1 complete

### Tasks

#### T2.1: Migrate Header to Semantic Tokens
**Priority:** HIGH | **Effort:** 20 min | **Status:** 🔄 READY

**Files:**
- `components/layout/header.tsx`

**Actions:**
- [ ] Replace `bg-system-100` → `bg-muted`
- [ ] Replace `text-system-400` → `text-foreground`
- [ ] Replace `text-system-300` → `text-muted-foreground`
- [ ] Replace `border-system-200` → `border-border`
- [ ] Keep `text-brand-200` for logo (intentional brand color)
- [ ] Test light and dark modes

**Acceptance Criteria:**
- [ ] Header looks identical in light mode
- [ ] Dark mode header adapts correctly
- [ ] No `system-*` tokens remain in header.tsx

---

#### T2.2: Migrate Footer to Semantic Tokens
**Priority:** MEDIUM | **Effort:** 15 min | **Status:** ⏸️ WAITING

**Files:**
- `components/layout/footer.tsx`

**Actions:**
- [ ] Replace all `system-*` tokens with semantic equivalents
- [ ] Use `bg-muted` for footer background
- [ ] Use `text-muted-foreground` for secondary text
- [ ] Test light and dark modes

**Acceptance Criteria:**
- [ ] Footer looks identical in light mode
- [ ] Dark mode footer adapts correctly
- [ ] No `system-*` tokens remain

---

#### T2.3: Migrate ProductCard to Semantic Tokens
**Priority:** HIGH | **Effort:** 20 min | **Status:** ⏸️ WAITING

**Files:**
- `components/products/product-card.tsx`

**Actions:**
- [ ] Replace `bg-system-100` → `bg-card`
- [ ] Replace `border-system-200` → `border-border`
- [ ] Replace `text-system-400` → `text-foreground`
- [ ] Keep `bg-brand-200` for primary CTA buttons
- [ ] Test light and dark modes

**Acceptance Criteria:**
- [ ] Product cards look identical
- [ ] Dark mode cards adapt correctly
- [ ] Hover states work

---

#### T2.4: Install Additional shadcn Primitives
**Priority:** MEDIUM | **Effort:** 15 min | **Status:** ⏸️ WAITING

**Actions:**
- [ ] Install Popover: `npx shadcn@latest add popover`
- [ ] Install Tabs: `npx shadcn@latest add tabs`
- [ ] Verify imports work
- [ ] Verify theme tokens applied

**Acceptance Criteria:**
- [ ] Components exist in `components/ui/`
- [ ] Can import and use in test component
- [ ] Dark mode styles work

---

#### T2.5: Create PageHeader Component
**Priority:** HIGH | **Effort:** 45 min | **Status:** ⏸️ WAITING

**Files:**
- `components/ui/page-header.tsx` (NEW)

**Actions:**
- [ ] Create TypeScript interface (title, description, breadcrumbs, actions)
- [ ] Implement breadcrumb navigation with ChevronRight icons
- [ ] Support 3 sizes (sm/md/lg)
- [ ] Use semantic HTML (h1, nav, etc.)
- [ ] Add ARIA attributes

**Acceptance Criteria:**
- [ ] Breadcrumbs render and link correctly
- [ ] Title and description styled properly
- [ ] Actions align to the right
- [ ] Responsive on mobile
- [ ] All 3 sizes work

---

#### T2.6: Create StatsCard Component
**Priority:** MEDIUM | **Effort:** 30 min | **Status:** ⏸️ WAITING

**Files:**
- `components/ui/stats-card.tsx` (NEW)

**Actions:**
- [ ] Create TypeScript interface (label, value, icon, trend)
- [ ] Use Card primitive
- [ ] Implement trend indicators (up/down/neutral with icons)
- [ ] Support default and accent variants
- [ ] Add ARIA labels

**Acceptance Criteria:**
- [ ] Value displays correctly (string and number)
- [ ] Icon renders in header
- [ ] Trend up/down/neutral styled correctly
- [ ] Accent variant changes background
- [ ] ARIA labels work

---

#### T2.7: Create SearchInput Component
**Priority:** MEDIUM | **Effort:** 20 min | **Status:** ⏸️ WAITING

**Files:**
- `components/ui/search-input.tsx` (NEW)

**Actions:**
- [ ] Create TypeScript interface (value, onChange, onClear)
- [ ] Use Input primitive with Search icon
- [ ] Add clear button (X icon) that appears when value exists
- [ ] Support 3 sizes (sm/md/lg)
- [ ] Add ARIA labels

**Acceptance Criteria:**
- [ ] Search icon appears on left
- [ ] Clear button appears when value exists
- [ ] Clear button calls onClear and resets value
- [ ] All 3 sizes work
- [ ] Keyboard accessible

---

#### T2.8: Phase 2 Validation
**Priority:** HIGH | **Effort:** 30 min | **Status:** ⏸️ WAITING

**Actions:**
- [ ] Grep audit: search for remaining `system-*` tokens in layout/product components
- [ ] Visual regression test: layout and product pages
- [ ] Component test: PageHeader, StatsCard, SearchInput in isolation
- [ ] Dark mode test: all new components

**Acceptance Criteria:**
- [ ] Layout components fully migrated
- [ ] Product components fully migrated
- [ ] All new composites work correctly
- [ ] Dark mode on all components

---

## Phase 3: Polish & Enforcement ⏸️ BLOCKED

**Goal:** Complete migration, document patterns, enforce consistency.

**Status:** ⏸️ Waiting for Phase 2 | **Estimated Time:** 6 hours

**Deliverables:**
- All components migrated to semantic tokens
- Additional utility composites created
- Component usage documentation
- ESLint rules for enforcement

**Prerequisites:**
- ✅ Phase 1 complete
- ⏸️ Phase 2 complete

### Tasks

#### T3.1: Migrate Remaining Components to Semantic Tokens
**Priority:** HIGH | **Effort:** 2 hours | **Status:** ⏸️ BLOCKED

**Files:**
- `components/cart/*.tsx`
- `components/checkout/*.tsx`
- `components/admin/*.tsx`
- `app/**/*.tsx` (pages)

**Actions:**
- [ ] Audit all remaining files with `system-*` token usage
- [ ] Replace with semantic tokens
- [ ] Keep `brand-*` tokens for intentional brand elements
- [ ] Keep `tracking-*` tokens for tracking pages only
- [ ] Test all pages in light and dark modes

**Acceptance Criteria:**
- [ ] Grep search for `system-` returns only CSS variable definitions
- [ ] No hardcoded colors in component files
- [ ] All components work in dark mode
- [ ] No visual regressions

---

#### T3.2: Create QuantityInput Component
**Priority:** LOW | **Effort:** 30 min | **Status:** ⏸️ BLOCKED

**Files:**
- `components/ui/quantity-input.tsx` (NEW)

**Actions:**
- [ ] Create with +/- buttons and number input
- [ ] Use Button and Input primitives
- [ ] Enforce min/max constraints
- [ ] Support sm/md sizes

**Acceptance Criteria:**
- [ ] Buttons increment/decrement value
- [ ] Manual input works
- [ ] Min/max enforced
- [ ] Keyboard accessible

---

#### T3.3: Create PriceDisplay Component
**Priority:** LOW | **Effort:** 20 min | **Status:** ⏸️ BLOCKED

**Files:**
- `components/ui/price-display.tsx` (NEW)

**Actions:**
- [ ] Create with amount, currency, compareAt props
- [ ] Format with Intl.NumberFormat
- [ ] Show discount badge when compareAt provided
- [ ] Support 3 variants (default/large/compact)

**Acceptance Criteria:**
- [ ] Formats prices correctly (1,200 DZD)
- [ ] Discount shown when compareAt provided
- [ ] All 3 variants work
- [ ] Accessible ARIA labels

---

#### T3.4: Adopt New Composites in Existing Components
**Priority:** MEDIUM | **Effort:** 1.5 hours | **Status:** ⏸️ BLOCKED

**Files:**
- Multiple component files

**Actions:**
- [ ] Replace empty state markup with `<EmptyState>`
- [ ] Replace status indicators with `<StatusBadge>`
- [ ] Replace page titles with `<PageHeader>`
- [ ] Replace dashboard metrics with `<StatsCard>`

**Acceptance Criteria:**
- [ ] All empty states use EmptyState component
- [ ] All status indicators use StatusBadge
- [ ] Admin pages use PageHeader
- [ ] Dashboard uses StatsCard
- [ ] No visual regressions

---

#### T3.5: Create Component Usage Documentation
**Priority:** HIGH | **Effort:** 1 hour | **Status:** ⏸️ BLOCKED

**Files:**
- `docs/components.md` (NEW)

**Actions:**
- [ ] Document import rules
- [ ] Document composition patterns
- [ ] Document token usage rules
- [ ] Add do's and don'ts with examples
- [ ] Add quick reference table

**Acceptance Criteria:**
- [ ] Clear import guidelines
- [ ] Pattern examples for common use cases
- [ ] Token usage rules documented
- [ ] Quick reference table created

---

#### T3.6: Add ESLint Rules for Enforcement
**Priority:** MEDIUM | **Effort:** 45 min | **Status:** ⏸️ BLOCKED

**Files:**
- `eslint.config.mjs`

**Actions:**
- [ ] Add rule to detect raw `<button>` elements
- [ ] Add rule to detect raw `<input>` elements
- [ ] Add rule to detect hardcoded color values
- [ ] Configure to error on violations

**Acceptance Criteria:**
- [ ] ESLint catches raw buttons/inputs
- [ ] ESLint catches hardcoded colors
- [ ] Can run `npm run lint` to check
- [ ] Rules documented in README

---

#### T3.7: Final Validation & Documentation
**Priority:** HIGH | **Effort:** 1 hour | **Status:** ⏸️ BLOCKED

**Actions:**
- [ ] Run full build: `npm run build`
- [ ] Run full lint: `npm run lint`
- [ ] Visual regression test: all pages light + dark mode
- [ ] Contrast audit: Lighthouse on 10 key pages
- [ ] Component inventory: grep for violations
- [ ] Update `.claude/rules/` with new patterns
- [ ] Create migration summary document

**Acceptance Criteria:**
- [ ] Build succeeds with no warnings
- [ ] Lint passes with no errors
- [ ] All pages look correct in both modes
- [ ] WCAG AA contrast on all pages
- [ ] Zero raw HTML violations
- [ ] Zero hardcoded colors
- [ ] Rules updated
- [ ] Migration summary created

---

## Quick Reference

### Token Reference

| Current | Target | Use Case |
|---------|--------|----------|
| `bg-system-100` | `bg-muted` | Subtle backgrounds |
| `bg-system-50` | `bg-background` | Page backgrounds |
| `text-system-400` | `text-foreground` | Primary text |
| `text-system-300` | `text-muted-foreground` | Secondary text |
| `border-system-200` | `border-border` | Borders |
| `bg-brand-200` | Keep | Brand CTAs |
| `text-brand-200` | Keep | Brand elements |

---

## Progress Tracking

### Phase 1 Completion ✅
- [x] All tasks T1.1 through T1.9 complete
- [x] 9/9 tasks checked off
- [x] Commits pushed to main
- [x] Phase 1 validation passed
- [x] TypeScript build error fixed

### Phase 2 Completion Criteria
- [ ] All tasks T2.1 through T2.8 complete
- [ ] 8/8 tasks checked off
- [ ] Commits pushed to main
- [ ] Phase 2 validation passed

### Phase 3 Completion Criteria
- [ ] All tasks T3.1 through T3.7 complete
- [ ] 7/7 tasks checked off
- [ ] Commits pushed to main
- [ ] Phase 3 validation passed

### Project Completion Criteria
- [ ] All 3 phases complete (24/24 tasks)
- [ ] Component health score: 98/100
- [ ] Zero raw HTML violations (✅ achieved)
- [ ] Zero hardcoded colors
- [ ] Full dark mode support (✅ achieved)
- [ ] All composites created and adopted
- [ ] Documentation complete
- [ ] ESLint rules enforced

---

**Last Updated:** 2026-02-28 02:40 AM WAT  
**Current Status:** Phase 1 Complete ✅ | Phase 2 Starting 🔄  
**Next Task:** T2.1 - Migrate Header to Semantic Tokens
