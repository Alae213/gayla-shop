# Architecture

## Folder Structure

```
gayla-shop/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public layout group (header + footer)
│   │   ├── products/       # Product listing + detail pages
│   │   ├── checkout/       # Checkout page
│   │   └── order-confirmation/  # Post-order confirmation
│   ├── admin/              # Admin dashboard (no public layout)
│   ├── api/                # Route Handlers (external integrations only)
│   ├── layout.tsx          # Root layout (providers only)
│   ├── globals.css         # Global styles
│   ├── error.tsx           # Segment error boundary
│   └── global-error.tsx    # Root error boundary
├── components/
│   ├── ui/                 # shadcn/ui base components — do NOT modify directly
│   ├── layout/             # Header, Footer (global layout)
│   ├── cart/               # Cart feature components
│   ├── checkout/           # Checkout feature components
│   ├── product/            # Single product components (detail, add-to-cart)
│   ├── products/           # Product list/grid components
│   └── admin/              # Admin-only components
├── hooks/                  # Custom React hooks (use-*.ts)
├── lib/
│   ├── types/              # Shared TypeScript types (cart.ts, etc.)
│   ├── utils/              # Utility functions (cart-storage.ts, etc.)
│   ├── utils.ts            # cn() helper — do NOT rename, imported everywhere
│   ├── constants.ts        # App-wide constants (WILAYAS, COMMUNES_BY_WILAYA)
│   └── validations.ts      # Zod schemas
├── convex/                 # Convex backend (queries, mutations, schema)
├── providers/              # React context providers (root-level)
└── styles/                 # Additional CSS modules if needed
```

## Layer Rules

### UI Layer (`components/`)
- Render data passed via props
- Handle user interaction events
- NO direct Convex calls in presentational components
- NO business logic (validation, order creation, delivery cost calculation)
- NO navigation logic beyond simple `router.push` after an action completes

### Feature Hook Layer (`hooks/`)
- Own state and side effects for a feature
- May call Convex `useQuery` / `useMutation`
- May call `router.push` after mutations
- Must be named `use-*.ts` and return a clean interface
- Example: `use-checkout.ts` owns all checkout form state, validation, and submission

### Domain/Utility Layer (`lib/`)
- Pure functions — no React, no hooks, no side effects
- Types live in `lib/types/`
- Storage utilities in `lib/utils/`
- Validation schemas in `lib/validations.ts`
- Constants in `lib/constants.ts`

### Infrastructure Layer (`convex/`)
- All database queries and mutations
- Schema definitions
- Never import from `components/` or `hooks/`

## File Naming

| Type | Convention | Example |
|---|---|---|
| Components | kebab-case | `cart-item-card.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-cart.ts` |
| Types | kebab-case | `cart.ts` |
| Utilities | kebab-case | `cart-storage.ts` |
| Pages | Next.js convention | `page.tsx`, `layout.tsx` |
| Constants | SCREAMING_SNAKE_CASE for values | `CART_MAX_ITEMS` |

> ⚠️ Rule files reference PascalCase for components — the actual codebase uses kebab-case. **Kebab-case is the enforced standard.**

## Route Group Rules

- All public-facing pages (shop, products, checkout, order-confirmation) **must** live inside `app/(public)/` to share the Header + Footer layout
- Admin pages live in `app/admin/` — separate layout, no public header
- `app/layout.tsx` contains providers only — no UI elements

## Module Boundary Rules

- `components/ui/` → no imports from feature components
- `components/cart/` → may import from `components/ui/`, `hooks/`, `lib/`
- `components/checkout/` → may import from `components/ui/`, `hooks/`, `lib/`
- `hooks/` → may import from `lib/`, `convex/`; must NOT import from `components/`
- `lib/` → no imports from `hooks/`, `components/`, `convex/`
- `convex/` → no imports from anything outside `convex/`

```
components → hooks → lib
components → lib
hooks → lib
hooks → convex
NEVER: lib → hooks, hooks → components, convex → components
```

## God Component Rule

A component is a **God Component** if it has more than 2 of these:
- More than 5 `useState` calls
- Calls `useMutation` or `useQuery` directly
- Contains a `validate()` function
- Makes a `router.push` decision
- Exceeds ~150 lines of JSX

**Remediation:** Extract logic to a `use-[feature].ts` hook. The component becomes a thin UI shell.

## Component Naming: `product/` vs `products/`

- `components/product/` → Components for a **single product** (detail view, add-to-cart button, variant selector)
- `components/products/` → Components for a **list of products** (grid, filter bar, product card in listing)

Never cross-place components between these two directories.
