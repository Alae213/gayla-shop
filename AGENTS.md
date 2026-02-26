# AGENTS.md - Gayla Shop Development Guide

## Project Overview

Gayla Shop is a modern full-stack e-commerce platform for the Algerian market with delivery cost calculation and order management. Features customer storefront and admin dashboard.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Convex backend, Zod validation.

**Main Features:** Product catalog with variants, 58 wilayas delivery costs, order tracking, admin dashboard with drag-and-drop, call center tools, ZR Express integration.

---

## Build, Lint, and Test Commands

### Installation & Development
```bash
npm install                    # Install dependencies
npm run dev                    # Start Next.js with Turbopack
npm run dev:webpack           # Start with Webpack (more stable)
npx convex dev                # Start Convex backend (keep running)
```

### Building & Linting
```bash
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint
```

### Testing
```bash
npm test                       # Run all Vitest tests
npm test -- --watch           # Watch mode
npm test -- --coverage        # With coverage
npm test -- --run             # CI mode (single run)
npm test -- path/to/test.ts   # Run specific test file
```

### Database Migrations
```bash
npm run migrate:orders         # Run order migration
npm run migrate:orders:dry-run # Dry run
```

### Before Commit/PR
```bash
npm run lint && npm run build
```

---

## Code Style Guidelines

### TypeScript & Types
- Use explicit types for function parameters/return values
- Use `Id<"tableName">` from Convex for document IDs
- Define shared types in `lib/types/`

```tsx
// From components/products/product-card.tsx
interface ProductCardProps {
  product: {
    _id: Id<"products">;
    title: string;
    slug: string;
    price: number;
    images: Array<{ url: string; storageId: string }>;
    status: "Active" | "Draft" | "Out of stock";
  };
}
```

### Import Order
1. External libs (react, convex)
2. Internal libs (@/lib, @/convex)
3. Components (@/components)
4. Assets

```tsx
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
```

### File Naming
- Components: PascalCase (`ProductCard.tsx`, `OrderDetails.tsx`)
- Hooks: camelCase with `use` prefix (`useCart.ts`, `useToast.ts`)
- Utilities: camelCase (`utils.ts`, `retryFetch.ts`)
- Pages: `page.tsx` for App Router

### Component Structure
- Use `"use client"` for client components
- Use functional components with TypeScript interfaces for props

```tsx
// From components/ui/button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
```

### Validation with Zod
- Use schemas in `lib/validations.ts` for form validation
- Align with Convex schema in `convex/schema.ts`

```tsx
// From lib/validations.ts
export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be positive"),
  status: z.enum(["Active", "Draft", "Out of stock"]),
});
```

### Tailwind CSS
- Use shadcn/ui design system utilities
- Use `cn()` from `lib/utils.ts` for class merging
- Custom tokens in `tailwind.config.ts`

### Error Handling
- Use `ErrorBoundary` from `components/error-boundary.tsx`
- Wrap critical sections: `<ErrorBoundary context="Order Details"><Component /></ErrorBoundary>`
- Use try/catch for async operations

---

## Module Organization

### Directory Structure
```
app/                    # Next.js App Router (public/, admin/, api/)
components/ui/          # shadcn/ui base components
components/admin/      # Admin-specific components
components/products/    # Product components
convex/                # Backend (schema.ts, products.ts, orders.ts, auth.ts)
hooks/                 # Custom hooks (useCart.ts, useToast.ts)
lib/utils.ts           # Utilities (cn(), formatPrice())
lib/validations.ts     # Zod schemas
lib/types/             # Shared TypeScript types
providers/             # React context (ConvexProvider)
scripts/               # Migration scripts
```

### Critical Patterns
1. **Convex**: All DB ops through queries/mutations in `convex/*.ts`
2. **Forms**: React Hook Form + Zod validation
3. **Cart**: Client-side with localStorage via `useCart` hook
4. **Error Boundaries**: Wrap admin sections with `AdminErrorBoundary`

---

## Testing Guidelines

- Vitest + React Testing Library configured
- No test files currently exist
- Place tests: `__tests__/` or `*.test.ts` near code they test
- Add tests for: utility functions, complex hooks, bug fixes, critical user flows

---

## Safety Rules

### DO NOT MODIFY
- `convex/_generated/` - Auto-generated Convex types
- `.env.local` - Secrets (create from `.env.example`)
- `convex/schema.ts` - Without migration planning

### Be Careful With
- `tailwind.config.ts` - Affects entire UI
- `eslint.config.mjs` - Linting rules
- Migration scripts - Test with `--dry-run` first

---

## Environment Variables

Required in `.env.local`:
- `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` (from `npx convex dev`)
- Optional: `RESEND_API_KEY`, `ADMIN_EMAIL`, `ZR_EXPRESS_*`

---

## Working with AI Agents

### Before Making Changes
1. Read relevant files to understand codebase
2. Identify existing patterns in similar components
3. Plan and explain changes to user
4. Keep changes small and scoped

### Reference Existing Code
- `components/products/product-card.tsx` - Product components
- `hooks/use-cart.ts` - Custom hooks
- `lib/validations.ts` - Zod schemas
- `components/error-boundary.tsx` - Error handling

### When to Ask Questions
- Ambiguous business requirements
- Schema changes affecting existing data
- New features needing architecture decisions
- Payment/delivery integration changes

### Commit Messages
- Clear, descriptive (e.g., "fix: resolve product image loading in cart")

---

## Unknowns & Assumptions

- No test files exist; Vitest unused but configured
- ZR Express may use mock data in dev
- Sentry optional (DSN can be empty)
- No CI/CD pipeline configured
