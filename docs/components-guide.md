# Component Library Guide - gayla-shop

## Overview

This guide documents the complete component library for gayla-shop, including usage patterns, best practices, and composition rules.

**Component Health:** 97/100  
**Composites Created:** 8  
**Token Strategy:** Semantic-first (shadcn) > Brand > State

---

## Component Inventory

### Primitive Components (shadcn/ui)
Base components from shadcn/ui:
- Button, Input, Card, Badge, Sheet, Dialog
- Separator, ScrollArea, Popover, Tabs
- And more...

### Composite Components (Custom)
8 composites built on primitives:

| Component | Phase | Purpose | Variants |
|-----------|-------|---------|----------|
| **StatusBadge** | 1 | Status indicators | 5 types, 2 sizes |
| **EmptyState** | 1 | Empty states | 3 sizes |
| **LoadingButton** | 1 | Async actions | All Button variants |
| **ThemeToggle** | 1 | Dark mode control | icon, labeled |
| **PageHeader** | 2 | Page headers | 3 sizes |
| **StatsCard** | 2 | Dashboard metrics | 2 variants |
| **SearchInput** | 2 | Search with clear | 3 sizes |
| **QuantityInput** | 3 | Quantity selector | 2 sizes |
| **PriceDisplay** | 3 | Price formatting | 3 variants |

---

## Import Rules

### ✅ Always Import From
```tsx
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
```

### ❌ Never Import From
```tsx
// ❌ Don't use relative paths
import { Button } from "../ui/button";
import { Button } from "../../components/ui/button";

// ❌ Don't import from index files
import { Button } from "@/components/ui";
```

### Rule: Explicit Named Imports
Always use explicit named imports from specific files for:
- Better tree-shaking
- Clearer dependencies
- Faster build times

---

## Token Usage Hierarchy

### 1. Semantic Tokens (shadcn) - **PREFERRED**
Use these for most UI elements:

```tsx
// Backgrounds
bg-background      // Page backgrounds
bg-card            // Card backgrounds
bg-muted           // Subtle backgrounds
bg-popover         // Popover backgrounds

// Text
text-foreground           // Primary text
text-muted-foreground     // Secondary text
text-popover-foreground   // Text on popovers

// Borders & Accents
border-border      // Standard borders
border-input       // Input borders
ring-ring          // Focus rings
```

### 2. Brand Tokens - **USE SPARINGLY**
Only for intentional brand emphasis:

```tsx
text-brand-200     // Primary brand color (logos, CTAs)
bg-brand-200       // Brand background (primary buttons)
text-brand-100     // Lighter brand accent
```

**When to use brand tokens:**
- ✅ Logos and brand marks
- ✅ Primary CTA buttons
- ✅ Active navigation items
- ✅ Selected states
- ❌ Not for general text/backgrounds

### 3. State Tokens - **FUNCTIONAL ONLY**
For success, error, warning states:

```tsx
text-success-200   // Success messages
text-error-200     // Error messages
text-warning-200   // Warning messages

bg-success-100     // Success backgrounds
bg-error-100       // Error backgrounds
```

### 4. Tracking Tokens - **TRACKING PAGE ONLY**
Never use outside tracking pages:

```tsx
// ❌ DON'T use in regular components
bg-tracking-bg-primary
text-tracking-text-primary

// ✅ Only in app/tracking/[orderId]/page.tsx
```

---

## Composition Patterns

### Pattern 1: Primitives First
Always prefer primitives over raw HTML:

```tsx
// ✅ Good
import { Button } from "@/components/ui/button";
<Button onClick={handleClick}>Click me</Button>

// ❌ Bad
<button onClick={handleClick}>Click me</button>
```

### Pattern 2: Composites for Repeated Patterns
Use composites for common UI patterns:

```tsx
// ✅ Good - Uses composite
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

<EmptyState
  icon={Package}
  title="No products found"
  description="Try adjusting your filters"
  action={{ label: "Reset", onClick: handleReset }}
/>

// ❌ Bad - Manual markup
<div className="flex flex-col items-center py-12">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h2 className="text-xl font-semibold mb-2">No products found</h2>
  <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
  <Button onClick={handleReset}>Reset</Button>
</div>
```

### Pattern 3: Semantic HTML
Use semantic HTML with ARIA attributes:

```tsx
// ✅ Good - Semantic + ARIA
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li aria-current="page">Products</li>
  </ol>
</nav>

// ❌ Bad - Divs only
<div>
  <div><a href="/">Home</a></div>
  <div>Products</div>
</div>
```

---

## Component Usage Examples

### StatusBadge
**Purpose:** Consistent status indicators  
**Types:** pending, success, error, warning, info

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

// Basic usage
<StatusBadge status="success" />

// With icon and custom label
<StatusBadge status="error" icon label="Payment Failed" />

