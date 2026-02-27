# Components

## Architecture

This is a Next.js App Router project with React 19 and Convex. Components are organized by feature:

```
components/
├── ui/           # shadcn/ui base components
├── product/      # Single product components (detail, add-to-cart, variant selector)
├── products/     # Product list and grid components
├── cart/         # Cart panel and cart item components
├── checkout/     # Checkout form and cart summary
├── admin/        # Admin dashboard components
└── layout/       # Header, Footer
```

> `product/` = single item scope. `products/` = list/grid scope. Never mix them.

## Server vs Client Components

- **Server Components** (default, no directive): Used for layout shells, static content, SEO
- **Client Components** (`"use client"`): Required for hooks, event handlers, browser APIs

```tsx
// ✅ Client component — uses hooks and event handlers
"use client";
import { useState } from "react";

export function AddToCartButton({ productId, variantGroups }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  // ...
}
```

```tsx
// ✅ Server component — renders static data, no hooks needed
// NO "use client" directive
export async function ProductPageShell({ slug }: { slug: string }) {
  return (
    <main>
      <ProductDetails slug={slug} />
    </main>
  );
}
```

> ⚠️ `useQuery` from `convex/react` is a **client-only hook** — components using it require `"use client"`. There is no server-side Convex `useQuery`. Use `preloadQuery` (Convex) or pass data from a parent client component for server-rendered data.

## Component Responsibilities

Each component must have a **single responsibility**:

| Type | Responsibility | Where |
|---|---|---|
| Page (`page.tsx`) | Compose feature components, handle route params | `app/` |
| Feature component | Render a specific UI section, delegate logic to hooks | `components/[feature]/` |
| Base component | Atomic UI (button, input, badge) | `components/ui/` |
| Layout component | Page-level structure (header, footer) | `components/layout/` |

**God Component rule:** If a component contains validation logic, mutation calls, AND navigation — extract logic to a `use-[feature].ts` hook. See `architecture.md` for the full rule.

## Props & Typing

Always define props with TypeScript interfaces:

```tsx
interface CartItemCardProps {
  item: CartItem;
  className?: string;
}

export function CartItemCard({ item, className }: CartItemCardProps) {
  // ...
}
```

- `className?: string` — always accept for style extension
- `onSuccess?: () => void` — use callback props for parent notification
- Never accept `style?: React.CSSProperties` — enforces design system compliance

## Styling

- **Tailwind CSS** for all styling — no inline styles, no CSS modules
- **`cn()`** from `@/lib/utils` for ALL conditional class logic
- See `design-system.md` for token usage and the `cn()` rule

```tsx
import { cn } from "@/lib/utils";

<button
  className={cn(
    "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors",
    isActive
      ? "border-primary bg-primary/5 text-primary"
      : "border-muted hover:border-primary/40"
  )}
/>
```

## Data Fetching

- Fetch data as high as possible in the tree, then pass down via props
- Do NOT call `useQuery` inside a button or leaf component that already has access to the data from its parent
- For admin pages, fetch in the page or a dedicated data hook

```tsx
// ❌ Redundant query in leaf component
export function AddToCartButton({ productId }) {
  const product = useQuery(api.products.getById, { id: productId }); // wrong
}

// ✅ Parent fetches, passes data down
export function ProductPage({ slug }) {
  const product = useQuery(api.products.getBySlug, { slug });
  return <AddToCartButton variantGroups={product?.variantGroups} />;
}
```

## File Naming

- Components: **kebab-case** (`cart-item-card.tsx`, `checkout-form.tsx`)
- Hooks: **kebab-case** with `use-` prefix (`use-cart.ts`, `use-checkout.ts`)
- One component per file
- File name must match the exported component name (kebab version)

## Import Order

1. React and Next.js (`react`, `next/navigation`, `next/image`)
2. External libraries (`convex/react`, `lucide-react`, `sonner`)
3. Internal generated (`@/convex/_generated/api`)
4. Internal lib (`@/lib/types`, `@/lib/utils`, `@/lib/constants`)
5. Internal hooks (`@/hooks/use-cart`)
6. Internal components (`@/components/ui/button`)

```tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
```

## Accessibility Checklist

- `aria-label` on all icon-only buttons
- `disabled` prop + visual indicator during async operations
- Keyboard-navigable interactive elements
- `alt` text on all `<Image>` components
