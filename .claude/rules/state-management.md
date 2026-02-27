# State Management

## Principle: State Lives at the Right Level

Always use the **lowest level of state** that satisfies the need. Escalate only when required.

```
Level 1: useState inside component        → UI-only state (open/closed, loading)
Level 2: Custom hook                       → Feature state shared by a few components
Level 3: React Context / Zustand           → App-wide shared state (cart, auth)
Level 4: Server state (Convex useQuery)   → Data from the database
```

## Level 1 — Local `useState`

Use for:
- Open/closed toggles (modals, dropdowns, menus)
- Loading spinners during async operations
- Form input values (unless extracted to a hook)

```tsx
// ✅ Correct — local UI state
const [cartOpen, setCartOpen] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
```

Do NOT use local state for:
- Cart items (needs persistence)
- Data shared across 2+ unrelated components

## Level 2 — Custom Hooks

Extract to a hook when:
- State + logic is used in 2+ components
- A component has 3+ related `useState` calls
- A component mixes state, validation, and async calls

**Naming convention:** `use-[feature].ts` in `hooks/`

```tsx
// ✅ Feature logic extracted to hook
// hooks/use-checkout.ts
export function useCheckout() {
  const [form, setForm] = useState<CheckoutFormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createOrder = useMutation(api.orders.create);

  function validate(): boolean { ... }
  async function submit(): Promise<void> { ... }

  return { form, setForm, errors, isSubmitting, submit };
}

// components/checkout/checkout-form.tsx — thin UI shell
export function CheckoutForm() {
  const { form, setForm, errors, isSubmitting, submit } = useCheckout();
  return <form onSubmit={submit}>...</form>;
}
```

## Level 3 — Shared App State (Cart)

The cart uses `localStorage` persistence via `hooks/use-cart.ts`.

### Current Implementation

`useCart()` is a stateful hook backed by `localStorage`. Every component calling `useCart()` loads cart from storage on mount and syncs on update.

### ⚠️ Known Limitation

`useCart()` uses `useState` internally — multiple components calling it get **separate state instances**. They stay in sync only because both read/write to the same `localStorage` key. This is an implicit contract, not true reactive shared state.

**If two components update the cart simultaneously, they may diverge.** The fix is to migrate to a React Context or Zustand store.

### Migration Path (when needed)

```tsx
// Future: CartContext in providers/cart-provider.tsx
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartState(); // internal hook
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
```

Until this migration happens: **do not add more useState-based shared state hooks.** Any new shared state must use Context or Zustand.

## Level 4 — Server State (Convex)

Use `useQuery` / `useMutation` from `convex/react` **only inside hooks**, not directly in components.

```tsx
// ❌ Forbidden — Convex call directly in UI component
export function AddToCartButton({ productId }) {
  const product = useQuery(api.products.getById, { id: productId }); // ← wrong
  ...
}

// ✅ Correct — parent fetches, passes as prop
export function ProductPage({ slug }) {
  const product = useQuery(api.products.getBySlug, { slug });
  return <AddToCartButton variantGroups={product?.variantGroups} />;
}
```

**Rule:** If a component already exists on a page where the data is already fetched, pass it as a prop. Do not issue a duplicate query.

## Prop Drilling

- 1–2 levels: prop drilling is acceptable
- 3+ levels: lift to a hook, Context, or Zustand store

```tsx
// ❌ Too deep — CartContext should be used instead
<Page cart={cart}>
  <Section cart={cart}>
    <Panel cart={cart}>
      <Item cart={cart} />
```

## Data Flow Rules

1. **Unidirectional** — data flows parent → child via props
2. **Events flow up** — children call callbacks to notify parents
3. **Never mutate props** — always return new state objects
4. **Async state** — always handle `loading`, `error`, and `data` states

```tsx
// ✅ Always handle all async states
if (!isLoaded) return <Skeleton />;
if (isEmpty) return <EmptyState />;
return <CartItems items={items} />;
```

## React Keys

Never use `JSON.stringify()` as a key. It is slow and produces unstable output if object key order changes.

```tsx
// ❌ Forbidden
key={`${item.productId}-${JSON.stringify(item.variants)}`}

// ✅ Use the existing utility
import { getCartItemKey } from "@/lib/types/cart";
key={getCartItemKey(item)}
```

## `useCallback` and `useMemo`

- Use `useCallback` for functions passed as props to memoized children or used in `useEffect` dependency arrays
- Use `useMemo` for expensive computations (e.g., filtering large arrays)
- **Do NOT wrap every function in `useCallback`** — it has a cost. Only use it when you can identify a concrete re-render problem

```tsx
// ✅ Justified — syncCart is used in useEffect-like operations
const syncCart = useCallback((newCart: CartState) => {
  saveCart(newCart);
}, []);

// ❌ Premature — no memoization benefit here
const handleClose = useCallback(() => setOpen(false), []);
```