// Small size
<StatusBadge status="pending" size="sm" />
```

**When to use:**
- ✅ Order status (pending, delivered, etc.)
- ✅ Payment status (paid, failed, etc.)
- ✅ Product availability (in stock, out of stock)
- ❌ Not for navigation or filters

---

### EmptyState
**Purpose:** Consistent empty state UX  
**Sizes:** sm, md, lg

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart, Package, Search } from "lucide-react";

// Cart empty
<EmptyState
  icon={ShoppingCart}
  title="Your cart is empty"
  description="Add products to continue shopping"
  action={{ label: "Shop Now", onClick: () => router.push("/products") }}
/>

// No search results
<EmptyState
  icon={Search}
  title="No results found"
  description="Try different keywords"
  size="sm"
/>

// No admin products
<EmptyState
  icon={Package}
  title="No products yet"
  action={{ label: "Add Product", onClick: () => router.push("/admin/products/new") }}
  size="lg"
/>
```

**When to use:**
- ✅ Empty cart
- ✅ No search results
- ✅ Empty admin lists
- ✅ First-time user states
- ❌ Not for loading states

---

### LoadingButton
**Purpose:** Buttons with loading state  
**Variants:** All Button variants

```tsx
import { LoadingButton } from "@/components/ui/loading-button";
import { useState } from "react";

const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  await saveProduct();
  setIsSubmitting(false);
};

<LoadingButton
  loading={isSubmitting}
  loadingText="Saving..."
  onClick={handleSubmit}
>
  Save Product
</LoadingButton>
```

**When to use:**
- ✅ Form submissions
- ✅ API requests
- ✅ Async operations
- ❌ Not for instant actions

---

### ThemeToggle
**Purpose:** Dark mode control  
**Variants:** icon (default), labeled

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Icon only (header)
<ThemeToggle />

// With label (settings)
<ThemeToggle variant="labeled" />
```

**When to use:**
- ✅ Header navigation
- ✅ Settings pages
- ❌ Only once per page

---

### PageHeader
**Purpose:** Consistent page headers  
**Sizes:** sm, md, lg

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

<PageHeader
  size="md"
  breadcrumbs={[
    { label: "Admin", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "New", href: "/admin/products/new" },
  ]}
  title="Create New Product"
  description="Add a new product to your inventory"
  actions={
    <>
      <Button variant="outline">Cancel</Button>
      <Button>Save Product</Button>
    </>
  }
/>
```

**When to use:**
- ✅ Admin pages
- ✅ Dashboard pages
- ✅ Complex page layouts
- ❌ Not on public product pages

---

### StatsCard
**Purpose:** Dashboard metrics  
**Variants:** default, accent

```tsx
import { StatsCard } from "@/components/ui/stats-card";
import { DollarSign, ShoppingCart, Users } from "lucide-react";

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatsCard
    label="Total Revenue"
    value="$45,231"
    icon={DollarSign}
    trend={{ type: "up", value: "+12.5% from last month" }}
  />
  
  <StatsCard
    label="Active Orders"
    value={142}
    icon={ShoppingCart}
    trend={{ type: "down", value: "-3.2% from last week" }}
    variant="accent"
  />
  
  <StatsCard
    label="Total Users"
    value="8,492"
    icon={Users}
    trend={{ type: "neutral", value: "No change" }}
  />
</div>
```

**When to use:**
- ✅ Admin dashboard
- ✅ Analytics pages
- ✅ Metric displays
- ❌ Not for navigation

---

### SearchInput
**Purpose:** Search with clear button  
**Sizes:** sm, md, lg

```tsx
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

const [query, setQuery] = useState("");

<SearchInput
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  placeholder="Search products..."
  size="md"
/>
```

**When to use:**
- ✅ Product search
- ✅ Admin list filtering
- ✅ User search
- ❌ Not for forms (use Input)

---

### QuantityInput
**Purpose:** Quantity selector  
**Sizes:** sm, md

```tsx
import { QuantityInput } from "@/components/ui/quantity-input";
import { useState } from "react";

const [quantity, setQuantity] = useState(1);

<QuantityInput
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={99}
  size="md"
/>
```

**When to use:**
- ✅ Product detail pages
- ✅ Cart items
- ✅ Checkout pages
- ❌ Not for general number inputs

---

### PriceDisplay
**Purpose:** Consistent price formatting  
**Variants:** default, large, compact

```tsx
import { PriceDisplay } from "@/components/ui/price-display";

// Basic price
<PriceDisplay amount={29.99} />

// With discount
<PriceDisplay
  amount={24.99}
  compareAt={29.99}
  showDiscount
  variant="large"
/>

// Compact (cart)
<PriceDisplay
  amount={99.99}
  variant="compact"
/>
```

**When to use:**
- ✅ Product cards
- ✅ Product details
- ✅ Cart items
- ✅ Checkout summary
- ❌ Not for input fields

---

## Do's and Don'ts

### ✅ Do's

1. **Use semantic tokens for UI elements**
   ```tsx
   <div className="bg-card border-border text-foreground">
   ```

