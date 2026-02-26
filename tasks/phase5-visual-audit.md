# Phase 5: Visual Audit - Spacing & Consistency

**Phase:** 5 - Visual Polish  
**Started:** February 26, 2026, 5:03 AM WAT  
**Status:** 🔄 In Progress  
**Overall Phase Progress:** 0/5 (0%)

---

## 🎯 Overview

### Goals:
1. Normalize section spacing (consistent gaps between sections)
2. Standardize card padding (uniform internal spacing)
3. Align button spacing (predictable button layout)
4. Standardize list row spacing (consistent row heights)
5. Create cohesive visual rhythm

### Approach:
- **Audit first**: Document current spacing
- **Define tokens**: Create spacing design system
- **Apply systematically**: Update components
- **Verify visually**: QA pass

### Success Criteria:
- All sections use same margin pattern
- All cards use same padding
- All buttons use same gap values
- All list rows use same height/padding
- Visual consistency across entire dialog

---

## 📊 Current State Audit

### Section Spacing Analysis

**Current components in order:**
1. `NetworkStatusBanner` (conditional)
2. `OrderDetailsHeader`
3. `CustomerDetailsSection`
4. `OrderItemsSection`
5. `OrderTimelinesSection`
6. `StatusActionBar` (fixed bottom)

**Current spacing pattern in main component:**
```tsx
// tracking-order-details.tsx
<NetworkStatusBanner className="mb-6" />          // mb-6 = 24px
<OrderDetailsHeader ... />                         // ?
<CustomerDetailsSection ... />                     // ?
<OrderItemsSection ... />                          // ?
<OrderTimelinesSection ... />                      // ?
```

**Need to audit:**
- Each component's internal margin/padding
- Gap between sections
- Inconsistencies

---

### Card Padding Inventory

**Cards identified:**
1. Customer details card
2. Order items card (line items editor)
3. Call logging card
4. Status history card
5. Action bar card

**Common padding patterns in codebase:**
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `px-4 py-3` = Mixed
- `px-6 py-4` = Mixed

**Need to standardize on ONE pattern**

---

### Button Spacing Review

**Button groups identified:**
1. Customer edit buttons (Save/Discard)
2. Call outcome buttons (Answered/No Answer/etc)
3. Status action buttons (Confirm/Cancel/etc)
4. Secondary buttons (Edit/Print Label)

**Current gap patterns:**
- `gap-2` = 8px (common)
- `gap-3` = 12px
- `gap-4` = 16px
- `space-x-2` = 8px (legacy)

**Need to standardize on ONE gap value**

---

### List Row Spacing Check

**Lists identified:**
1. Line items rows
2. Call log entries
3. Status history entries

**Current patterns:**
- Line items: Complex grid layout
- Call log: Timeline-style with icons
- Status history: Timeline-style with icons

**Need to audit:**
- Row height consistency
- Padding within rows
- Gap between rows
- Icon/content alignment

---

## 🎨 Proposed Design Token System

### Spacing Scale:
```typescript
const spacing = {
  // Section spacing (between major sections)
  section: {
    default: 'mb-6',  // 24px - use between all sections
  },
  
  // Card padding (internal content spacing)
  card: {
    default: 'p-6',   // 24px - use for all cards
  },
  
  // Button gaps (between buttons in groups)
  buttonGroup: {
    default: 'gap-3', // 12px - use for all button groups
  },
  
  // List rows (spacing within lists)
  listRow: {
    padding: 'py-3',  // 12px vertical
    gap: 'gap-y-2',   // 8px between rows
  },
};
```

### Why These Values?

**mb-6 (24px) for sections:**
- Provides clear visual separation
- Not too cramped, not too spacious
- Works well in scrollable container
- Common in modern UIs

**p-6 (24px) for cards:**
- Matches section spacing for rhythm
- Comfortable breathing room
- Standard for content containers
- Neither too cramped nor wasteful

**gap-3 (12px) for buttons:**
- Tight enough to group related actions
- Loose enough to prevent mis-clicks
- Standard touch-friendly spacing
- Works on mobile and desktop

**py-3 (12px) for list rows:**
- Comfortable row height
- Easy to scan
- Touch-friendly
- Consistent with button gaps

---

## 📋 Task 5.1: Normalize Section Spacing

### Current Issues (To Be Verified):
- Inconsistent margins between sections
- Some sections have `mb-4`, others `mb-6`, some none
- Visual rhythm is off

### Proposed Changes:

```tsx
// In tracking-order-details.tsx
<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
  
  {/* Network Status Banner */}
  <NetworkStatusBanner className="mb-6" />

  {/* Header */}
  <div className="mb-6">
    <OrderDetailsHeader ... />
  </div>

  {/* Customer Details */}
  <div className="mb-6">
    <CustomerDetailsSection ... />
  </div>

  {/* Order Items */}
  <div className="mb-6">
    <OrderItemsSection ... />
  </div>

  {/* Call History & Status Timeline */}
  <OrderTimelinesSection ... />
  {/* Last section: no margin bottom */}
</div>
```

**Pattern:**
- All sections get `mb-6` wrapper EXCEPT last section
- Consistent 24px gap between all sections
- Clean visual rhythm

