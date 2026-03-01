# Theme System Migration — gayla-shop

## Project Overview

**Goal:** Migrate gayla-shop to a unified, maintainable design system with consistent tokens, standardized components, and full dark mode support.

**Current State:**
- ✅ 70+ components, 90/100 health score
- ⚠️ Token inconsistency (mix of `system-*`, `brand-*`, shadcn semantic)
- ⚠️ 4 raw HTML violations (buttons in Header, ProductGallery)
- ⚠️ Tracking page tokens hardcoded (no dark mode support)
- ⚠️ Missing key composites (EmptyState, StatusBadge, ThemeToggle)

**Target State:**
- 98/100 component health
- Unified semantic tokens (shadcn-first)
- Zero raw HTML violations
- Full dark mode support
- Complete composite component library

**Timeline:** 3 phases, ~14 hours total (spread across multiple small PRs)

---

## Status Dashboard

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| **Phase 1: Foundation** | 🔄 Not Started | 0/9 tasks | 4 hours |
| **Phase 2: Component Migration** | ⏸️ Blocked | 0/8 tasks | 4 hours |
| **Phase 3: Polish & Enforcement** | ⏸️ Blocked | 0/7 tasks | 6 hours |

**Total Progress:** 0/24 tasks complete (0%)

---

## Phase 1: Foundation (4 hours)

**Goal:** Establish token system, fix critical violations, create essential composites.

**Deliverables:**
- ✅ Dark mode support for all tokens
- ✅ Tracking page tokens migrated to CSS variables
- ✅ Zero raw HTML button violations
- ✅ 5 essential composites created

### Tasks

#### T1.1: Add Dark Mode Variants for System Tokens
**Priority:** HIGH | **Effort:** 30 min | **PR:** `feat/dark-mode-system-tokens`

**Files:**
- `app/globals.css`

**Actions:**
- [ ] Add `.dark` selector after line 167 (after existing `.dark` block)
- [ ] Add dark variants for system tokens:
  ```css
  .dark {
    --system-50: 42 42 42;      /* #2a2a2a */
    --system-100: 26 26 26;     /* #1a1a1a */
    --system-200: 58 58 58;     /* #3a3a3a */
    --system-300: 176 176 176;  /* #b0b0b0 (lighter for dark bg) */
    --system-400: 224 224 224;  /* #e0e0e0 (lighter for dark bg) */
  }
  ```

**Acceptance Criteria:**
- [ ] Dark mode class toggles system token colors
- [ ] Text contrast meets WCAG AA in both modes
- [ ] No visual regressions in light mode

**Testing:**
```bash
# Manual test
# Add <html class="dark"> in browser DevTools
# Verify: backgrounds darker, text lighter, readable contrast
```

---

#### T1.2: Migrate Tracking Tokens to CSS Variables
**Priority:** HIGH | **Effort:** 45 min | **PR:** `feat/tracking-css-variables`

**Files:**
- `app/globals.css` (add vars)
- `tailwind.config.ts` (update references)

**Actions:**
- [ ] Add tracking tokens to `:root` in `globals.css`:
  ```css
  /* Tracking colors */
  --tracking-bg-primary: 255 255 255;
  --tracking-bg-secondary: 245 245 245;
  --tracking-bg-card: 247 247 247;
  --tracking-text-primary: 58 58 58;
  --tracking-text-secondary: 117 117 117;
  --tracking-border: 236 236 236;
  --tracking-interactive: 58 58 58;
  --tracking-interactive-hover: 26 26 26;
  
  /* Tracking shadows */
  --shadow-tracking-card: 0px 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-tracking-elevated: 0px 8px 32px rgba(0, 0, 0, 0.08);
  
  /* Tracking radii */
  --radius-tracking-card: 24px;
  --radius-tracking-button: 9999px;
  --radius-tracking-input: 12px;
  ```

