# gayla-shop TODO - Updated Feb 28, 2026

## ✅ PHASE 1: FOUNDATION (COMPLETE)

### Token System
- [x] **T1.1:** Add dark mode variants for system tokens
- [x] **T1.2:** Migrate tracking tokens to CSS variables

### Button Violations
- [x] **T1.3:** Fix raw button in Header
- [x] **T1.4:** Fix raw button in ProductGallery

### Essential Composites
- [x] **T1.5:** Create StatusBadge component
- [x] **T1.6:** Create EmptyState component
- [x] **T1.7:** Create LoadingButton component
- [x] **T1.8:** Implement ThemeToggle with next-themes

### Validation
- [x] **T1.9:** Phase 1 validation

**Phase 1 Summary:** 9/9 tasks (100%) | Component health: 90 → 95

---

## ✅ PHASE 2: COMPONENT MIGRATION (COMPLETE)

### Token Migration
- [x] **T2.1:** Migrate Header to semantic tokens
- [x] **T2.2:** Migrate Footer to semantic tokens
- [x] **T2.3:** Migrate ProductCard to semantic tokens

### Primitives
- [x] **T2.4:** Install shadcn primitives

### Strategic Composites
- [x] **T2.5:** Create PageHeader component
- [x] **T2.6:** Create StatsCard component
- [x] **T2.7:** Create SearchInput component

### Validation
- [x] **T2.8:** Phase 2 validation

**Phase 2 Summary:** 8/8 tasks (100%) | Component health: 95 → 97

---

## ✅ PHASE 3: UTILITY & DOCUMENTATION (COMPLETE)

### Utility Composites
- [x] **T3.2:** Create QuantityInput component
- [x] **T3.3:** Create PriceDisplay component

### Component Adoption
- [x] **T3.4:** Adoption examples documented

### Documentation
- [x] **T3.5:** Component usage documentation

### Code Quality
- [x] **T3.6:** ESLint enforcement rules

### Validation
- [x] **T3.7:** Phase 3 validation

**Phase 3 Summary:** 7/7 tasks (100%) | Component health: 97 → 98*

*Note: Component health was calculated based on infrastructure, not actual user experience. Real health is ~60/100 due to incomplete migration.

---

## 🚨 PHASE 4: SYSTEMATIC THEME UNIFICATION (URGENT)

**Status:** 🔴 P0 - Critical user-facing issues  
**Priority:** Must fix before production  
**Estimated Time:** ~11 hours (4 sessions)

### Critical Problems:
1. ❌ Dark mode only works on cards, not entire website
2. ❌ Pages don't use default shadcn fonts consistently
3. ❌ `/admin` routes completely untouched (no theme, no primitives)
4. ❌ Inconsistent UI across public/admin/tracking routes

### Root Causes:
- Only 3 components migrated (Header, Footer, ProductCard)
- Pages use hardcoded colors (`bg-white`, `text-black`)
- Admin has separate component implementations
- No unified layout/theme system
- Tracking uses custom tokens instead of semantic

---

### **PHASE 4.1: AUDIT** (70 minutes)

- [ ] **T4.1.1:** Route & Layout Discovery (10 min)
  - Find all route groups, layouts, pages
  - Document route structure
  - Identify ThemeProvider coverage
  - **Deliverable:** `docs/audit-routes.md`

- [ ] **T4.1.2:** Hardcoded Color Audit (15 min)
  - Find all `bg-white`, `bg-gray-*`, `text-black`, `text-gray-*`
  - Find hex colors
  - Document violations with line numbers
  - Suggest semantic token replacements
  - **Deliverable:** `docs/audit-colors.md`

- [ ] **T4.1.3:** Component Primitive Audit (15 min)
  - Find raw HTML: `<button>`, `<input>`, `<textarea>`, `<select>`
  - Document component it should use instead
  - Assess migration difficulty
  - **Deliverable:** `docs/audit-primitives.md`

- [ ] **T4.1.4:** Font & Typography Audit (10 min)
  - Find custom font imports
  - Check if pages use `font-sans`
  - Identify inconsistent text sizes
  - **Deliverable:** `docs/audit-typography.md`

- [ ] **T4.1.5:** Admin Route Deep Dive (20 min)
  - List all admin pages
  - Check admin layout for ThemeProvider
  - Audit admin component usage
  - Identify duplicate components
  - **Deliverable:** `docs/audit-admin.md`

---

### **PHASE 4.2: LAYOUT UNIFICATION** (25 minutes)

