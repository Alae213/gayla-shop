# Component Adoption Examples

Real-world examples of adopting composite components in existing code.

---

## Example 1: Cart Empty State

### Before (Manual Markup)
```tsx
// components/cart/cart-side-panel.tsx
{isEmpty ? (
  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
      <ShoppingBag className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
    <p className="text-sm text-muted-foreground mb-6">
      Add products to your cart to continue shopping
    </p>
    <Button
      onClick={() => onOpenChange(false)}
      variant="outline"
    >
      Continue Shopping
    </Button>
  </div>
) : (
  // Cart items...
)}
```

### After (Using EmptyState)
```tsx
// components/cart/cart-side-panel.tsx
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";

{isEmpty ? (
  <EmptyState
    icon={ShoppingBag}
    title="Your cart is empty"
    description="Add products to your cart to continue shopping"
    action={{
      label: "Continue Shopping",
      onClick: () => onOpenChange(false),
      variant: "outline",
    }}
    size="md"
  />
) : (
  // Cart items...
)}
```

**Benefits:**
- ✅ 50% less code
- ✅ Consistent empty state styling
- ✅ Proper ARIA attributes built-in
- ✅ Easier to maintain

---

## Example 2: Admin Dashboard

### Before (Manual Layout)
```tsx
// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
        <Button>Add Product</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">$45,231</div>
          <div className="text-sm text-success-200 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +12.5% from last month
          </div>
        </div>
        {/* Repeat for other stats... */}
      </div>
    </div>
  );
}
```

### After (Using PageHeader + StatsCard)
```tsx
// app/admin/page.tsx
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back, Admin"
        actions={<Button>Add Product</Button>}
        size="md"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total Revenue"
          value="$45,231"
          icon={DollarSign}
          trend={{ type: "up", value: "+12.5% from last month" }}
        />
        <StatsCard
          label="Active Orders"
          value={142}
          icon={ShoppingCart}
          trend={{ type: "down", value: "-3.2%" }}
        />
        <StatsCard
          label="Total Users"
          value="8,492"
          icon={Users}
          trend={{ type: "neutral", value: "No change" }}
        />
      </div>
    </div>
  );
}
```

**Benefits:**
- ✅ 70% less code
- ✅ Consistent dashboard styling
- ✅ Trend indicators standardized
- ✅ Easy to add new stats
- ✅ Responsive grid built-in

---

## Example 3: Product Detail Page

### Before (Manual Price & Quantity)
```tsx
// app/products/[slug]/page.tsx
export default function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      {/* Price */}
      <div className="flex items-baseline gap-2 mb-4">
        {product.compareAtPrice && (
          <span className="text-sm line-through text-muted-foreground">
            ${product.compareAtPrice.toFixed(2)}
          </span>
        )}
        <span className="text-2xl font-bold">
          ${product.price.toFixed(2)}
        </span>
        {product.compareAtPrice && (
          <span className="text-sm bg-destructive text-destructive-foreground px-2 py-1 rounded">
            -
            {Math.round(
              ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
            )}
            %
          </span>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="border rounded-md p-2 hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
          className="w-16 text-center border rounded-md p-2"
        />
        <button
          onClick={() => setQuantity(Math.min(99, quantity + 1))}
          disabled={quantity >= 99}
          className="border rounded-md p-2 hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button onClick={() => addToCart(product, quantity)}>
        Add to Cart
      </Button>
    </div>
  );
}
```

### After (Using PriceDisplay + QuantityInput)
```tsx
// app/products/[slug]/page.tsx
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Button } from "@/components/ui/button";

export default function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <PriceDisplay
        amount={product.price}
        compareAt={product.compareAtPrice}
        showDiscount
        variant="large"
        className="mb-4"
      />

      <QuantityInput
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={99}
        size="md"
        className="mb-6"
      />

      <Button onClick={() => addToCart(product, quantity)}>
        Add to Cart
      </Button>
    </div>
  );
}
```

**Benefits:**
- ✅ 80% less code
- ✅ Proper currency formatting (Intl.NumberFormat)
- ✅ Automatic discount calculation
- ✅ Keyboard accessible quantity input
- ✅ Min/max validation built-in
- ✅ ARIA labels included

---

## Example 4: Admin Product List

### Before (Manual Status + Empty State)
```tsx
// app/admin/products/page.tsx
export default function AdminProducts({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No products yet</h2>
        <p className="text-muted-foreground mb-6">Create your first product to get started</p>
        <Button onClick={() => router.push("/admin/products/new")}>
          Add Product
        </Button>
      </div>
    );
  }

  return (
    <div>
      {products.map((product) => (
        <div key={product._id} className="flex items-center gap-4 p-4 border rounded">
          <span>{product.title}</span>
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              product.status === "Active" && "bg-success-100 text-success-200",
              product.status === "Draft" && "bg-muted text-muted-foreground",
              product.status === "Out of stock" && "bg-error-100 text-error-200"
            )}
          >
            {product.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### After (Using EmptyState + StatusBadge)
```tsx
// app/admin/products/page.tsx
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Package } from "lucide-react";

export default function AdminProducts({ products }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Create your first product to get started"
        action={{
          label: "Add Product",
          onClick: () => router.push("/admin/products/new"),
        }}
        size="lg"
      />
    );
  }

  return (
    <div>
      {products.map((product) => (
        <div key={product._id} className="flex items-center gap-4 p-4 border rounded">
          <span>{product.title}</span>
          <StatusBadge
            status={product.status === "Active" ? "success" : product.status === "Draft" ? "pending" : "error"}
            label={product.status}
            icon
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ 60% less code
- ✅ Consistent status styling
- ✅ Reusable across admin pages
- ✅ Icons automatically included
- ✅ WCAG AA color contrast

---

## Example 5: Search Bar

### Before (Manual Search Input)
```tsx
// components/products/product-search.tsx
export default function ProductSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full h-10 pl-10 pr-10 border rounded-md"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

### After (Using SearchInput)
```tsx
// components/products/product-search.tsx
import { SearchInput } from "@/components/ui/search-input";

export default function ProductSearch() {
  const [query, setQuery] = useState("");

  return (
    <SearchInput
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onClear={() => setQuery("")}
      placeholder="Search products..."
      size="md"
    />
  );
}
```

**Benefits:**
- ✅ 75% less code
- ✅ Clear button appears automatically
- ✅ Proper ARIA attributes
- ✅ Keyboard accessible
- ✅ Consistent sizing

---

## Adoption Strategy

### Phase 1: High-Traffic Pages
Adopt composites in most-visited pages first:
1. Product detail pages (PriceDisplay, QuantityInput)
2. Cart pages (EmptyState, QuantityInput)
3. Product list pages (SearchInput, EmptyState)

### Phase 2: Admin Pages
Standardize admin interface:
1. Dashboard (PageHeader, StatsCard)
2. Product management (StatusBadge, EmptyState)
3. Order management (StatusBadge, SearchInput)

### Phase 3: Edge Cases
Handle remaining special cases:
1. Checkout flow (LoadingButton, PriceDisplay)
2. User profile (PageHeader)
3. Settings pages (ThemeToggle)

---

## Migration Checklist

When adopting composites:

- [ ] Identify repeated UI patterns
- [ ] Find matching composite component
- [ ] Import composite
- [ ] Replace manual markup
- [ ] Pass props (check TypeScript types)
- [ ] Test functionality
- [ ] Test dark mode
- [ ] Test keyboard navigation
- [ ] Remove old code
- [ ] Update tests if any

---

**Last Updated:** Feb 28, 2026 03:00 AM WAT  
**Status:** Phase 3 In Progress