- [ ] Add dark variants in `.dark` selector:
  ```css
  .dark {
    --tracking-bg-primary: 26 26 26;
    --tracking-bg-secondary: 34 34 34;
    --tracking-bg-card: 42 42 42;
    --tracking-text-primary: 224 224 224;
    --tracking-text-secondary: 176 176 176;
    --tracking-border: 58 58 58;
    --tracking-interactive: 224 224 224;
    --tracking-interactive-hover: 255 255 255;
    --shadow-tracking-card: 0px 4px 16px rgba(0, 0, 0, 0.3);
    --shadow-tracking-elevated: 0px 8px 32px rgba(0, 0, 0, 0.4);
  }
  ```

- [ ] Update `tailwind.config.ts` tracking section (~line 44):
  ```typescript
  tracking: {
    bg: {
      primary: "hsl(var(--tracking-bg-primary) / <alpha-value>)",
      secondary: "hsl(var(--tracking-bg-secondary) / <alpha-value>)",
      card: "hsl(var(--tracking-bg-card) / <alpha-value>)",
    },
    text: {
      primary: "hsl(var(--tracking-text-primary) / <alpha-value>)",
      secondary: "hsl(var(--tracking-text-secondary) / <alpha-value>)",
    },
    border: "hsl(var(--tracking-border) / <alpha-value>)",
    interactive: {
      DEFAULT: "hsl(var(--tracking-interactive) / <alpha-value>)",
      hover: "hsl(var(--tracking-interactive-hover) / <alpha-value>)",
    },
  },
  boxShadow: {
    "tracking-card": "var(--shadow-tracking-card)",
    "tracking-elevated": "var(--shadow-tracking-elevated)",
  },
  borderRadius: {
    "tracking-card": "var(--radius-tracking-card)",
    "tracking-button": "var(--radius-tracking-button)",
    "tracking-input": "var(--radius-tracking-input)",
  },
  ```

**Acceptance Criteria:**
- [ ] `npm run build` succeeds
- [ ] Tracking page renders identically in light mode
- [ ] Dark mode toggle changes tracking page colors
- [ ] No hardcoded hex values in tailwind.config.ts tracking section

---

#### T1.3: Fix Raw Button Violations in Header
**Priority:** HIGH | **Effort:** 15 min | **PR:** `fix/header-button-primitives`

**Files:**
- `components/layout/header.tsx`

**Actions:**
- [ ] Add import: `import { Button } from "@/components/ui/button";`
- [ ] Replace cart button (~line 60):
  ```tsx
  // Before:
  <button onClick={() => setCartOpen(true)} ...>
  
  // After:
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setCartOpen(true)}
    aria-label="Cart"
    className="relative text-system-400"
  >
    <ShoppingCart className="h-5 w-5" />
    {/* ... badge ... */}
  </Button>
  ```

- [ ] Replace mobile menu toggle (~line 67):
  ```tsx
  // Before:
  <button onClick={() => setMobileOpen((o) => !o)} ...>
  
  // After:
  <Button
    variant="ghost"
    size="icon"
    aria-label={mobileOpen ? "Close menu" : "Open menu"}
    onClick={() => setMobileOpen((o) => !o)}
    className="md:hidden text-system-400"
  >
    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  </Button>
  ```

**Acceptance Criteria:**
- [ ] Header looks identical (visual regression test)
- [ ] Cart button opens cart side panel
- [ ] Mobile menu toggle works
- [ ] Buttons focusable with Tab key
- [ ] Enter/Space triggers click

**Testing:**
```bash
npm run dev
# Test: click cart icon → side panel opens
# Test: click mobile menu (resize to mobile) → menu opens
# Test: Tab to buttons → visible focus ring
# Test: Enter/Space on focused button → triggers action
```

---

#### T1.4: Fix Raw Button Violation in ProductGallery
**Priority:** HIGH | **Effort:** 10 min | **PR:** `fix/product-gallery-button-primitive`

**Files:**
- `components/products/product-gallery.tsx`

