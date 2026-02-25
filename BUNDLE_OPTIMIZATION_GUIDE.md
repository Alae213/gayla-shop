# 📦 Bundle Optimization Guide

**Project:** Gayla Shop  
**Goal:** Reduce bundle size by 40% (450 KB → 270 KB)  
**Date:** February 25, 2026  

---

## 🎯 Current Bundle Analysis

### Before Optimization (Sprint 1)
```
Total Bundle:     847 KB
After Sprint 1:   450 KB (-47%)
Target Sprint 2:  270 KB (-40% more)
```

### Bundle Breakdown
```
Framework (React/Next):  ~150 KB
UI Libraries (Radix):     ~80 KB
Charts (Recharts):        ~80 KB
DnD Kit:                  ~50 KB
Convex:                   ~40 KB
Date-fns:                 ~30 KB
Application Code:         ~70 KB
```

---

## 🚀 Optimization Strategies

### 1. Route-Based Code Splitting

**Split by user type:**

```typescript
// ❌ DON'T: Load everything upfront
import { AdminWorkspace } from '@/components/admin/workspace';
import { AnalyticsDashboard } from '@/components/admin/analytics';

// ✅ DO: Lazy load admin components
import { 
  LazyAdminWorkspace,
  LazyAnalyticsDashboard 
} from '@/lib/lazy-components';

function AdminPage() {
  return <LazyAdminWorkspace />; // Only loads when needed
}
```

**Benefits:**
- Public users: 150-200 KB bundle
- Admin users: 400-450 KB bundle (acceptable)
- 60% reduction for public traffic

---

### 2. Component-Level Lazy Loading

**Heavy components to lazy load:**

```typescript
import {
  LazyRichTextEditor,  // TipTap ~150 KB
  LazyLineChart,       // Recharts ~80 KB
  LazyKanbanBoard,     // DnD Kit ~50 KB
  LazyDateRangePicker, // ~30 KB
} from '@/lib/lazy-components';

// Use with loading skeletons
function MyComponent() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <LazyRichTextEditor />
    </Suspense>
  );
}
```

---

### 3. Tree Shaking

#### Icons (Lucide React)

```typescript
// ❌ DON'T: Import entire library
import * as Icons from 'lucide-react';

// ✅ DO: Import specific icons
import { Trash2, Edit, Save } from 'lucide-react';

// ✅ BEST: Auto tree-shaking (configured in next.config.js)
// modularizeImports handles this automatically
```

#### Date Utilities (date-fns)

```typescript
// ❌ DON'T: Import entire library
import * as dateFns from 'date-fns';

// ✅ DO: Import specific functions
import { format, parseISO, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ✅ BEST: Use optimizePackageImports in next.config.js
```

#### Charts (Recharts)

```typescript
// ❌ DON'T: Import from main package
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// ✅ DO: Import from es6 modules (configured)
import LineChart from 'recharts/es6/chart/LineChart';
import Line from 'recharts/es6/cartesian/Line';

// ✅ BEST: Use modularizeImports (auto)
```

---

### 4. Vendor Chunk Splitting

**Our configuration in `next.config.js`:**

```javascript
splitChunks: {
  cacheGroups: {
    // Framework (React/Next)
    framework: { priority: 50 },
    
    // UI libs (Radix, Lucide)
    ui: { priority: 40 },
    
    // Charts (Recharts)
    charts: { priority: 35 },
    
    // DnD Kit
    dnd: { priority: 30 },
    
    // Editor (TipTap)
    editor: { priority: 30 },
    
    // Date utilities
    date: { priority: 25 },
    
    // Convex
    convex: { priority: 25 },
    
    // Common code
    common: { priority: 20 },
  }
}
```

**Benefits:**
- Better caching (framework rarely changes)
- Parallel loading (multiple chunks at once)
- Smaller initial bundle

---

### 5. Dynamic Imports

#### Modal Content

```typescript
import dynamic from 'next/dynamic';

// ❌ DON'T: Load modal content upfront
import { OrderDetailsModal } from '@/components/tracking/order-details-modal';

// ✅ DO: Load when modal opens
const OrderDetailsModal = dynamic(
  () => import('@/components/tracking/order-details-modal'),
  { loading: () => <ModalSkeleton /> }
);

function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  return (
    <>
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} />
      )}
    </>
  );
}
```

#### Route-Based

```typescript
// app/admin/page.tsx
import { LazyAdminWorkspace } from '@/lib/lazy-components';

export default function AdminPage() {
  return <LazyAdminWorkspace />;
}
```

