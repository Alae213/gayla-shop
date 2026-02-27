# TypeScript

## Compiler Settings

Project uses strict TypeScript. Key settings from `tsconfig.json`:
- `strict: true` (implied by Next.js)
- `noImplicitAny: true`
- `strictNullChecks: true`

## Type Organization

- Shared types in `lib/types/`
- Component props defined in same file or `lib/types/`
- Validation types exported from `lib/validations.ts`

```typescript
// lib/types/cart.ts
export interface CartItem {
  productId: Id<"products">;
  quantity: number;
  variants: VariantSelection;
}
```

## Naming Conventions

- Interfaces: PascalCase (`ProductCardProps`)
- Types: PascalCase or prefix with `T` (`Product`, `TProduct`)
- Enums: PascalCase, use unions instead when possible
- Generics: Descriptive (`TData`, `TResponse`)

```typescript
// Good: use unions instead of enums
type ProductStatus = "Active" | "Draft" | "Out of stock";

// Avoid unless needed
enum ProductStatusEnum {
  Active = "Active",
  Draft = "Draft",
  // ...
}
```

## Type Safety Rules

- **Never use `any`** - use `unknown` if type is truly unknown
- **Always explicit return types** for functions
- **No implicit `any`** - function parameters must be typed

```typescript
// Good
function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(price);
}

// Avoid
function formatPrice(price, locale) { ... }
```

## Convex Document IDs

Use `Id<"tableName">` for typed document references:

```typescript
import { Id } from "@/convex/_generated/dataModel";

interface ProductRef {
  productId: Id<"products">;
}
```

## Utility Types

Use built-in utility types for common patterns:

```typescript
// Make all properties optional
type PartialProduct = Partial<Product>;

// Pick specific properties
type ProductSummary = Pick<Product, "title" | "price">;

// Make specific properties required
type RequiredName = Required<Product> & { name: string };
```

## Zod for Runtime Validation

Use Zod to infer types from validation schemas:

```typescript
import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
});

// Infer TypeScript type
export type ProductFormData = z.infer<typeof productSchema>;
```

## Import Aliases

The project uses path aliases:
- `@/*` maps to root
- Use `@/lib/utils` over relative paths

```typescript
// Good
import { formatPrice } from "@/lib/utils";

// Avoid
import { formatPrice } from "../../lib/utils";
```
