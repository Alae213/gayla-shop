# Theme Consistency

## Color Usage

### ✅ ALLOWED: Design System Tokens

**Semantic colors** (support dark mode via CSS variables):
- `bg-background` — page/card backgrounds
- `text-foreground` — primary text color
- `border-border` — borders and dividers
- `bg-brand-200` — primary brand color (CTA buttons, active states)
- `text-brand-200` — brand text (links, highlights)
- `bg-muted` / `text-muted` — secondary UI elements
- `bg-accent` / `text-accent` — highlighted sections
- `bg-destructive` / `text-destructive` — error states

**System colors** (neutral palette):
- `bg-system-50` through `bg-system-400` — grays
- `text-system-300` / `text-system-400` — text hierarchy

**Usage:**
```tsx
<div className="bg-background text-foreground border-border">
  <button className="bg-brand-200 text-white">
    Submit
  </button>
</div>
```

### ❌ NEVER ALLOWED

**Hardcoded colors:**
```tsx
// ❌ Direct hex values
<div style={{ backgroundColor: "#ffffff" }} />
<div className="bg-[#fff]" />

// ❌ Direct Tailwind color values
<div className="bg-blue-500 text-gray-700" />
<div className="border-slate-300" />

// ❌ Inline styles
<button style={{ color: "red" }}>Delete</button>
```

**Why:** These break dark mode, ignore the design system, and create maintenance debt.

---

## Typography

### ✅ ALLOWED: Typography Utilities

**Defined in `tailwind.config.ts`:**
- `headline-h1` — page titles (32px, extrabold)
- `headline-h2` — section headers (24px, bold)
- `headline-h3` — subsection headers (20px, semibold)
- `body-text` — paragraphs, descriptions (16px, normal)
- `caption-text` — small UI text (14px, normal)
- `label-text` — form labels (14px, medium)

**Usage:**
```tsx
<h1 className="headline-h1 text-foreground">Welcome</h1>
<p className="body-text text-muted">Description here</p>
<span className="caption-text text-system-300">Metadata</span>
```

### ❌ NEVER ALLOWED

```tsx
// ❌ Raw font sizes
<h1 className="text-3xl font-bold">Title</h1>
<p style={{ fontSize: "16px" }}>Text</p>

// ❌ Arbitrary font weights without semantic class
<span className="text-[15px] font-[550]">Custom</span>
```

**Why:** Typography utilities ensure consistency, responsive scaling, and maintainability.

---

## Dark Mode Support

All theme tokens automatically support dark mode via CSS variables defined in `styles/globals.css`.

**Correct:**
```tsx
// ✅ Automatically adapts to dark mode
<Card className="bg-background border-border">
  <p className="text-foreground">Content</p>
</Card>
```

**Wrong:**
```tsx
// ❌ Breaks in dark mode
<Card className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
  <p className="text-black dark:text-white">Content</p>
</Card>
```

**Rule:** Never use `dark:` modifier with hardcoded colors. The design system handles dark mode.

---

## Enforcement Checklist

Before committing:
- [ ] No `bg-[#...]` or `text-[#...]` in className
- [ ] No `style={{ color: ..., backgroundColor: ... }}`
- [ ] No raw Tailwind color values (`bg-blue-500`, `text-gray-700`)
- [ ] All colors use semantic tokens (`bg-background`, `text-brand-200`)
- [ ] All text uses typography utilities (`headline-h1`, `body-text`)
- [ ] No `dark:` modifiers with hardcoded colors
