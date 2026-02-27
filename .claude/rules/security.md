# Security

## Principles

- **Never trust client input** - always validate server-side
- **Least privilege** - request only needed data/permissions
- **Fail closed** - deny by default, permit explicitly
- **No secrets in code** - use environment variables

## Environment Variables

- Never commit `.env.local` - it contains secrets
- Create from `.env.example`
- Required: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
- Optional: `RESEND_API_KEY`, `ADMIN_EMAIL`, `ZR_EXPRESS_API_KEY`, `ZR_EXPRESS_API_SECRET`

## Input Validation

- Validate ALL input with Zod schemas in `lib/validations.ts`
- Phone numbers: Algerian format (`05|06|07` + 8 digits)
- Price/costs: non-negative numbers only
- Validate in both API routes AND Convex mutations

```typescript
// Always validate in mutations
export const createOrder = mutation({
  args: orderSchema, // Use Zod schema
  handler: async (ctx, args) => {
    // args already validated
  },
});
```

## Authentication & Authorization

- Admin auth in `convex/auth.ts`
- API routes use header-based auth (`X-API-Secret`)
- Protected admin routes check auth before rendering

## What NOT to Log

- Never log: API keys, passwords, tokens
- Never log: Full request bodies containing PII
- Safe to log: Non-sensitive operation context, error types

## API Route Security

```typescript
// Always authenticate
function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ZR_EXPRESS_API_SECRET;
  if (!secret) return false; // fail-closed
  return request.headers.get("X-API-Secret") === secret;
}

// Rate limit public endpoints
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
```

## Common Vulnerabilities

- **XSS**: React escapes by default; avoid `dangerouslySetInnerHTML`
- **Injection**: Never concatenate user input into queries/commands
- **IDOR**: Validate ownership before allowing access
- **CSRF**: Convex handles this; for API routes, use proper CSRF tokens

## Checklist for Sensitive Changes

Before modifying auth, payments, or schema:
1. Ask for confirmation - do not proceed automatically
2. Propose a plan with rollback strategy
3. Test in staging first
4. Review for privilege escalation
