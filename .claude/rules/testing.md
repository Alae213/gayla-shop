# Testing Strategy

This project currently has **no automated tests**. Vitest is installed but unused. The priority is establishing a test culture for critical paths.

## Test Framework

- **Unit/Integration**: Vitest + React Testing Library (installed)
- **Test location**: `__tests__/` or `*.test.ts` adjacent to source files
- **No e2e framework currently** - consider Playwright for future

## What to Test

Priority order:
1. **Utility functions** in `lib/utils.ts`, `lib/utils/cart-storage.ts`
2. **Custom hooks** - especially `hooks/use-cart.ts` (complex localStorage logic)
3. **Validation schemas** - `lib/validations.ts` (Zod tests)
4. **Critical user flows** - add to cart, checkout submission

## Test Commands

```bash
# Add to package.json first:
# "test": "vitest"

npm test              # Watch mode (requires script)
npm test -- --run    # CI mode (single run)
npm test -- path/to/file.test.ts  # Specific file
```

## Recommended Patterns

```typescript
// __tests__/cart-storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";

describe("cartStorage", () => {
  beforeEach(() => localStorage.clear());

  it("saves and retrieves cart", () => {
    const cart = { items: [{ productId: "1", quantity: 1 }], ... };
    saveCart(cart);
    expect(getCart()).toEqual(cart);
  });
});
```

```typescript
// __tests__/validations.test.ts
import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/validations";

describe("productSchema", () => {
  it("rejects negative price", () => {
    const result = productSchema.safeParse({ title: "Test", price: -10 });
    expect(result.success).toBe(false);
  });
});
```

## Rules

- **New code**: Add tests for utilities, hooks, and validation logic
- **Bug fixes**: Add regression test if the bug is non-trivial
- **Coverage target**: Not enforced, but prioritize high-value paths
- **Never**: Hit real external APIs in tests (mock everything)
- **Never**: Commit flaky tests - fix or remove them
