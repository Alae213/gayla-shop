# Performance Profiling - Order Tracking System

**Phase:** 4 - Performance Profiling  
**Started:** February 26, 2026, 4:55 AM WAT  
**Status:** 🔄 In Progress  
**Overall Phase Progress:** 0/5 (0%)

---

## 📋 Overview

### Goals:
1. Measure baseline performance metrics
2. Identify rendering bottlenecks
3. Optimize slow components if needed
4. Document performance characteristics
5. Establish regression benchmarks

### Methodology:
- Use React DevTools Profiler
- Measure with React.Profiler API
- Test with realistic data (5 items, 3 calls, history)
- Record commit phase durations
- Track component re-render counts

### Success Criteria:
- Initial dialog render < 200ms
- User interactions < 100ms response
- < 5 unnecessary re-renders per action
- No memory leaks detected

---

## 🎯 Tasks

### ⬜ Task 4.1: Profile Opening Order Dialog
**Status:** Ready to start  
**Goal:** Measure initial render performance

**Metrics to Collect:**
- [ ] Total mount time (target: < 200ms)
- [ ] Number of component renders
- [ ] Slowest component
- [ ] Memory usage
- [ ] Time to interactive

**Test Scenario:**
Open order dialog with:
- 5 line items
- 3 call log entries
- 5 status history entries
- Customer data filled
- Variants selected

---

### ⬜ Task 4.2: Profile Editing Order Items
**Status:** Todo  
**Goal:** Measure re-renders during item editing

**Actions to Profile:**
- [ ] Add item
- [ ] Change variant
- [ ] Change quantity
- [ ] Remove item
- [ ] Autosave trigger

**Expected Re-renders per Action:**
- Main dialog: 1
- Line items editor: 1
- Changed row only: 1
- Other rows: 0 (React.memo)
- **Total: ≤ 3 per action**

---

### ⬜ Task 4.3: Profile Logging Call Outcomes
**Status:** Todo  
**Goal:** Measure call logging responsiveness

**Actions to Profile:**
- [ ] Click outcome button
- [ ] Enter note
- [ ] Log call
- [ ] Auto-cancel trigger
- [ ] Timeline update

**Target Response Times:**
- Button click to UI update: < 50ms
- Note input to state update: < 50ms
- Log call to timeline update: < 100ms

---

### ⬜ Task 4.4: Optimize Identified Bottlenecks
**Status:** Todo (pending profiling results)  
**Goal:** Fix any issues found

**Potential Optimizations:**
- [ ] Add React.memo to more components
- [ ] Split heavy components
- [ ] Optimize useMemo/useCallback deps
- [ ] Lazy load timeline components
- [ ] Virtualize long lists (if needed)

---

### ⬜ Task 4.5: Document Performance Baseline
**Status:** Todo  
**Goal:** Create reference for future regressions

**Deliverables:**
- [ ] Baseline metrics table
- [ ] After optimization metrics
- [ ] Flamegraph screenshots
- [ ] Recommendations document

---

## 🔧 Profiling Setup

### Tools:
1. **React DevTools Profiler**
   - Browser extension
   - Flame graph view
   - Ranked chart view
   - Component chart view

2. **React.Profiler API**
   - Programmatic measurements
   - Custom logging
   - Production-safe

3. **Chrome DevTools Performance**
   - JS execution time
   - Layout/Paint analysis
   - Memory profiling

### React Profiler Implementation:

```typescript
// Temporary wrapper for profiling
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log('Profiler:', {
    component: id,
    phase, // 'mount' or 'update'
    actualDuration, // Time spent rendering
    baseDuration, // Estimated time without memoization
    startTime, // When render started
    commitTime, // When React committed changes
  });
};

// Wrap component:
<Profiler id="OrderDialog" onRender={onRenderCallback}>
  <TrackingOrderDetails {...props} />
</Profiler>
```

---

## 📊 Baseline Metrics (To Be Measured)

### Task 4.1: Initial Dialog Render

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total mount time | < 200ms | TBD | ⬜ |
| OrderDetailsHeader | < 20ms | TBD | ⬜ |
| CustomerDetailsSection | < 30ms | TBD | ⬜ |
| OrderItemsSection | < 50ms | TBD | ⬜ |
| CallLoggingSection | < 30ms | TBD | ⬜ |
| OrderTimelinesSection | < 40ms | TBD | ⬜ |
| StatusActionBar | < 30ms | TBD | ⬜ |
| Component count | < 50 | TBD | ⬜ |
| Memory usage | < 10MB | TBD | ⬜ |

### Task 4.2: Editing Line Items

| Action | Re-renders Expected | Re-renders Actual | Status |
|--------|---------------------|-------------------|--------|
| Add item | ≤ 3 | TBD | ⬜ |
| Change variant | ≤ 3 | TBD | ⬜ |
| Change quantity | ≤ 4 (+ delivery) | TBD | ⬜ |
| Remove item | ≤ 3 | TBD | ⬜ |
| Autosave trigger | 0 (background) | TBD | ⬜ |

### Task 4.3: Call Logging

| Action | Target | Actual | Status |
|--------|--------|--------|--------|
| Outcome click | < 50ms | TBD | ⬜ |
| Note input | < 50ms | TBD | ⬜ |
| Log call | < 100ms | TBD | ⬜ |
| Auto-cancel | < 100ms | TBD | ⬜ |
| Timeline update | < 50ms | TBD | ⬜ |

---

## 🧪 Test Data

### Order Object for Testing:

