# CLAUDE.md - Gayla Shop

## Project Overview

Gayla Shop is a full-stack e-commerce platform for the Algerian market. Features product catalog, shopping cart, checkout with 58 wilayas delivery cost calculation, order management, and an admin dashboard.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Convex (backend/DB), Zod (validation).

## Tech Stack & Entrypoints

- **Frontend:** Next.js 16 App Router (`app/`), React 19, Tailwind CSS
- **Backend:** Convex functions (`convex/*.ts`) - all DB operations go through queries/mutations here
- **API Routes:** Next.js Route Handlers (`app/api/`)
- **Database:** Convex (document DB with schema in `convex/schema.ts`)
- **Validation:** Zod schemas in `lib/validations.ts`

**Request flow:** Next.js pages → Convex queries/mutations → Convex DB. Client-side cart uses localStorage via `hooks/use-cart.ts`.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start Next.js dev (Turbopack)
npm run dev:webpack      # Start with Webpack (more stable)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run migrate:orders   # Run order migrations
npm run migrate:orders:dry-run  # Dry run migrations
npx convex dev          # Start Convex backend (run separately)
```

## Development Rules

### Code Changes
- Use explicit TypeScript types for all function parameters/returns
- Follow import order: external → @/lib, @/convex → @/components
- Use `"use client"` for client components; prefer server components otherwise
- Use `cn()` from `lib/utils.ts` for Tailwind class merging

### Types & Validation
- Use `Id<"tableName">` from Convex for document IDs
- Align Zod schemas in `lib/validations.ts` with Convex schema in `convex/schema.ts`
- Define shared types in `lib/types/`

### Testing
- Currently no tests exist. Add tests for utility functions, hooks, and critical flows.
- No test script configured in package.json.

### Git & PRs
- Keep changes small and focused
- Run `npm run lint && npm run build` before committing
- Write clear commit messages (e.g., "fix: resolve product image loading in cart")

## Safety & Restrictions

**Ask before attempting:**
- Modifying `convex/schema.ts` - requires migration planning
- Running migrations (`npm run migrate:*`) - always use `--dry-run` first
- Changing auth/permissions logic in `convex/auth.ts`
- Modifying `.env.local` or adding secrets
- Changing payment or ZR Express delivery integration

**Never modify:**
- `convex/_generated/` - auto-generated Convex types

## Detailed Rules

See `.claude/rules/*.md` for conventions:
- `@.claude/rules/testing.md` - Testing guidelines
- `@.claude/rules/api-routes.md` - API route patterns
- `@.claude/rules/components.md` - React component conventions
- `@.claude/rules/database.md` - Convex DB patterns
- `@.claude/rules/typescript.md` - TypeScript conventions
- `@.claude/rules/security.md` - Security guidelines

## How I Work

- Ask clarifying questions when requirements are ambiguous
- Prefer incremental, focused changes over large refactors
- For significant changes, outline a plan first and wait for confirmation
- Show concrete file paths and code snippets in responses
- Reference existing code patterns in the repo before introducing new patterns
- Use `AGENTS.md` for additional development guidance