- [ ] **T4.2.1:** Root Layout Validation (5 min)
  - Ensure ThemeProvider in root or properly inherited
  - Add `suppressHydrationWarning` to `<html>`
  - Apply `font-sans antialiased` to body

- [ ] **T4.2.2:** Admin Layout Migration (15 min)
  - Remove hardcoded `bg-gray-100` → use `bg-background`
  - Ensure inherits ThemeProvider
  - Use semantic tokens for nav, sidebar
  - Apply `font-sans`

- [ ] **T4.2.3:** Public Layout Validation (5 min)
  - Confirm ThemeProvider present
  - Verify Header/Footer use semantic tokens

---

### **PHASE 4.3: PUBLIC PAGE MIGRATIONS** (160 minutes)

- [ ] **T4.3.1:** Migrate Home Page (30 min)
  - `bg-white` → `bg-background`
  - `bg-gray-50` → `bg-muted`
  - `text-black` → `text-foreground`
  - Replace raw buttons with `Button` primitive
  - **Validation:** Toggle dark mode → page adapts ✅

- [ ] **T4.3.2:** Migrate Products List Page (20 min)
  - Filter sidebar: semantic tokens
  - Search: use `SearchInput` composite
  - Empty state: use `EmptyState` composite
  - **Validation:** Dark mode works, search functional ✅

- [ ] **T4.3.3:** Migrate Product Detail Page (40 min)
  - Price: use `PriceDisplay` composite
  - Quantity: use `QuantityInput` composite
  - Add to cart: use `LoadingButton`
  - All backgrounds/text: semantic tokens
  - **Validation:** Product detail works in dark mode ✅

- [ ] **T4.3.4:** Migrate Checkout Page (60 min) - MOST COMPLEX
  - Step indicator: semantic tokens
  - ALL form fields: Replace raw inputs with primitives
  - Order summary: use `PriceDisplay`
  - Submit: use `LoadingButton`
  - **Validation:** Checkout works in dark mode ✅

- [ ] **T4.3.5:** Migrate Tracking Page (45 min)
  - Remove ALL `tracking-*` tokens
  - Replace with semantic tokens (see guide)
  - Order status: use `StatusBadge` composite
  - Update `globals.css` (remove tracking tokens)
  - **Validation:** Tracking works in dark mode, no tracking-* tokens ✅

- [ ] **T4.3.6:** Migrate Error Pages (15 min)
  - Use `EmptyState` composite
  - Semantic tokens
  - Button primitives

---

### **PHASE 4.4: ADMIN ROUTE OVERHAUL** (215 minutes)

- [ ] **T4.4.1:** Migrate Admin Dashboard (45 min)
  - Page header: use `PageHeader` composite
  - Stats: use `StatsCard` composite
  - Tables: semantic tokens
  - All buttons: `Button` primitive
  - **Validation:** Dashboard works in dark mode ✅

- [ ] **T4.4.2:** Migrate Admin Products Page (40 min)
  - Page header: `PageHeader`
  - Search: `SearchInput` composite
  - Status: `StatusBadge` composite
  - Empty: `EmptyState` composite
  - **Validation:** Products page works in dark mode ✅

- [ ] **T4.4.3:** Migrate Admin Product Form (60 min) - COMPLEX
  - ALL inputs → `Input` primitive
  - Textareas → `Textarea` primitive
  - Selects → `Select` primitive
  - Submit → `LoadingButton`
  - **Validation:** Form works in dark mode ✅

- [ ] **T4.4.4:** Migrate Admin Orders Page (40 min)
  - Similar to products page
  - **Validation:** Orders page works in dark mode ✅

- [ ] **T4.4.5:** Migrate Admin Settings (30 min)
  - Settings form: all primitives
  - Add `ThemeToggle` to settings
  - **Validation:** Settings works in dark mode ✅

---

### **PHASE 4.5: CLEANUP** (55 minutes)

- [ ] **T4.5.1:** Remove Deprecated Tokens (15 min)
  - Update `globals.css`: Remove `system-*` and `tracking-*`
  - Final audit: `grep -r "system-[0-9]\|tracking-"` → should return ZERO

- [ ] **T4.5.2:** Font Standardization (10 min)
  - Ensure root layout has `font-sans`
  - Remove custom font imports
  - Use shadcn typography scale

- [ ] **T4.5.3:** Component Deduplication (30 min)
  - Find duplicate admin components
  - Consolidate into shadcn primitives
  - Delete duplicates

---

### **PHASE 4.6: VALIDATION** (125 minutes)

