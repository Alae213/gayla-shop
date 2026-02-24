# Contributing to Gayla Shop

Thank you for considering contributing to Gayla Shop! This document outlines the process and guidelines for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Be respectful and professional in all interactions. We're building this together.

## Getting Started

### Prerequisites

- Node.js 18.17+
- Git
- A Convex account (free)
- Basic knowledge of Next.js and TypeScript

### Setup Development Environment

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/gayla-shop.git
   cd gayla-shop
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Alae213/gayla-shop.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up Convex**

   ```bash
   npx convex dev
   ```

6. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the required values.

7. **Start development server**

   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**

- `feature/` - New features (e.g., `feature/product-reviews`)
- `fix/` - Bug fixes (e.g., `fix/cart-calculation`)
- `docs/` - Documentation changes (e.g., `docs/update-setup-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/order-status-enum`)
- `test/` - Adding or updating tests (e.g., `test/product-mutations`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

- Write clear, self-documenting code
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation if needed
- Write tests for new features

### 3. Test Your Changes

Before committing:

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build the project
npm run build

# Test in the browser
npm run dev
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "type(scope): description"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Keep Your Branch Updated

Regularly sync with the main repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types that are used across files

```typescript
// Good
interface ProductVariant {
  size?: string;
  color?: string;
}

function createVariant(variant: ProductVariant): ProductVariant {
  return variant;
}

// Avoid
function createVariant(variant: any) {
  return variant;
}
```

### React Components

- Use functional components with hooks
- Name components in PascalCase
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use `"use client"` directive only when necessary

```typescript
// Good - Server Component by default
export default function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

// Client Component when needed
"use client";

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ... interactive logic
}
```

### Convex Backend

- Use descriptive function names
- Add JSDoc comments to all exported functions
- Validate inputs with Zod or Convex validators
- Handle errors gracefully
- Use transactions for multi-table operations

```typescript
/**
 * Creates a new product in the database.
 * @param title - Product title
 * @param price - Product price in DZD
 * @param status - Product status (Active, Draft, Out of stock)
 * @returns The newly created product ID
 */
export const createProduct = mutation({
  args: {
    title: v.string(),
    price: v.number(),
    status: v.union(
      v.literal("Active"),
      v.literal("Draft"),
      v.literal("Out of stock")
    ),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now(),
    });
    return productId;
  },
});
```

### Styling

- Use Tailwind CSS utility classes
- Use the `cn()` utility from `lib/utils` for conditional classes
- Keep custom CSS minimal - prefer Tailwind
- Use CSS variables defined in `globals.css` for theming

```typescript
import { cn } from "@/lib/utils";

// Good
<button
  className={cn(
    "rounded-md px-4 py-2 font-medium",
    isPrimary ? "bg-primary text-white" : "bg-secondary",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

### File Organization

- Keep related files together
- Use index files to simplify imports
- Name files consistently:
  - Components: `PascalCase.tsx`
  - Utilities: `camelCase.ts`
  - Types: `types.ts` or `schema.ts`
  - Hooks: `useCamelCase.ts`

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, missing semicolons, etc.)
- `refactor` - Code restructuring without changing functionality
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `build` - Build system or dependencies
- `ci` - CI/CD configuration

### Scope (optional)

- `products` - Product-related changes
- `orders` - Order management
- `admin` - Admin dashboard
- `ui` - UI components
- `api` - API routes
- `convex` - Backend functions
- `i18n` - Internationalization

### Examples

```bash
feat(products): add product variant selector
fix(orders): correct delivery cost calculation for Ouargla
docs(readme): update installation instructions
refactor(admin): extract order status logic into hook
test(products): add unit tests for product mutations
chore(deps): update convex to v1.32.0
```

### Commit Message Body

For complex changes, add a detailed explanation:

```
feat(orders): implement fraud detection scoring

Adds a basic fraud detection system that calculates risk scores based on:
- Number of failed orders from same phone number
- High-value orders from new customers
- Multiple orders in short time span

Score ranges from 0-100, orders > 70 are flagged for review.
```

## Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - All tests pass: `npm test`
   - No lint errors: `npm run lint`
   - App builds successfully: `npm run build`
   - Manual testing in browser

2. **Update documentation**
   - Update README if adding features
   - Add JSDoc comments to new functions
   - Update ARCHITECTURE.md if changing system design

3. **Keep commits clean**
   - Squash "fix typo" or "oops" commits
   - Rebase on latest main if needed

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Be clear and concise

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on mobile

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
Relates to #456
```

### Review Process

1. A maintainer will review your PR within 3-5 days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR

### After Merge

Delete your branch:

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

## Testing

### Unit Tests

Write tests for:

- Utility functions
- Complex business logic
- Data transformations
- Validation functions

Example:

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('calculates order total correctly', () => {
    const result = calculateTotal(1000, 350);
    expect(result).toBe(1350);
  });

  it('handles zero delivery cost', () => {
    const result = calculateTotal(1000, 0);
    expect(result).toBe(1000);
  });
});
```

### Component Tests

Test React components:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders product information', () => {
    const product = {
      _id: '1',
      title: 'Test Product',
      price: 2500,
      status: 'Active' as const,
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2500 DZD')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- products.test.ts
```

## Documentation

### JSDoc Comments

Add JSDoc for:

- All exported functions
- Complex internal functions
- Type definitions

```typescript
/**
 * Calculates the delivery cost based on wilaya and delivery type.
 * 
 * @param wilayaId - Numeric ID of the wilaya (1-58)
 * @param deliveryType - "Stopdesk" or "Domicile"
 * @returns Delivery cost in DZD
 * @throws {Error} If wilaya is not found
 * 
 * @example
 * ```ts
 * const cost = await getDeliveryCost(16, "Domicile");
 * console.log(cost); // 350
 * ```
 */
export async function getDeliveryCost(
  wilayaId: number,
  deliveryType: "Stopdesk" | "Domicile"
): Promise<number> {
  // implementation
}
```

### README Updates

Update the README when:

- Adding new features
- Changing setup process
- Modifying environment variables
- Adding new scripts

### Architecture Documentation

Update `docs/ARCHITECTURE.md` when:

- Adding new data models
- Changing data flow
- Modifying system architecture
- Adding new integrations

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues/PRs
3. Open a new issue with the "question" label

---

**Thank you for contributing to Gayla Shop! 🚀**