**Actions:**
- [ ] Add import: `import { Button } from "@/components/ui/button";`
- [ ] Replace thumbnail button (~line 47):
  ```tsx
  // Before:
  <button
    key={image.storageId}
    onClick={() => setSelectedImageIndex(index)}
    className={cn(...)}
  >
  
  // After:
  <Button
    variant="ghost"
    key={image.storageId}
    onClick={() => setSelectedImageIndex(index)}
    className={cn(
      "aspect-square relative overflow-hidden rounded-lg border-2 transition-all p-0",
      selectedImageIndex === index
        ? "border-brand-200 scale-105"
        : "border-system-200 hover:border-system-300"
    )}
    aria-label={`View image ${index + 1}`}
  >
    <Image ... />
  </Button>
  ```

**Acceptance Criteria:**
- [ ] Thumbnail selection works
- [ ] Selected thumbnail shows brand-200 border
- [ ] Hover state visible on non-selected thumbnails
- [ ] Keyboard navigation works (Tab + Enter)

---

#### T1.5: Create StatusBadge Component
**Priority:** HIGH | **Effort:** 30 min | **PR:** `feat/status-badge-component`

**Files:**
- `components/ui/status-badge.tsx` (create new)

**Actions:**
- [ ] Create file with TypeScript interface:
  ```typescript
  export type StatusType = "pending" | "success" | "error" | "warning" | "info";
  
  interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    icon?: boolean;
    size?: "sm" | "md";
    className?: string;
  }
  ```

- [ ] Implement component with config object mapping status to:
  - className (e.g., `bg-success-100 text-success-200`)
  - icon (Lucide icon component)
  - defaultLabel (e.g., "Success")

- [ ] Use `Badge` primitive from shadcn
- [ ] Add `role="status"` and `aria-live="polite"`

**Acceptance Criteria:**
- [ ] All 5 status types render correctly
- [ ] With/without icon prop works
- [ ] Custom labels override defaults
- [ ] Color contrast meets WCAG AA
- [ ] TypeScript exports work

**Testing:**
```tsx
// In Storybook or test page
<StatusBadge status="success" />
<StatusBadge status="error" icon label="Payment Failed" />
<StatusBadge status="pending" icon />
```

---

#### T1.6: Create EmptyState Component
**Priority:** HIGH | **Effort:** 30 min | **PR:** `feat/empty-state-component`

**Files:**
- `components/ui/empty-state.tsx` (create new)

**Actions:**
- [ ] Create file with TypeScript interface:
  ```typescript
  interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost";
    };
    size?: "sm" | "md" | "lg";
    className?: string;
  }
  ```

- [ ] Implement with size config object (sm/md/lg)
- [ ] Use `Button` primitive for action
- [ ] Proper heading hierarchy (h2/h3)

**Acceptance Criteria:**
- [ ] All 3 sizes render correctly
- [ ] With/without icon/description/action
- [ ] Action button triggers onClick
- [ ] Responsive on mobile
- [ ] Title uses semantic heading tag

---

#### T1.7: Create LoadingButton Component
**Priority:** MEDIUM | **Effort:** 20 min | **PR:** `feat/loading-button-component`

**Files:**
- `components/ui/loading-button.tsx` (create new)

**Actions:**
- [ ] Extend `ButtonProps` interface
- [ ] Add `loading?: boolean` and `loadingText?: string` props
- [ ] Show `Loader2` icon when loading
- [ ] Set `disabled` and `aria-busy` when loading

**Acceptance Criteria:**
- [ ] Shows spinner when loading
- [ ] Disabled state works
- [ ] loadingText overrides children
- [ ] Works with all Button variants

---

#### T1.8: Install next-themes and Create ThemeToggle
**Priority:** HIGH | **Effort:** 45 min | **PR:** `feat/theme-toggle-dark-mode`

**Files:**
- `package.json` (add next-themes)
- `app/layout.tsx` (add ThemeProvider)
- `components/ui/theme-toggle.tsx` (create new)

