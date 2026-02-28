# Component Architecture

## Base Components

### ✅ ALLOWED: shadcn/ui Components

**Import from `@/components/ui/*` ONLY:**

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
```

**Usage:**
```tsx
<Button variant="default" size="lg">
  Add to Cart
</Button>

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### ❌ NEVER ALLOWED: Raw HTML Elements

```tsx
// ❌ Raw button
<button className="bg-blue-500 text-white px-4 py-2">
  Click Me
</button>

// ❌ Raw input
<input type="text" className="border p-2" />

// ❌ Raw select
<select className="border">
  <option>Option 1</option>
</select>

// ❌ Raw dialog/modal HTML
<div className="fixed inset-0 bg-black/50">
  <div className="bg-white p-4">Modal content</div>
</div>
```

**Why:** shadcn/ui provides accessible, styled, consistent components. Raw HTML creates design drift and accessibility issues.

---

## Custom Components

### ✅ ALLOWED: Extend shadcn with CVA

If you need a custom variant **not** in shadcn:

```tsx
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const customButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
  {
    variants: {
      intent: {
        primary: "bg-brand-200 text-white hover:bg-brand-300",
        outline: "border-2 border-brand-200 text-brand-200 hover:bg-brand-50",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "sm",
    },
  }
);

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof customButtonVariants> {}

export function CustomButton({
  className,
  intent,
  size,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={cn(customButtonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
```

**Rule:** Custom components **must**:
1. Use CVA for variants
2. Accept `className` prop for extension
3. Use design tokens (no hardcoded colors)
4. Follow accessibility patterns (see `accessibility.md`)

### ❌ NEVER ALLOWED: Ad-hoc Styled Elements

```tsx
// ❌ Random div with button styles
<div
  onClick={handleClick}
  className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
>
  Click Me
</div>

// ❌ Custom component without CVA
function MyButton({ children }) {
  return (
    <button className="bg-red-500 text-white p-2">
      {children}
    </button>
  );
}
```

---

## Component Composition

### ✅ ALLOWED: Compose shadcn Components

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="headline-h3">{product.name}</h3>
        <Badge variant="secondary">{product.category}</Badge>
      </CardHeader>
      <CardContent>
        <p className="body-text text-muted">{product.description}</p>
        <Button variant="default" size="lg">
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
```

### ❌ NEVER ALLOWED: Mixing Raw HTML with shadcn

```tsx
// ❌ Mixing Button with raw <button>
<Card>
  <Button>Correct</Button>
  <button className="bg-blue-500">Wrong</button>
</Card>
```

---

## Enforcement Checklist

Before committing:
- [ ] No raw `<button>`, `<input>`, `<select>`, `<textarea>`
- [ ] All interactive elements use shadcn components
- [ ] Custom components use CVA for variants
- [ ] Custom components accept `className` prop
- [ ] No ad-hoc styled divs pretending to be buttons
