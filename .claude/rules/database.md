# Database (Convex)

## Overview

Convex is the primary data layer. All database operations go through Convex queries and mutations in `convex/*.ts`. Never access the database directly from API routes or client components.

## Schema Location

`convex/schema.ts` defines tables:
- `products` - Product catalog with variants
- `orders` - Customer orders with line items, status tracking
- `deliveryCosts` - 58 wilayas delivery pricing
- `siteContent` - Homepage/contact content
- `adminUsers` - Admin authentication

## Schema Conventions

```typescript
// convex/schema.ts
export default defineSchema({
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    price: v.number(),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Out of stock")
    ),
    // ... fields
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
});
```

- Use `v.id("tableName")` for references
- Always add indexes for fields used in filters
- Use unions for enum-like fields

## Query Patterns

```typescript
// Simple query
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();
    if (args.category) {
      products = products.filter(p => p.category === args.category);
    }
    return products;
  },
});

// With index
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();
  },
});
```

## Mutation Patterns

```typescript
export const create = mutation({
  args: { title: v.string(), price: v.number() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", {
      title: args.title,
      price: args.price,
      // ... defaults
    });
    return id;
  },
});
```

## Document IDs

Use `Id<"tableName">` from Convex for typed IDs:

```typescript
import { Id } from "@/convex/_generated/dataModel";

interface ProductRef {
  productId: Id<"products">;
}
```

## Migrations

- Schema changes require migration planning
- Migration scripts in `scripts/` and `convex/migrations/`
- **Always run with `--dry-run` first**
- **Ask for confirmation before running any migration**

## Danger Zones

**NEVER do without explicit approval:**
- Modify `convex/schema.ts`
- Run migrations that add/drop tables or fields
- Bulk delete operations
- Schema-breaking changes

**NEVER modify:**
- `convex/_generated/` - auto-generated types
