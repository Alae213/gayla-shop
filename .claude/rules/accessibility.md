# Accessibility (WCAG AA)

## Color Contrast

### ✅ REQUIRED: 4.5:1 Minimum Contrast

**Text on backgrounds:**
- Body text: `text-foreground` on `bg-background` ✅ 4.5:1
- Brand text: `text-brand-200` on `bg-background` ✅ 7:1
- Muted text: `text-muted` on `bg-background` ✅ 4.5:1

**Buttons:**
- `bg-brand-200` + `text-white` ✅ 6.2:1
- `bg-destructive` + `text-white` ✅ 5.8:1

**Rule:** Never use `text-system-200` (too light) on light backgrounds.

### ❌ NEVER ALLOWED: Insufficient Contrast

```tsx
// ❌ Light gray text on white (contrast < 3:1)
<p className="text-gray-300 bg-white">Hard to read</p>

// ❌ Brand color on colored background without testing
<div className="bg-brand-100 text-brand-200">Unclear contrast</div>
```

**Tool:** Use WebAIM Contrast Checker before adding new color combinations.

---

## Form Accessibility

### ✅ REQUIRED: Label + Input Association

**Always pair `<Label>` with input `id`:**

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

<div>
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

**Select fields:**

```tsx
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<div>
  <Label htmlFor="size">Size</Label>
  <Select>
    <SelectTrigger id="size">
      <SelectValue placeholder="Select size" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="s">Small</SelectItem>
      <SelectItem value="m">Medium</SelectItem>
      <SelectItem value="l">Large</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### ❌ NEVER ALLOWED: Inputs Without Labels

```tsx
// ❌ No label
<Input placeholder="Email" />

// ❌ Label without htmlFor
<Label>Email</Label>
<Input id="email" />

// ❌ Placeholder as label
<Input placeholder="Enter your email" />
```

**Why:** Screen readers cannot announce the purpose of unlabeled inputs.

---

## Interactive Elements

### ✅ REQUIRED: Semantic HTML + ARIA

**Use shadcn `<Button>` (already accessible):**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" onClick={handleClick}>
  Submit
</Button>
```

**Icon-only buttons need `aria-label`:**

```tsx
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

<Button variant="ghost" size="icon" aria-label="Open cart">
  <ShoppingCart className="h-5 w-5" />
</Button>
```

**Custom interactive elements (rare):**

```tsx
// If you MUST use a div as a button (discouraged):
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === "Enter" && handleClick()}
  className="cursor-pointer"
>
  Custom Action
</div>
```

### ❌ NEVER ALLOWED: Non-Semantic Buttons

```tsx
// ❌ Div as button without role/tabIndex
<div onClick={handleClick} className="cursor-pointer">
  Click Me
</div>

// ❌ Icon button without aria-label
<Button variant="ghost" size="icon">
  <X className="h-4 w-4" />
</Button>

// ❌ Link styled as button without href
<a className="bg-brand-200 text-white px-4 py-2">Click Me</a>
```

**Rule:** Use `<Button>` for actions, `<Link>` for navigation. Never style one to look like the other.

---

## Semantic HTML

### ✅ REQUIRED: Proper Document Structure

```tsx
<main>
  <header>
    <nav>
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
    </nav>
  </header>

  <section>
    <h1 className="headline-h1">Page Title</h1>
    <article>
      <h2 className="headline-h2">Section</h2>
      <p className="body-text">Content</p>
    </article>
  </section>

  <footer>
    <p className="caption-text">© 2026 Gayla Shop</p>
  </footer>
</main>
```

**Heading hierarchy:**
- `<h1>` — one per page (page title)
- `<h2>` — major sections
- `<h3>` — subsections
- Never skip levels (`<h1>` → `<h3>`)

### ❌ NEVER ALLOWED: Div Soup

```tsx
// ❌ All divs, no semantic meaning
<div>
  <div>
    <div>Home</div>
    <div>Products</div>
  </div>
  <div>
    <div>Page Title</div>
    <div>Content here</div>
  </div>
</div>
```

**Why:** Screen readers rely on semantic HTML for navigation landmarks.

---

## Images & Icons

### ✅ REQUIRED: Alt Text

**Product images:**

```tsx
import Image from "next/image";

<Image
  src={product.image}
  alt={`${product.name} - ${product.category}`}
  width={300}
  height={300}
/>
```

**Decorative icons (aria-hidden):**

```tsx
import { Check } from "lucide-react";

<div>
  <Check className="h-4 w-4" aria-hidden="true" />
  <span>Success</span>
</div>
```

**Rule:** If icon conveys meaning (icon-only button), use `aria-label`. If decorative, use `aria-hidden`.

### ❌ NEVER ALLOWED: Missing Alt Text

```tsx
// ❌ No alt text
<Image src={product.image} width={300} height={300} />

// ❌ Generic alt text
<Image src={product.image} alt="product image" width={300} height={300} />
```

---

## Keyboard Navigation

### ✅ REQUIRED: Tab Order & Focus States

**All interactive elements must be keyboard-accessible:**

```tsx
// ✅ Button (already focusable)
<Button>Submit</Button>

// ✅ Link (already focusable)
<Link href="/products">Shop</Link>

// ✅ Custom focusable element
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === "Enter" && handleAction()}
  className="focus:outline-none focus:ring-2 focus:ring-brand-200"
>
  Custom
</div>
```

**Rule:** Add `focus:ring-2 focus:ring-brand-200` to all custom interactive elements.

### ❌ NEVER ALLOWED: Broken Keyboard Nav

```tsx
// ❌ Div as button without keyboard support
<div onClick={handleClick}>Click Me</div>

// ❌ Removing outline without alternative focus indicator
<button className="outline-none">Submit</button>
```

---

## Enforcement Checklist

Before committing:
- [ ] All text meets 4.5:1 contrast ratio
- [ ] All inputs have `<Label htmlFor="id">`
- [ ] Icon-only buttons have `aria-label`
- [ ] Use semantic HTML (`<main>`, `<header>`, `<nav>`, `<section>`)
- [ ] All images have descriptive `alt` text
- [ ] Decorative icons have `aria-hidden`
- [ ] Custom interactive elements have `role`, `tabIndex`, and keyboard handlers
- [ ] Focus states visible (ring or outline)
- [ ] Proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
