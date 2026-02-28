# Complete Testing Checklist - Phase 1 & 2

## 🔧 Pre-Test Setup (CRITICAL - Do This First!)

### 1. Clear All Caches
```bash
# Stop dev server (Ctrl+C)

# Delete Next.js cache
rm -rf .next

# Delete node_modules cache (if issues persist)
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

### 2. Hard Refresh Browser
- **Chrome/Edge:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox:** `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Or: Open DevTools → Right-click refresh button → "Empty Cache and Hard Reload"

### 3. Install Dependencies
```bash
# Install next-themes (Phase 1)
npm install next-themes

# Install shadcn primitives (Phase 2)
npx shadcn@latest add popover
npx shadcn@latest add tabs

# Verify installation
npm list next-themes  # Should show version
ls components/ui/popover.tsx  # Should exist
ls components/ui/tabs.tsx     # Should exist
```

---

## ✅ Phase 1 Testing Checklist

### T1.1-T1.2: Token System
- [ ] **Build Test:** `npm run build` succeeds with no errors
- [ ] **Dev Server:** `npm run dev` starts without errors
- [ ] **Dark Mode CSS Variables Exist:**
  ```bash
  # Check globals.css has dark mode tokens
  grep -A 10 ".dark {" app/globals.css
  # Should show system-50, system-100, tracking-* variables
  ```

### T1.3-T1.4: Button Fixes
- [ ] **Header Cart Button:**
  - Click cart icon → side panel opens
  - Press Tab → cart button gets focus ring
  - Press Enter/Space → side panel opens
  - Button is NOT a raw `<button>` tag
  
- [ ] **Header Mobile Menu:**
  - Resize to mobile width (<768px)
  - Click hamburger icon → menu opens
  - Click X icon → menu closes
  - Press Tab → hamburger gets focus ring
  
- [ ] **ProductGallery Thumbnails:**
  - Go to any product detail page
  - Click thumbnail → main image changes
  - Press Tab through thumbnails → focus visible
  - Press Enter on focused thumbnail → image changes

### T1.5: StatusBadge Component
```tsx
// Test in any page temporarily
import { StatusBadge } from "@/components/ui/status-badge";

<div className="p-4 space-y-2">
  <StatusBadge status="pending" />
  <StatusBadge status="success" icon />
  <StatusBadge status="error" icon label="Failed" />
  <StatusBadge status="warning" size="sm" />
  <StatusBadge status="info" icon />
</div>
```
- [ ] All 5 status types render with correct colors
- [ ] Icons appear when `icon` prop is true
- [ ] Custom labels override defaults
- [ ] Both sizes (sm, md) work
- [ ] Colors meet WCAG AA contrast

### T1.6: EmptyState Component
```tsx
// Test in any page temporarily
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

<EmptyState
  icon={Package}
  title="No items found"
  description="Try adjusting your filters"
  action={{
    label: "Reset Filters",
    onClick: () => console.log("Clicked"),
  }}
  size="md"
/>
```
- [ ] Icon renders correctly
- [ ] Title and description display
- [ ] Action button triggers onClick
- [ ] All 3 sizes work (sm, md, lg)
- [ ] Responsive on mobile

### T1.7: LoadingButton Component
```tsx
// Test in any page temporarily
import { LoadingButton } from "@/components/ui/loading-button";
import { useState } from "react";

const [loading, setLoading] = useState(false);

<LoadingButton
  loading={loading}
  loadingText="Saving..."
  onClick={() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }}
>
  Save Changes
</LoadingButton>
```
- [ ] Shows spinner when loading
- [ ] Button is disabled when loading
- [ ] Loading text overrides button text
- [ ] Works with all Button variants

### T1.8: ThemeToggle & Dark Mode
- [ ] **Theme Toggle Visible:** Button appears in header (desktop only)
- [ ] **Icon Switches:** Sun icon in light mode, Moon icon in dark mode
- [ ] **Theme Persistence:** Refresh page → theme persists
- [ ] **Dark Mode Pages:**
  - [ ] Home (`/`) - dark backgrounds, light text
  - [ ] Products (`/products`) - cards adapt to dark mode
  - [ ] Product Detail - gallery and details readable
  - [ ] Tracking Page - tracking tokens apply dark colors
  - [ ] Admin Dashboard - all admin pages dark mode compatible
  