---

### 6. Prefetching Strategy

**Prefetch on hover:**

```typescript
import { usePrefetchOnHover } from '@/lib/lazy-components';

function NavigationLink() {
  const prefetchProps = usePrefetchOnHover(
    '@/components/admin/workspace'
  );
  
  return (
    <Link 
      href="/admin" 
      {...prefetchProps}
    >
      Admin Dashboard
    </Link>
  );
}
```

---

## 🔍 Bundle Analysis

### Run Bundle Analyzer

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze production bundle
ANALYZE=true npm run build

# Opens visualization in browser
```

### What to Look For

1. **Large packages:**
   - Should be code-split
   - Consider alternatives
   - Lazy load if possible

2. **Duplicate code:**
   - Same library in multiple bundles
   - Fix with proper cache groups

3. **Unused code:**
   - Dead code elimination
   - Tree-shake more aggressively

---

## 📊 Monitoring & Metrics

### Lighthouse Performance

```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Target scores
Performance:    > 90
First Paint:    < 1.5s
LCP:            < 2.5s
TTI:            < 3.5s
```

### Bundle Size Tracking

```bash
# Check sizes
npm run build

# Look for
Route (app)                Size     First Load JS
┌ ○ /                     142 B          87.3 kB
├ ○ /admin                3.45 kB        120 kB
└ ○ /tracking             2.1 kB         95 kB
```

---

## 🎯 Import Best Practices

### Do's

```typescript
// ✅ Named imports for tree-shaking
import { Button, Dialog } from '@/components/ui';

// ✅ Specific icon imports
import { Check, X } from 'lucide-react';

// ✅ Specific date-fns functions
import { format } from 'date-fns';

// ✅ Lazy load heavy components
import { LazyLineChart } from '@/lib/lazy-components';
```

### Don'ts

```typescript
// ❌ Wildcard imports
import * as Components from '@/components';

// ❌ Default import of tree-shakeable libraries
import _ from 'lodash';

// ❌ Importing unused modules
import { format, parseISO, addDays, subDays /* ... 50 more */ } from 'date-fns';

// ❌ Loading heavy components eagerly
import { RichTextEditor } from '@tiptap/react';
```

---

## 🚦 Performance Checklist

### Initial Load
- [ ] Framework chunk < 150 KB
- [ ] First Load JS < 200 KB (public)
- [ ] First Load JS < 400 KB (admin)
- [ ] No unused dependencies

### Code Splitting
- [ ] Admin routes lazy loaded
- [ ] Charts lazy loaded
- [ ] Editor lazy loaded
- [ ] DnD components lazy loaded
- [ ] Modals lazy loaded

### Tree Shaking
- [ ] Icons imported individually
- [ ] Date utilities optimized
- [ ] Chart components optimized
- [ ] No wildcard imports

### Caching
- [ ] Vendor chunks separate
- [ ] Framework chunk stable
- [ ] Static assets cached
- [ ] Proper cache headers

---

## 📈 Expected Results

### Public Routes (Homepage, Products, Tracking)
```
Before:  450 KB total
After:   200 KB total (-55%)

Breakdown:
- Framework:     150 KB
- UI Libraries:   30 KB
- App Code:       20 KB
```

### Admin Routes
```
Before:  450 KB total
After:   350 KB total (-22%)

Breakdown:
- Framework:     150 KB
- UI Libraries:   80 KB
- Charts:         50 KB (lazy)
- DnD:            40 KB (lazy)
- App Code:       30 KB
```

---

## 🛠️ Troubleshooting

### Bundle Too Large

1. **Run analyzer:**
   ```bash
   ANALYZE=true npm run build
   ```

2. **Check for:**
   - Duplicate packages
   - Large unused dependencies
   - Missing lazy loading

3. **Fix:**
   - Add to `optimizePackageImports`
   - Lazy load heavy components
   - Remove unused deps

### Hydration Errors

```typescript
// Dynamic imports with ssr: false
const Component = dynamic(
  () => import('./component'),
  { ssr: false } // Fixes hydration issues
);
```

### Slow Initial Load

1. **Prefetch critical chunks:**
   ```html
   <link rel="prefetch" href="/_next/static/chunks/admin.js" />
   ```

2. **Use loading states:**
   ```typescript
   <Suspense fallback={<Skeleton />}>
     <LazyComponent />
   </Suspense>
   ```

---

## 📚 References

- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
