# Styling Standards

## Styling Approach

### ✅ ALLOWED: Tailwind Utilities + Design Tokens

**Use Tailwind utility classes with design system tokens:**

```tsx
<div className="flex items-center gap-4 p-6 bg-background border-border rounded-lg">
  <h2 className="headline-h2 text-foreground">Title</h2>
  <Button className="bg-brand-200 text-white">Submit</Button>
</div>
```

**Composition with `cn()`:**

```tsx
import { cn } from "@/lib/utils";

<button
  className={cn(
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
    isActive
      ? "bg-brand-200 text-white"
      : "bg-muted text-foreground hover:bg-accent"
  )}
>
  {children}
</button>
```

**Rule:** All conditional styling **must** use `cn()`. Never use template literals.

### ❌ NEVER ALLOWED: Inline Styles

```tsx
// ❌ Inline styles
<div style={{ backgroundColor: "white", padding: "24px" }} />
<button style={{ color: "red", fontSize: "14px" }}>Delete</button>

// ❌ React.CSSProperties prop
interface Props {
  style?: React.CSSProperties; // Never accept this
}

// ❌ CSS Modules
import styles from "./Component.module.css";
<div className={styles.container} />

// ❌ styled-components, emotion, etc.
import styled from "styled-components";
const StyledDiv = styled.div`background: white;`;
```

**Why:** Inline styles break the design system, dark mode, and create maintenance debt.

---

## Arbitrary Values

### ✅ ALLOWED: Layout-Only Arbitrary Values

**Use for dimensions, spacing when design tokens don't fit:**

```tsx
// ✅ Fixed widths/heights for layout
<div className="w-[347px] h-[200px]" />

// ✅ Custom grid columns
<div className="grid-cols-[200px_1fr_100px]" />

// ✅ Custom spacing (rare)
<div className="gap-[18px]" />
```

### ❌ NEVER ALLOWED: Arbitrary Color Values

```tsx
// ❌ Arbitrary colors
<div className="bg-[#ffffff] text-[#333333]" />
<div className="border-[#e5e7eb]" />

// ❌ Arbitrary font sizes (use typography utilities)
<h1 className="text-[32px] font-[700]" />

// ❌ Arbitrary shadows, opacity with colors
<div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]" />
```

**Rule:** If you need a color not in the design system, add it to `tailwind.config.ts` as a semantic token.

---

## Responsive Design

### ✅ ALLOWED: Mobile-First Responsive Classes

```tsx
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <div className="w-full md:w-1/2">
    <h2 className="headline-h2 md:headline-h1">Title</h2>
  </div>
</div>
```

**Breakpoints:**
- `sm:` — 640px
- `md:` — 768px
- `lg:` — 1024px
- `xl:` — 1280px

### ❌ NEVER ALLOWED: CSS Media Queries

```tsx
// ❌ Inline media queries
<style jsx>{`
  @media (min-width: 768px) {
    .container { width: 50%; }
  }
`}</style>

// ❌ Separate CSS file with media queries
```

**Why:** Tailwind responsive utilities keep breakpoints consistent and colocated with markup.

---

## Animation & Transitions

### ✅ ALLOWED: Tailwind Transitions

```tsx
<button className="transition-colors duration-200 hover:bg-brand-300">
  Hover Me
</button>

<div className="animate-fade-in">
  Content
</div>
```

**Predefined animations in `tailwind.config.ts`:**
- `animate-fade-in`
- `animate-slide-up`
- `animate-spin` (loading states)

### ❌ NEVER ALLOWED: Custom CSS Animations

```tsx
// ❌ Inline keyframes
<style>{`
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
`}</style>

// ❌ Arbitrary animation values
<div className="animate-[slideIn_0.3s_ease-in-out]" />
```

**Rule:** Add new animations to `tailwind.config.ts` if needed, don't inline them.

---

## Enforcement Checklist

Before committing:
- [ ] No `style={{}}` inline styles
- [ ] No CSS Modules, styled-components, or CSS-in-JS
- [ ] All conditional styling uses `cn()`
- [ ] No arbitrary color values (`bg-[#fff]`)
- [ ] Arbitrary values only for layout (`w-[347px]`)
- [ ] All colors use design tokens
- [ ] Responsive classes use Tailwind breakpoints
- [ ] No custom CSS files