- [ ] **Contrast Check (WCAG AA):**
  - Open Chrome DevTools → Lighthouse
  - Run accessibility audit in both light and dark modes
  - All color contrasts should pass WCAG AA (4.5:1 for normal text)

### T1.9: Build Validation
```bash
# TypeScript check
npx tsc --noEmit
# Should complete with no errors

# Build check
npm run build
# Should succeed with no errors

# Start production build
npm run start
# Test in production mode
```

---

## ✅ Phase 2 Testing Checklist

### T2.1: Header Token Migration
- [ ] **Visual Regression (Light Mode):**
  - Header looks identical to before migration
  - Navigation links visible and clickable
  - Logo and icons properly colored
  
- [ ] **Dark Mode:**
  - Header adapts to dark background
  - Text remains readable (light on dark)
  - Border visible but subtle
  - Navigation links change color on hover
  
- [ ] **Token Audit:**
  ```bash
  # Should return ZERO results
  grep "system-[0-9]" components/layout/header.tsx
  ```

### T2.2: Footer Token Migration
- [ ] **Visual Regression (Light Mode):**
  - Footer looks identical to before
  - All links visible and styled correctly
  - Contact info readable
  
- [ ] **Dark Mode:**
  - Footer adapts to dark background
  - All text readable in dark mode
  - Links change color on hover
  - Border at top visible
  
- [ ] **Token Audit:**
  ```bash
  # Should return ZERO results
  grep "system-[0-9]" components/layout/footer.tsx
  ```

### T2.3: ProductCard Token Migration
- [ ] **Visual Regression (Light Mode):**
  - Product cards look identical
  - Images load correctly
  - Hover effect works
  - Price in brand color
  
- [ ] **Dark Mode:**
  - Card background adapts
  - Text readable on dark cards
  - Hover effect visible
  - Out of stock badge readable
  
- [ ] **Token Audit:**
  ```bash
  # Should return ZERO results
  grep "system-[0-9]" components/products/product-card.tsx
  ```

### T2.5: PageHeader Component
```tsx
// Test in admin page or create test page
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

<PageHeader
  size="md"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "T-Shirts", href: "/products/t-shirts" },
  ]}
  title="Premium T-Shirts Collection"
  description="Explore our curated selection of high-quality streetwear"
  actions={
    <>
      <Button variant="outline">Filter</Button>
      <Button>Add Product</Button>
    </>
  }
/>
```
- [ ] Breadcrumbs render with separators
- [ ] Breadcrumb links work
- [ ] Last breadcrumb is not a link
- [ ] Title displays correctly
- [ ] Description shows below title
- [ ] Actions align to the right
- [ ] Responsive: stacks on mobile
- [ ] All 3 sizes work (sm, md, lg)

### T2.6: StatsCard Component
```tsx
// Test in admin dashboard or create test page
import { StatsCard } from "@/components/ui/stats-card";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    label="Total Revenue"
    value="$45,231"
    icon={DollarSign}
    trend={{ type: "up", value: "+12.5%" }}
    variant="default"
  />
  <StatsCard
    label="Active Orders"
    value={142}
    icon={ShoppingCart}
    trend={{ type: "down", value: "-3.2%" }}
  />
  <StatsCard
    label="Total Users"
    value="8,492"
    icon={Users}
    trend={{ type: "neutral", value: "No change" }}
  />
  <StatsCard
    label="Growth Rate"
    value="23.5%"
    icon={TrendingUp}
    trend={{ type: "up", value: "+5.1%" }}
    variant="accent"
  />
</div>
```
- [ ] All cards render correctly
- [ ] Icons display in header
- [ ] Values display (string and number)
- [ ] Trend indicators show correct colors:
  - Up: Green (success-200)
  - Down: Red (error-200)
  - Neutral: Gray (muted-foreground)
- [ ] Accent variant has different background
- [ ] Both variants work in dark mode
- [ ] Responsive grid layout

### T2.7: SearchInput Component
```tsx
// Test in products page or admin
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

const [query, setQuery] = useState("");

<div className="space-y-4">
  <SearchInput
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search products..."
    size="sm"
  />
  <SearchInput
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search products..."
    size="md"
  />
  <SearchInput
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search products..."
    size="lg"
  />
</div>
```
- [ ] Search icon appears on left
- [ ] Clear button (X) appears when typing
- [ ] Clear button removes text
- [ ] All 3 sizes render correctly
- [ ] Can type and search
- [ ] Press Tab → input gets focus
- [ ] Press Escape → clears input (browser default)
- [ ] Works in dark mode