**Actions:**
- [ ] Install: `npm install next-themes`
- [ ] Wrap app in ThemeProvider:
  ```tsx
  import { ThemeProvider } from "next-themes";
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] Create ThemeToggle component with icon and labeled variants
- [ ] Use `useTheme()` hook from next-themes
- [ ] Add to header

**Acceptance Criteria:**
- [ ] Theme toggles between light/dark
- [ ] Persists across page reloads
- [ ] Icons animate smoothly
- [ ] Both variants work (icon, labeled)

---

#### T1.9: Phase 1 Validation
**Priority:** HIGH | **Effort:** 30 min

**Actions:**
- [ ] Run `npm run build` — should succeed
- [ ] Visual regression test: compare before/after screenshots
- [ ] Dark mode test: toggle on all major pages
- [ ] Keyboard navigation test: Tab through all buttons
- [ ] Contrast check: run Lighthouse accessibility audit

**Acceptance Criteria:**
- [ ] Build succeeds with no errors
- [ ] No visual regressions in light mode
- [ ] Dark mode works on all pages
- [ ] All buttons keyboard-accessible
- [ ] WCAG AA contrast met

---

## Phase 2: Component Migration (4 hours)

**Goal:** Standardize token usage, create strategic composites, migrate high-traffic components.

**Deliverables:**
- ✅ Layout components use semantic tokens
- ✅ Product components use semantic tokens
- ✅ 3 strategic composites created
- ✅ Additional shadcn primitives installed

**Prerequisites:**
- ✅ Phase 1 complete

### Tasks

#### T2.1: Migrate Header to Semantic Tokens
**Priority:** HIGH | **Effort:** 20 min | **PR:** `refactor/header-semantic-tokens`

**Files:**
- `components/layout/header.tsx`

**Actions:**
- [ ] Replace `bg-system-100` → `bg-muted`
- [ ] Replace `text-system-400` → `text-foreground`
- [ ] Replace `text-system-300` → `text-muted-foreground`
- [ ] Replace `border-system-200` → `border-border`
- [ ] Keep `text-brand-200` for logo (intentional brand color)

**Acceptance Criteria:**
- [ ] Header looks identical in light mode
- [ ] Dark mode header adapts correctly
- [ ] No `system-*` tokens remain in header.tsx

---

#### T2.2: Migrate Footer to Semantic Tokens
**Priority:** MEDIUM | **Effort:** 15 min | **PR:** `refactor/footer-semantic-tokens`

**Files:**
- `components/layout/footer.tsx`

**Actions:**
- [ ] Replace all `system-*` tokens with semantic equivalents
- [ ] Use `bg-muted` for footer background
- [ ] Use `text-muted-foreground` for secondary text

**Acceptance Criteria:**
- [ ] Footer looks identical in light mode
- [ ] Dark mode footer adapts correctly
- [ ] No `system-*` tokens remain

---

#### T2.3: Migrate ProductCard to Semantic Tokens
**Priority:** HIGH | **Effort:** 20 min | **PR:** `refactor/product-card-semantic-tokens`

**Files:**
- `components/products/product-card.tsx`

**Actions:**
- [ ] Replace `bg-system-100` → `bg-card`
- [ ] Replace `border-system-200` → `border-border`
- [ ] Replace `text-system-400` → `text-foreground`
- [ ] Keep `bg-brand-200` for primary CTA buttons

**Acceptance Criteria:**
- [ ] Product cards look identical
- [ ] Dark mode cards adapt correctly
- [ ] Hover states work

---

#### T2.4: Install Additional shadcn Primitives
**Priority:** MEDIUM | **Effort:** 15 min | **PR:** `feat/additional-shadcn-primitives`

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
**Priority:** HIGH | **Effort:** 45 min | **PR:** `feat/page-header-component`

**Files:**
- `components/ui/page-header.tsx` (create new)

**Actions:**
- [ ] Create with TypeScript interface (title, description, breadcrumbs, actions)
- [ ] Implement breadcrumb navigation with ChevronRight icons
- [ ] Support 3 sizes (sm/md/lg)
- [ ] Use semantic HTML (h1, nav, etc.)

**Acceptance Criteria:**
- [ ] Breadcrumbs render and link correctly
- [ ] Title and description styled properly
- [ ] Actions align to the right
- [ ] Responsive on mobile
- [ ] All 3 sizes work

---

#### T2.6: Create StatsCard Component
**Priority:** MEDIUM | **Effort:** 30 min | **PR:** `feat/stats-card-component`

**Files:**
- `components/ui/stats-card.tsx` (create new)

**Actions:**
- [ ] Create with TypeScript interface (label, value, icon, trend)
- [ ] Use Card primitive
- [ ] Implement trend indicators (up/down/neutral with icons)
- [ ] Support default and accent variants

**Acceptance Criteria:**
- [ ] Value displays correctly (string and number)
- [ ] Icon renders in header
- [ ] Trend up/down/neutral styled correctly
- [ ] Accent variant changes background
- [ ] ARIA labels work

---

#### T2.7: Create SearchInput Component
**Priority:** MEDIUM | **Effort:** 20 min | **PR:** `feat/search-input-component`

**Files:**
- `components/ui/search-input.tsx` (create new)

**Actions:**
- [ ] Create with TypeScript interface (value, onChange, onClear)
- [ ] Use Input primitive with Search icon
- [ ] Add clear button (X icon) that appears when value exists
- [ ] Support 3 sizes (sm/md/lg)

**Acceptance Criteria:**
- [ ] Search icon appears on left
- [ ] Clear button appears when value exists
- [ ] Clear button calls onClear and resets value
- [ ] All 3 sizes work
- [ ] Keyboard accessible

---

#### T2.8: Phase 2 Validation
**Priority:** HIGH | **Effort:** 30 min

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

## Phase 3: Polish & Enforcement (6 hours)

**Goal:** Complete migration, document patterns, enforce consistency.

**Deliverables:**
- ✅ All components migrated to semantic tokens
- ✅ Additional utility composites created
- ✅ Component usage documentation
- ✅ ESLint rules for enforcement

**Prerequisites:**
- ✅ Phase 1 complete
- ✅ Phase 2 complete

### Tasks

#### T3.1: Migrate Remaining Components to Semantic Tokens
**Priority:** HIGH | **Effort:** 2 hours | **PR:** `refactor/complete-token-migration`

**Files:**
- `components/cart/*.tsx`
- `components/checkout/*.tsx`
- `components/admin/*.tsx`
- `app/**/*.tsx` (pages)

**Actions:**
- [ ] Audit all remaining files with `system-*` token usage
- [ ] Replace with semantic tokens:
  - `bg-system-100` → `bg-muted`
  - `bg-system-50` → `bg-background` or `bg-muted`
  - `text-system-400` → `text-foreground`
  - `text-system-300` → `text-muted-foreground`
  - `border-system-200` → `border-border`
- [ ] Keep `brand-*` tokens for intentional brand elements
- [ ] Keep `tracking-*` tokens for tracking pages only

**Acceptance Criteria:**
- [ ] Grep search for `system-` returns only CSS variable definitions
- [ ] No hardcoded colors in component files
- [ ] All components work in dark mode
- [ ] No visual regressions

**Testing:**
```bash
# Audit remaining system-* usage
grep -r "system-[0-9]" components/ app/ --include="*.tsx" | grep -v "tracking-"