---

## 📋 Task 5.2: Normalize Card Padding

### Files to Update:

#### 1. `customer-details-section.tsx`
Change card padding to `p-6`

#### 2. `order-items-section.tsx`
Change card padding to `p-6`

#### 3. `call-logging-section.tsx`
Change card padding to `p-6`

#### 4. `order-timelines-section.tsx`
Change both cards (call log + status history) to `p-6`

#### 5. `status-action-bar.tsx`
Change padding to `p-6` (may already be correct)

### Before/After Example:

**Before:**
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  {/* 16px padding */}
</div>
```

**After:**
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* 24px padding - consistent */}
</div>
```

---

## 📋 Task 5.3: Normalize Button Spacing

### Button Groups to Update:

#### 1. Customer Edit Buttons
```tsx
// In customer-details-section.tsx
<div className="flex gap-3"> {/* was gap-2, now gap-3 */}
  <Button>Save</Button>
  <Button>Discard</Button>
</div>
```

#### 2. Call Outcome Buttons
```tsx
// In status-action-bar.tsx (call logging section)
<div className="flex gap-3"> {/* standardize to gap-3 */}
  <Button>Answered</Button>
  <Button>No Answer</Button>
  <Button>Will Call Back</Button>
</div>
```

#### 3. Status Action Buttons
```tsx
// In status-action-bar.tsx (main actions)
<div className="flex gap-3"> {/* standardize to gap-3 */}
  <Button>Confirm Order</Button>
  <Button>Cancel</Button>
</div>
```

#### 4. Secondary Actions
```tsx
// In status-action-bar.tsx
<div className="flex gap-3"> {/* standardize to gap-3 */}
  <Button>Edit</Button>
  <Button>Print Label</Button>
</div>
```

---

## 📋 Task 5.4: Normalize List Row Spacing

### Lists to Update:

#### 1. Line Items Rows
```tsx
// In order-line-items-editor.tsx and line-item-row.tsx
<div className="py-3 border-b border-gray-100"> {/* consistent py-3 */}
  {/* Line item content */}
</div>
```

#### 2. Call Log Entries
```tsx
// In order-timelines-section.tsx (call log section)
<div className="space-y-2"> {/* consistent gap */}
  {callLog.map(entry => (
    <div className="py-3"> {/* consistent padding */}
      {/* Call entry content */}
    </div>
  ))}
</div>
```

#### 3. Status History Entries
```tsx
// In order-timelines-section.tsx (status history section)
<div className="space-y-2"> {/* consistent gap */}
  {statusHistory.map(entry => (
    <div className="py-3"> {/* consistent padding */}
      {/* Status entry content */}
    </div>
  ))}
</div>
```

---

## 📋 Task 5.5: Final Visual QA Pass

### Checklist:

#### Spacing Verification:
- [ ] All sections have consistent `mb-6` gaps
- [ ] All cards have `p-6` padding
- [ ] All button groups use `gap-3`
- [ ] All list rows use `py-3`

#### Visual Rhythm:
- [ ] Sections feel evenly spaced
- [ ] Cards feel consistent in breathing room
- [ ] Buttons feel properly grouped
- [ ] Lists scan easily

#### Responsive Check:
- [ ] Spacing works on mobile (small screens)
- [ ] Spacing works on tablet (medium screens)
- [ ] Spacing works on desktop (large screens)

#### Edge Cases:
- [ ] Empty lists don't create odd spacing
- [ ] Long content doesn't break layout
- [ ] Hidden sections don't leave gaps

---

## 🎯 Expected Improvements

### Before Phase 5:
- Inconsistent spacing throughout
- Visual rhythm feels "off"
- Some sections cramped, others spacious
- Hard to predict layout

### After Phase 5:
- Consistent spacing system
- Predictable visual rhythm
- Professional polish
- Easier to maintain

---

## 📊 Progress Tracking

```
Task 5.1: Section Spacing     [░░░░░] 0%
Task 5.2: Card Padding        [░░░░░] 0%
Task 5.3: Button Spacing      [░░░░░] 0%
Task 5.4: List Row Spacing    [░░░░░] 0%
Task 5.5: Visual QA Pass      [░░░░░] 0%

Phase 5 Overall: [░░░░░░░░░░] 0/5 (0%)
```

---

## 🛠️ Implementation Strategy

### Order of Execution:

1. **Task 5.1 First** (Section spacing)
   - Set the overall rhythm
   - Affects all other components
   - Foundation for rest of phase

2. **Task 5.2 Second** (Card padding)
   - Works within section spacing
   - Internal consistency
   - Affects content layout

3. **Task 5.3 Third** (Button spacing)
   - Micro-level polish
   - Works within cards
   - User interaction points

4. **Task 5.4 Fourth** (List rows)
   - Detail-level consistency
   - Works within cards
   - Content scanning

5. **Task 5.5 Last** (QA pass)
   - Verify all changes
   - Catch edge cases
   - Final polish

---

**Next Step:** Start Task 5.1 - Normalize Section Spacing

**Status:** 📋 Ready to begin implementation