### T2.4: shadcn Primitives Installation
```bash
# Check files exist
ls components/ui/popover.tsx
ls components/ui/tabs.tsx

# Test import in a component
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```
- [ ] Popover component exists
- [ ] Tabs component exists
- [ ] Can import without errors
- [ ] Components work in dark mode

### T2.8: Phase 2 Validation
```bash
# Token audit - should return ZERO results
grep -r "system-[0-9]" components/layout/ components/products/product-card.tsx

# Build test
npm run build

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

---

## 🐛 Hydration Mismatch Fix

### If You See This Error:
> "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"

### Solution:
```bash
# 1. Stop dev server
Ctrl+C

# 2. Delete .next cache
rm -rf .next

# 3. Delete node_modules cache
rm -rf node_modules/.cache

# 4. Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear cached images and files

# 5. Restart dev server
npm run dev

# 6. Hard refresh browser
# Chrome: Ctrl+Shift+R
```

### Verify Fix:
- [ ] No hydration errors in browser console
- [ ] Header renders correctly
- [ ] Footer renders correctly
- [ ] Theme toggle works
- [ ] Dark mode toggle works without errors

---

## 📊 Overall Validation

### Component Health Check
```bash
# Grep for violations
grep -r "<button" components/ --include="*.tsx" | grep -v "// @ts"
# Should only show Button components, no raw <button> tags

grep -r "<input" components/ --include="*.tsx" | grep -v "// @ts"
# Should only show Input components, no raw <input> tags

# Check for hardcoded colors (optional, advanced)
grep -r "#[0-9a-fA-F]\\{6\\}" components/ --include="*.tsx"
# Should be minimal, mostly in tracking tokens
```

### Dark Mode Comprehensive Test
Pages to test in dark mode:
- [ ] Home (`/`)
- [ ] Products list (`/products`)
- [ ] Product detail (`/products/[slug]`)
- [ ] Cart side panel (click cart icon)
- [ ] Checkout page (`/checkout`)
- [ ] Tracking page (`/tracking/[orderId]`)
- [ ] Admin dashboard (`/admin`)
- [ ] Admin products (`/admin/products`)
- [ ] Admin orders (`/admin/orders`)

### Contrast Audit (WCAG AA)
```bash
# Run Lighthouse in Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select "Accessibility" only
# 4. Click "Generate report"
# 5. Check all color contrasts pass
```

### Performance Check
- [ ] Build size reasonable (check `.next/standalone` if exists)
- [ ] No console errors in production build
- [ ] Fast page loads
- [ ] No layout shift (CLS < 0.1)

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [x] All 9 tasks checked off
- [x] Build succeeds (`npm run build`)
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] No hydration mismatches
- [x] Dark mode works on all pages
- [x] All buttons keyboard accessible
- [x] WCAG AA contrast met
- [x] 5 new composites created and working

### Phase 2 Complete When:
- [ ] All 8 tasks checked off
- [ ] Build succeeds
- [ ] Token audit returns zero results
- [ ] Header, Footer, ProductCard fully migrated
- [ ] 3 new composites created and working
- [ ] All pages work in light and dark mode
- [ ] No visual regressions

---

## 🚀 Quick Test Commands

```bash
# Fast validation script
npm run build && \
npx tsc --noEmit && \
grep -r "system-[0-9]" components/layout/ components/products/product-card.tsx && \
echo "✅ All checks passed!"

# If grep returns results, migration incomplete
# If grep returns nothing, migration complete ✅
```

---

## 📝 Notes

- **Cache Issues:** Always clear `.next` and hard refresh browser after pulling changes
- **Hydration Errors:** Usually caused by stale cache, not code issues
- **Dark Mode:** Uses `next-themes` with `class` strategy
- **Token Strategy:** Semantic tokens (shadcn) > Brand tokens > System tokens (legacy)
- **Component Health:** Target 98/100 by end of Phase 3

---

**Last Updated:** Feb 28, 2026 02:54 AM WAT
**Status:** Phase 1 ✅ | Phase 2 ⚠️ (Manual validation needed)