# Should return 0 results after migration
```

---

#### T3.2: Create QuantityInput Component
**Priority:** LOW | **Effort:** 30 min | **PR:** `feat/quantity-input-component`

**Files:**
- `components/ui/quantity-input.tsx` (create new)

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
**Priority:** LOW | **Effort:** 20 min | **PR:** `feat/price-display-component`

**Files:**
- `components/ui/price-display.tsx` (create new)

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
**Priority:** MEDIUM | **Effort:** 1.5 hours | **PR:** `refactor/adopt-composite-components`

**Files:**
- Multiple component files

**Actions:**
- [ ] Replace empty state markup with `<EmptyState>` (cart, product list, admin)
- [ ] Replace status indicators with `<StatusBadge>` (admin orders, etc.)
- [ ] Replace page titles with `<PageHeader>` (admin pages)
- [ ] Replace dashboard metrics with `<StatsCard>` (admin dashboard)

**Acceptance Criteria:**
- [ ] All empty states use EmptyState component
- [ ] All status indicators use StatusBadge
- [ ] Admin pages use PageHeader
- [ ] Dashboard uses StatsCard
- [ ] No visual regressions

---

#### T3.5: Create Component Usage Documentation
**Priority:** HIGH | **Effort:** 1 hour | **PR:** `docs/component-usage-guide`

**Files:**
- `docs/components.md` (create new)

**Actions:**
- [ ] Document import rules (always `@/components/ui/...`)
- [ ] Document composition patterns (primitives first)
- [ ] Document token usage rules (semantic > brand > state)
- [ ] Add do's and don'ts with examples
- [ ] Add quick reference table

**Acceptance Criteria:**
- [ ] Clear import guidelines
- [ ] Pattern examples for common use cases
- [ ] Token usage rules documented
- [ ] Quick reference table created

---

#### T3.6: Add ESLint Rules for Enforcement
**Priority:** MEDIUM | **Effort:** 45 min | **PR:** `chore/component-eslint-rules`

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
**Priority:** HIGH | **Effort:** 1 hour

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

### Getting Started

**Before starting any task:**
1. Pull latest: `git pull origin main`
2. Create feature branch: `git checkout -b <branch-name>`
3. Read task acceptance criteria
4. Make changes
5. Test locally
6. Commit and push
7. Create PR with task ID in title

**Branch naming:**
- Features: `feat/task-description`
- Fixes: `fix/task-description`
- Refactors: `refactor/task-description`
- Docs: `docs/task-description`
- Chores: `chore/task-description`

### Running Tests

```bash
# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev

