# API Routes & Backend

## Architecture Overview

This project uses a hybrid backend approach:

1. **Convex** (primary): All database operations through `convex/*.ts` queries/mutations
2. **Next.js Route Handlers**: External integrations (e.g., `app/api/zr-express/`)

## Convex Functions

All DB operations flow through Convex - never query DB directly from API routes or client.

```typescript
// convex/products.ts
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("products").collect();
  },
});
```

### Using Convex in Components

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const products = useQuery(api.products.list, { category: "clothing" });
const createOrder = useMutation(api.orders.create);
```

## Next.js API Routes

Location: `app/api/` - use sparingly for external integrations only.

### Route Handler Pattern

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    // Process...
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    // Never leak stack traces
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

## Input Validation Rules

- **Always validate** client input - never trust it
- Use Zod schemas from `lib/validations.ts`
- Validate in both API routes AND Convex mutations
- Reject early with clear error messages

## Authentication

- API routes: Use header-based auth (e.g., `X-API-Secret`)
- Convex: Auth handled in `convex/auth.ts`
- Admin routes: Check session/state before rendering protected content

## Error Handling

- Never expose stack traces or internal details to clients
- Use consistent error format: `{ success: false, error: "message" }`
- Log errors server-side with appropriate context

## Performance

- Convex queries: Use indexes (`.withIndex()`) for filtering
- Pagination: Use `.paginate()` for large result sets
- API routes: Implement rate limiting for public endpoints