- [ ] **T4.6.1:** Manual Testing (60 min)
  - Test EVERY route in BOTH themes (light + dark)
  - Public: Home, Products, Product detail, Checkout, Tracking
  - Admin: Dashboard, Products, Orders, Settings
  - Error: 404, Error boundary
  - For each: Toggle theme, test buttons, test forms

- [ ] **T4.6.2:** Automated Validation (15 min)
  - Token audit (grep)
  - Hardcoded color audit (grep)
  - Raw HTML audit (grep)
  - Build test (`npm run build`)
  - TypeScript (`npx tsc --noEmit`)
  - Lint (`npm run lint`)

- [ ] **T4.6.3:** Accessibility Audit (30 min)
  - Run Lighthouse on key pages
  - Check WCAG AA contrast
  - Test keyboard navigation
  - Target: 90+ accessibility score

- [ ] **T4.6.4:** Visual Regression (20 min)
  - Screenshot all pages (light + dark)
  - Compare before/after
  - Fix unintentional changes

---

### **PHASE 4.7: DOCUMENTATION** (30 minutes)

- [ ] **T4.7.1:** Update Component Health (10 min)
  - Calculate final metrics
  - Before/after comparison
  - Validation proof

- [ ] **T4.7.2:** Create Migration Summary (15 min)
  - Pages migrated
  - Components consolidated
  - Tokens removed
  - Lessons learned
  - **Deliverable:** `docs/phase-4-summary.md`

- [ ] **T4.7.3:** Update TODO.md (5 min)
  - Mark all tasks complete
  - Final statistics
  - Status: Production ready

---

## 🎯 PHASE 4 SUCCESS METRICS

| Metric | Before Phase 4 | After Phase 4 | Target |
|--------|----------------|---------------|--------|
| **Dark mode coverage** | 30% | 100% | 100% ✅ |
| **Semantic token usage** | ~20% | 100% | 100% ✅ |
| **Admin primitives** | 0% | 100% | 100% ✅ |
| **Hardcoded colors** | Many | 0 | 0 ✅ |
| **Raw HTML elements** | Many | 0 | 0 ✅ |
| **Font consistency** | 50% | 100% | 100% ✅ |
| **Routes tested** | 0 | 15+ | 15+ ✅ |
| **Component health** | ~60/100 | 98/100 | 98/100 ✅ |

---

## 📅 EXECUTION PLAN

### **Session 1 (3 hours): Critical Path**
- Complete audit (T4.1.1 - T4.1.5)
- Fix layouts (T4.2.1 - T4.2.3)
- Migrate home page (T4.3.1)
- Migrate products list (T4.3.2)

### **Session 2 (2 hours): Product Journey**
- Migrate product detail (T4.3.3)
- Migrate checkout (T4.3.4)

### **Session 3 (4 hours): Admin Overhaul**
- All admin migrations (T4.4.1 - T4.4.5)

### **Session 4 (2 hours): Polish**
- Tracking page (T4.3.5)
- Error pages (T4.3.6)
- Cleanup (T4.5.1 - T4.5.3)
- Validation (T4.6.1 - T4.6.4)
- Documentation (T4.7.1 - T4.7.3)

---

## 🛠️ QUICK REFERENCE

### Token Replacement Guide:
```tsx
// Backgrounds
bg-white → bg-background
bg-gray-50 → bg-muted
bg-gray-100 → bg-card

// Text
text-black → text-foreground
text-gray-600 → text-muted-foreground

// Borders
border-gray-200 → border-border
```

### Tracking Token Migration:
```tsx
tracking-bg-primary → bg-card
tracking-text-primary → text-foreground
tracking-text-muted → text-muted-foreground
tracking-accent → text-brand-200
tracking-step-active → bg-brand-200
tracking-step-complete → bg-success-200
tracking-step-pending → bg-muted
```

---

## ✅ OVERALL STATISTICS

### After Phase 3:
- Total Tasks: 24/24 (100%)*
- Component Health: 98/100*
- Files Changed: 23
- Lines Changed: ~3,500

*Note: These metrics were based on infrastructure completion, not actual user experience. Real component health is ~60/100 until Phase 4 is complete.

### After Phase 4 (Target):
- Total Tasks: 59/59 (100%)
- Component Health: 98/100 (validated)
- Dark Mode: 100% coverage
- Admin: Fully migrated
- Theme: Unified across all routes
- Status: Production ready 🚀

---

**Last Updated:** Feb 28, 2026 03:20 AM WAT  
**Current Phase:** Phase 4 (Critical Fixes)  
**Status:** 🔴 Urgent - Must complete before production  
**Next Action:** Start Session 1 (Audit + Critical Path)