```typescript
const testOrder = {
  _id: "test-order-id",
  orderNumber: "ORD-12345",
  customerName: "John Doe",
  customerPhone: "0555123456",
  customerAddress: "123 Test Street, Apartment 4B",
  customerCommune: "Bab Ezzouar",
  customerWilaya: "Alger",
  status: "confirmed",
  _creationTime: Date.now() - 86400000, // 1 day ago
  
  lineItems: [
    {
      productId: "prod1",
      productName: "Product 1",
      quantity: 2,
      unitPrice: 2500,
      lineTotal: 5000,
      variants: { size: "M", color: "Blue" },
    },
    {
      productId: "prod2",
      productName: "Product 2",
      quantity: 1,
      unitPrice: 3500,
      lineTotal: 3500,
      variants: { size: "L" },
    },
    {
      productId: "prod3",
      productName: "Product 3",
      quantity: 3,
      unitPrice: 1500,
      lineTotal: 4500,
    },
    {
      productId: "prod4",
      productName: "Product 4",
      quantity: 1,
      unitPrice: 5000,
      lineTotal: 5000,
      variants: { color: "Red" },
    },
    {
      productId: "prod5",
      productName: "Product 5",
      quantity: 2,
      unitPrice: 2000,
      lineTotal: 4000,
    },
  ],
  
  deliveryCost: 500,
  totalAmount: 22500,
  
  callLog: [
    {
      timestamp: Date.now() - 3600000,
      outcome: "answered",
      note: "Customer confirmed order",
      adminName: "Admin",
    },
    {
      timestamp: Date.now() - 7200000,
      outcome: "no_answer",
      adminName: "Admin",
    },
    {
      timestamp: Date.now() - 10800000,
      outcome: "answered",
      note: "Initial contact",
      adminName: "Admin",
    },
  ],
  
  callAttempts: 3,
  
  statusHistory: [
    {
      status: "confirmed",
      timestamp: Date.now() - 3600000,
      adminName: "Admin",
    },
    {
      status: "new",
      timestamp: Date.now() - 86400000,
      adminName: "System",
    },
  ],
};
```

---

## 📈 Expected Optimizations

### Already Implemented:
✅ React.memo on LineItemRow  
✅ useCallback for handlers  
✅ useMemo for computed values  
✅ Early returns in handlers  
✅ Debounced autosave  
✅ Smart delivery recalc  

### Potential Additions:
- [ ] React.memo on section components
- [ ] Virtualized timeline (if > 20 entries)
- [ ] Code splitting for AddProductModal
- [ ] Lazy load VariantSelectorDropdown
- [ ] Optimize status history rendering

---

## 🎯 Performance Targets

### Render Performance:
- **Initial mount:** < 200ms (First Contentful Paint)
- **Time to Interactive:** < 300ms
- **User interaction response:** < 100ms

### Re-render Efficiency:
- **Unchanged components:** 0 re-renders
- **Parent state change:** Only affected children re-render
- **List updates:** Only changed items re-render

### Memory:
- **Initial load:** < 10MB
- **After 10 interactions:** < 15MB
- **No leaks:** Memory stable after interactions

### Network:
- **Autosave:** Max 1 request per 800ms
- **Delivery recalc:** Only on quantity/item changes
- **API calls:** < 5 per typical workflow

---

## 🔍 How to Profile

### Step 1: Install React DevTools
```bash
# Chrome/Edge: Install from Web Store
# Firefox: Install from Add-ons
# Search: "React Developer Tools"
```

### Step 2: Open Profiler Tab
1. Open DevTools (F12)
2. Navigate to "Profiler" tab
3. Click record button (🔴)
4. Perform actions
5. Stop recording
6. Analyze flame graph

### Step 3: Add Profiler API (Temporary)
```typescript
// In tracking-order-details.tsx (temporarily)
import { Profiler } from 'react';

const onRender = (id, phase, actualDuration) => {
  if (actualDuration > 16) { // > 1 frame at 60fps
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
};

return (
  <Profiler id="OrderDialog" onRender={onRender}>
    {/* existing JSX */}
  </Profiler>
);
```

### Step 4: Measure with Chrome Performance
1. Open DevTools > Performance tab
2. Click record
3. Open order dialog
4. Stop recording
5. Analyze:
   - Scripting (JS execution)
   - Rendering (layout/paint)
   - Loading (network)

---

## 📝 Notes

### Best Practices:
- Profile in production build (`npm run build`)
- Test on mid-range device (not high-end dev machine)
- Clear cache before each test
- Use realistic network throttling (Fast 3G)
- Measure multiple times, take average

### Common Bottlenecks:
- Large lists without virtualization
- Heavy computations in render
- Missing React.memo on expensive components
- Incorrect useEffect dependencies
- Too many context updates

### Red Flags:
- > 50ms for single component render
- > 10 unnecessary re-renders
- Render time increasing over time (memory leak)
- User interactions feeling sluggish

---

## 📊 Results Summary

### Task 4.1: Initial Render
**Status:** ⬜ Not started  
**Results:** TBD

### Task 4.2: Line Items Editing
**Status:** ⬜ Not started  
**Results:** TBD

### Task 4.3: Call Logging
**Status:** ⬜ Not started  
**Results:** TBD

### Task 4.4: Optimizations Applied
**Status:** ⬜ Not started  
**Changes:** TBD

### Task 4.5: Final Documentation
**Status:** ⬜ Not started  
**Delivered:** TBD

---

## 🔄 Progress Tracking

```
Task 4.1: Profile Initial Render     [░░░░░] 0%
Task 4.2: Profile Editing            [░░░░░] 0%
Task 4.3: Profile Call Logging       [░░░░░] 0%
Task 4.4: Optimize Bottlenecks       [░░░░░] 0%
Task 4.5: Document Baseline          [░░░░░] 0%

Phase 4 Overall: [░░░░░░░░░░] 0/5 (0%)
```

---

**Next Step:** Start Task 4.1 - Profile opening order dialog

**Status:** 📋 Ready to begin profiling
