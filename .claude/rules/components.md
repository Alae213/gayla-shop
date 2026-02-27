# Components

## Architecture

This is a Next.js 16 App Router project with React 19. Components are organized by feature:

```
components/
├── ui/           # shadcn/ui base components
├── products/     # Product-related components
├── cart/         # Cart components
├── checkout/     # Checkout flow
├── admin/        # Admin dashboard components
└── layout/       # Header, footer, etc.
```

## Server vs Client Components

- **Server Components** (default): Data fetching, SEO content
- **Client Components**: Use `"use client"` for:
  - Hooks (`useState`, `useEffect`, custom hooks)
  - Event handlers (`onClick`, `onSubmit`)
  - Browser APIs (localStorage, DOM)
  - React libraries without SSR support

```tsx
// Client component
"use client";

import { useState } from "react";

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

```tsx
// Server component (default - no "use client")
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductList() {
  const products = useQuery(api.products.list);
  // ...
}
```

## Props & Typing

Use TypeScript interfaces for component props:

```tsx
interface ProductCardProps {
  product: {
    _id: Id<"products">;
    title: string;
    price: number;
    images: Array<{ url: string; storageId: string }>;
    status: "Active" | "Draft" | "Out of stock";
  };
}

export function ProductCard({ product }: ProductCardProps) {
  // ...
}
```

## Styling

- **Tailwind CSS** for all styling
- **shadcn/ui** base components in `components/ui/`
- Use `cn()` from `lib/utils.ts` for conditional classes:

```tsx
import { cn } from "@/lib/utils";

<Button className={cn("base-classes", isActive && "active-state")} />
```

## Data Fetching

- Use Convex `useQuery` in client components
- Pass data from server components to client components via props
- For admin pages, fetch in client components with loading states

## Import Order

1. External libs (react, convex)
2. Internal libs (@/lib, @/convex)
3. Components (@/components)
4. Assets/other

```tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
```

## File Naming

- Components: PascalCase (`ProductCard.tsx`, `OrderDetails.tsx`)
- Hooks: camelCase with `use` prefix (`useCart.ts`)
- Keep components focused - split large components