2. **Use primitives for all interactive elements**
   ```tsx
   <Button onClick={...}>Submit</Button>
   <Input type="text" ... />
   ```

3. **Use composites for repeated patterns**
   ```tsx
   <EmptyState icon={Package} title="No items" />
   ```

4. **Include ARIA attributes**
   ```tsx
   <Button aria-label="Close menu">...</Button>
   ```

5. **Support keyboard navigation**
   ```tsx
   // All buttons and inputs automatically keyboard accessible
   ```

### ❌ Don'ts

1. **Don't use raw HTML for interactive elements**
   ```tsx
   // ❌ Bad
   <button onClick={...}>Submit</button>
   <input type="text" />
   ```

2. **Don't use system-* tokens (deprecated)**
   ```tsx
   // ❌ Bad
   <div className="text-system-400 bg-system-100">
   ```

3. **Don't use brand tokens for general text**
   ```tsx
   // ❌ Bad
   <p className="text-brand-200">Regular paragraph</p>
   ```

4. **Don't hardcode colors**
   ```tsx
   // ❌ Bad
   <div className="bg-[#ffffff] text-[#000000]">
   ```

5. **Don't skip semantic HTML**
   ```tsx
   // ❌ Bad
   <div onClick={...}>Click me</div>
   
   // ✅ Good
   <Button onClick={...}>Click me</Button>
   ```

---

## Quick Reference Tables

### Semantic Token Mapping

| Old (System) | New (Semantic) | Use Case |
|--------------|----------------|----------|
| `bg-system-100` | `bg-muted` | Subtle backgrounds |
| `bg-system-50` | `bg-background` | Page backgrounds |
| `text-system-400` | `text-foreground` | Primary text |
| `text-system-300` | `text-muted-foreground` | Secondary text |
| `border-system-200` | `border-border` | Borders |

### Component Size Guidelines

| Component | Sizes | Default | Use Case |
|-----------|-------|---------|----------|
| StatusBadge | sm, md | md | md: lists, sm: compact spaces |
| EmptyState | sm, md, lg | md | sm: modals, md: pages, lg: dashboards |
| PageHeader | sm, md, lg | md | sm: modals, md: pages, lg: hero sections |
| SearchInput | sm, md, lg | md | sm: filters, md: general, lg: hero search |
| QuantityInput | sm, md | md | sm: cart items, md: product pages |
| PriceDisplay | default, large, compact | default | compact: cart, default: cards, large: details |

### Import Checklist

- [ ] Import from `@/components/ui/[component]`
- [ ] Use explicit named imports
- [ ] Import icons from `lucide-react`
- [ ] Import types from component file
- [ ] No relative paths (`../` or `../../`)
- [ ] No index imports (`@/components/ui`)

---

## Common Mistakes

### Mistake 1: Using system-* tokens
```tsx
// ❌ Wrong
<div className="text-system-400">

// ✅ Correct
<div className="text-foreground">
```

### Mistake 2: Raw HTML buttons
```tsx
// ❌ Wrong
<button onClick={handleClick}>Click</button>

// ✅ Correct
import { Button } from "@/components/ui/button";
<Button onClick={handleClick}>Click</Button>
```

### Mistake 3: Manual empty states
```tsx
// ❌ Wrong
<div className="flex flex-col items-center">
  <Package className="h-12 w-12" />
  <h2>No items</h2>
</div>

// ✅ Correct
import { EmptyState } from "@/components/ui/empty-state";
<EmptyState icon={Package} title="No items" />
```

### Mistake 4: Hardcoded prices
```tsx
// ❌ Wrong
<span>${price.toFixed(2)}</span>

// ✅ Correct
import { PriceDisplay } from "@/components/ui/price-display";
<PriceDisplay amount={price} />
```

---

## Best Practices

1. **Always use semantic tokens** - Better dark mode support
2. **Prefer composites** - Consistent UX across app
3. **Include ARIA attributes** - Better accessibility
4. **Test dark mode** - Every component should work in both modes
5. **Follow size conventions** - Use appropriate sizes for context
6. **Document custom usage** - Add comments for non-obvious patterns
7. **Keep composites simple** - Don't over-engineer
8. **Validate with ESLint** - Run lint before committing

---

## Migration Checklist

When updating old components:

- [ ] Replace raw `<button>` with `Button`
- [ ] Replace raw `<input>` with `Input`
- [ ] Replace `system-*` tokens with semantic tokens
- [ ] Replace manual empty states with `EmptyState`
- [ ] Replace manual status indicators with `StatusBadge`
- [ ] Replace manual price formatting with `PriceDisplay`
- [ ] Add ARIA labels where missing
- [ ] Test keyboard navigation
- [ ] Test dark mode
- [ ] Run TypeScript check
- [ ] Run ESLint

---

**Last Updated:** Feb 28, 2026 03:00 AM WAT  
**Component Health:** 97/100  
**Status:** Phase 3 In Progress