# Type check
npx tsc --noEmit
```

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

### Common Issues

**Issue:** Dark mode not working after token change
**Fix:** Check that `.dark` variants exist in globals.css

**Issue:** Build fails after component change
**Fix:** Check TypeScript errors with `npx tsc --noEmit`

**Issue:** Visual regression after token migration
**Fix:** Revert change, compare expected vs actual token values

**Issue:** Button doesn't work after replacing raw HTML
**Fix:** Ensure onClick, variant, size props are correct

### Validation Checklist

After each PR:
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Visual regression test (before/after screenshots)
- [ ] Dark mode test (toggle on affected pages)
- [ ] Keyboard navigation test (Tab through interactive elements)
- [ ] Contrast test (Lighthouse accessibility audit)

---

## Progress Tracking

### Phase 1 Completion Criteria
- [ ] All tasks T1.1 through T1.9 complete
- [ ] 9/9 tasks checked off
- [ ] PR merged to main
- [ ] Phase 1 validation passed

### Phase 2 Completion Criteria
- [ ] All tasks T2.1 through T2.8 complete
- [ ] 8/8 tasks checked off
- [ ] PR merged to main
- [ ] Phase 2 validation passed

### Phase 3 Completion Criteria
- [ ] All tasks T3.1 through T3.7 complete
- [ ] 7/7 tasks checked off
- [ ] PR merged to main
- [ ] Phase 3 validation passed

### Project Completion Criteria
- [ ] All 3 phases complete (24/24 tasks)
- [ ] Component health score: 98/100
- [ ] Zero raw HTML violations
- [ ] Zero hardcoded colors
- [ ] Full dark mode support
- [ ] All composites created and adopted
- [ ] Documentation complete
- [ ] ESLint rules enforced

---

## Notes

**Small PRs:** Each task should be a separate PR. Don't bundle multiple tasks together unless they're tightly coupled.

**Testing:** Always test both light and dark modes after changes. Use `<html class="dark">` in DevTools.

**Rollback:** Each PR is independently revertable. If something breaks, revert the specific PR.

**Documentation:** Update `.claude/rules/` after completing Phase 3 to reflect new patterns.

**Questions?** Check generated documentation in local files:
- `design-system/02B-token-unification-plan.md`
- `component-library/03-composite-designs.md`
- `component-library/04-implementation-plan.md`
- `component-library/05-usage-guidelines.md`

---

**Last Updated:** 2026-02-28  
**Status:** Phase 1 Ready to Start
