# Design System

## Stack

- **Tailwind CSS v3** — utility-first styling
- **shadcn/ui** — base component library (in `components/ui/`)
- **`cn()` utility** — conditional class merging via `clsx` + `tailwind-merge`

## The #1 Rule: No Inline Styles

```tsx
// ❌ FORBIDDEN
<div style={{ backgroundColor: '#e74c3c', padding: '16px' }} />

// ✅ CORRECT
<div className="bg-destructive p-4" />
```

**Exception:** Dynamic user-data colors (e.g., color swatches from product variants) may use `style={{ backgroundColor: value }}`. This exception **must** be commented:

```tsx
{/* Dynamic color from product data — inline style is intentional */}
<span
  className="w-2 h-2 rounded-full border"
  style={{ backgroundColor: value.toLowerCase() }}
/>
```

## No Hardcoded Values

Never use raw hex colors, pixel values, or font sizes:

```tsx
// ❌ FORBIDDEN — hardcoded hex, pixel, arbitrary
<div className="text-[#333] mt-[14px] text-[13px]" />

// ✅ CORRECT — Tailwind design tokens
<div className="text-foreground mt-3 text-sm" />
```

## Conditional Classes — Always Use `cn()`

Never build class strings with template literals. Tailwind's purge scanner cannot detect classes inside template expressions.

```tsx
// ❌ BROKEN — Tailwind will purge these classes in production
className={`p-3 rounded-lg ${
  isActive ? "border-primary bg-primary/5" : "border-muted"
}`}

// ✅ CORRECT — all classes are statically scannable
import { cn } from "@/lib/utils";

className={cn(
  "p-3 rounded-lg",
  isActive ? "border-primary bg-primary/5" : "border-muted"
)}
```

This rule applies **everywhere**: components, layouts, hooks, pages.

## Custom Design Tokens

This project extends Tailwind with custom tokens defined in `tailwind.config.ts`:

### Brand Colors
```
brand-50   → lightest brand tint
brand-100  → light brand
brand-200  → primary brand color (main CTAs, active states, logo)
brand-300  → dark brand
```

### System Colors (Neutral UI)
```
system-50   → near-white backgrounds
system-100  → subtle hover backgrounds
system-200  → borders
system-300  → secondary text, icons
system-400  → primary text
```

### Semantic Tokens (shadcn/ui CSS variables)
```
bg-background      → page background
bg-card            → card surfaces
bg-muted           → subtle backgrounds
text-foreground    → primary text
text-muted-foreground → secondary text
bg-primary         → primary action background
text-primary       → primary action text
bg-destructive     → error/danger actions
text-destructive   → error text
border-border      → default border
```

### Usage Priority
1. Use semantic tokens (`text-foreground`, `bg-muted`) for most UI
2. Use brand tokens (`text-brand-200`) for branding elements
3. Use system tokens (`text-system-300`) for layout neutrals
4. **Never** use raw Tailwind colors (`text-red-500`, `bg-gray-100`)

## shadcn/ui Components

- Base components live in `components/ui/` — **never modify them directly**
- Extend via wrapper components in the appropriate feature folder
- Use `variant` and `size` props for visual variations — do not add one-off className overrides to `components/ui/` files

```tsx
// ❌ Don't modify shadcn base
// components/ui/button.tsx ← never touch this

// ✅ Create a wrapper if you need custom behavior
// components/cart/cart-action-button.tsx
export function CartActionButton({ ... }) {
  return <Button variant="outline" size="lg" className={cn(...)} />;
}
```

## Layout Tokens

- `page-container` → custom CSS class for max-width + horizontal padding (defined in `globals.css`)
- Use `space-y-*`, `gap-*` for spacing within components
- Use `p-*`, `px-*`, `py-*` for internal padding — no custom spacing values

## Typography

Custom text utility classes defined in `globals.css`:
- `caption-text` → small/caption-level text style
- `body-text` → standard body text style

Prefer these over ad-hoc Tailwind text size combinations for consistency.

## Responsive Design

Always mobile-first:
```tsx
// ✅ Mobile-first
<div className="flex flex-col md:flex-row" />

// ❌ Avoid desktop-first
<div className="flex flex-row max-md:flex-col" />
```

## Accessibility

- Every interactive element without visible text must have `aria-label`
- Color must not be the sole differentiator (pair with icon or text)
- Use semantic HTML (`<button>` not `<div onClick>`, `<nav>` not `<div className="nav">`)
