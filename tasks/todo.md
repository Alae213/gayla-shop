# TODO List - Order Tracking System

**Last Updated:** February 26, 2026, 4:47 AM WAT  
**Current Phase:** Phase 1 (Line Items Bugs)  
**Overall Progress:** 9/24 tasks (37.5%)

---

## 🔥 **CRITICAL - Phase 1: Line Items Bugs** (In Progress)

### ⬜ Task 1.1: Diagnose Variant Editing Issues
**Priority:** 🔴 Critical  
**Status:** In Progress  
**Goal:** Identify why variant changes don't properly sync with totals/delivery

**Steps:**
1. Review `VariantSelectorDropdown` component
2. Check `handleVariantChange` callback in `order-line-items-editor.tsx`
3. Trace data flow: variant change → lineItems update → delivery recalc → autosave
4. Identify missing triggers or stale closures

**Expected Issues:**
- Variant change might not update `unitPrice` if product has variant pricing
- `lineTotal` might not recalculate when variant changes
- Autosave dependency array might not include variants
- Delivery recalc might not fire on variant-only changes

**Files to Review:**
- `components/admin/tracking/ui/variant-selector-dropdown.tsx`
- `components/admin/tracking/ui/order-line-items-editor.tsx`
- `lib/utils/delivery-recalculator.ts`

---

### ⬜ Task 1.2: Fix Variant Price Sync
**Priority:** 🔴 Critical  
**Status:** Todo  
**Goal:** Ensure variant changes update unitPrice and lineTotal correctly

**Changes Needed:**
- Modify `handleVariantChange` to fetch updated price if needed
- Recalculate `lineTotal` when variant changes
- Ensure state updates trigger autosave

**Files to Modify:**
- `components/admin/tracking/ui/order-line-items-editor.tsx`
- `components/admin/tracking/ui/variant-selector-dropdown.tsx` (if needed)

---

### ⬜ Task 1.3: Fix Delivery Cost Recalculation on Variant Change
**Priority:** 🔴 Critical  
**Status:** Todo  
**Goal:** Ensure delivery recalc triggers when variants change (weight/dimensions)

**Changes Needed:**
- Update `useAbortableEffect` dependency to detect variant changes
- Ensure `extractLineItems` returns stable references for unchanged items
- Add variant hash to line items comparison

**Files to Modify:**
- `components/admin/tracking/ui/order-line-items-editor.tsx`
- `lib/utils/delivery-recalculator.ts` (if weight calculation needed)

---

### ⬜ Task 1.4: Remove Manual Save/Cancel Buttons
**Priority:** 🔴 Critical  
**Status:** Todo  
**Goal:** Hide manual controls, rely on autosave indicator + retry on failure

**Changes Needed:**
- Remove `hasChanges && (...)` conditional buttons block
- Keep "Saving..." / "Saved ✓" indicator
- Add error toast with "Retry" action on autosave failure
- Show visual feedback during autosave (spinner on affected row)

**Files to Modify:**
- `components/admin/tracking/ui/order-line-items-editor.tsx`

---

### ⬜ Task 1.5: Test Variant + Autosave End-to-End
**Priority:** 🔴 Critical  
**Status:** Todo  
**Goal:** Verify all flows work correctly

**Test Cases:**
1. ✓ Change variant → price updates → autosave fires → toast confirms
2. ✓ Change variant on heavy product → delivery cost recalcs → autosave fires
3. ✓ Rapid variant changes → debounce works → single autosave
4. ✓ Autosave fails (mock network error) → "Retry" toast appears → retry works
5. ✓ Change variant + quantity simultaneously → totals correct → autosave once

---

## ✅ **COMPLETED - Phase 2: Error Handling & Resilience**

### ✅ Task 2.1: Optimistic Updates for Call Logging
**Completed:** February 26, 2026  
**Commits:** [322b545](https://github.com/Alae213/gayla-shop/commit/322b545f4503e10cd24da05980714ff9c530b65f), [cc0f677](https://github.com/Alae213/gayla-shop/commit/cc0f677a0e0aadcfe05c8b5da23c4a77b549bd74)

### ✅ Task 2.2: Optimistic Updates for Status Changes
**Completed:** February 26, 2026  
**Commits:** [322b545](https://github.com/Alae213/gayla-shop/commit/322b545f4503e10cd24da05980714ff9c530b65f), [7ececa6](https://github.com/Alae213/gayla-shop/commit/7ececa69eaa8267463aecae4c48b535624b8f864)

### ✅ Task 2.3: Enhanced Error Messages & Retry Actions
**Completed:** February 26, 2026  
**Commit:** [322b545](https://github.com/Alae213/gayla-shop/commit/322b545f4503e10cd24da05980714ff9c530b65f)

### ✅ Task 2.4: Network Status Banner
**Completed:** February 26, 2026  
**Commit:** [437022c](https://github.com/Alae213/gayla-shop/commit/437022c6299ebd23c7a5d6cf4768d0452a3327d9)

### ✅ Task 2.5: Test Error Handling Scenarios
**Completed:** February 26, 2026  
**All test cases passed**

---

## ✅ **COMPLETED - Phase 3: Refactoring (Components + Hooks)**

### ✅ Task 3.1: Extract Custom Hooks
**Completed:** February 26, 2026  
**Files Created:**
- `use-order-call-logging.ts`
- `use-order-editing.ts`
- `use-order-status-actions.ts`

**Commits:** [cc0f677](https://github.com/Alae213/gayla-shop/commit/cc0f677a0e0aadcfe05c8b5da23c4a77b549bd74), [6452f2b](https://github.com/Alae213/gayla-shop/commit/6452f2b7d6610c652a9d6037e931ada3e6097312), [7ececa6](https://github.com/Alae213/gayla-shop/commit/7ececa69eaa8267463aecae4c48b535624b8f864)

### ✅ Task 3.2: Extract Section Components
**Completed:** February 26, 2026  
**Files Created:**
- `order-details-header.tsx`
- `customer-details-section.tsx`
- `order-items-section.tsx`
- `call-logging-section.tsx`
- `order-timelines-section.tsx`
- `status-action-bar.tsx`

**Commit:** [612be47](https://github.com/Alae213/gayla-shop/commit/612be47140c90f0ec93af71b52d88aaba2f4078e)

### ✅ Task 3.3: Refactor Main Component
**Completed:** February 26, 2026  
**Result:** 900 → 300 lines (67% reduction)  
**Commit:** [da8817b](https://github.com/Alae213/gayla-shop/commit/da8817be90489d73af5dd7ffc21d96466b086ea4)

### ✅ Task 3.4: Update Imports & Exports
**Completed:** February 26, 2026  
**Commit:** [9952b6e](https://github.com/Alae213/gayla-shop/commit/9952b6e68bd78c9d66a79299f64e97ee34f2fcbf)

---

## 🔮 **FUTURE - Phase 4: Performance Profiling** (Optional)

### ⬜ Task 4.1: Profile Opening Order Dialog
**Priority:** 🟢 Low  
**Status:** Todo  
**Deferred until:** Performance issues arise in production

### ⬜ Task 4.2: Profile Editing Order Items
**Priority:** 🟢 Low  
**Status:** Todo

### ⬜ Task 4.3: Profile Logging Call Outcomes
**Priority:** 🟢 Low  
**Status:** Todo

### ⬜ Task 4.4: Optimize Identified Bottlenecks
**Priority:** 🟢 Low  
**Status:** Todo

### ⬜ Task 4.5: Document Performance Baseline
**Priority:** 🟢 Low  
**Status:** Todo

---

## 🎨 **FUTURE - Phase 5: Spacing & Visual Polish** (Optional)

### ⬜ Task 5.1: Normalize Section Spacing
**Priority:** 🎨 Polish  
**Status:** Todo

### ⬜ Task 5.2: Normalize Card Padding
**Priority:** 🎨 Polish  
**Status:** Todo

### ⬜ Task 5.3: Normalize Button Spacing
**Priority:** 🎨 Polish  
**Status:** Todo

### ⬜ Task 5.4: Normalize List Row Spacing
**Priority:** 🎨 Polish  
**Status:** Todo

### ⬜ Task 5.5: Final Visual QA Pass
**Priority:** 🎨 Polish  
**Status:** Todo

---

## 📊 Progress Summary

```
Phase 1: Line Items Bugs     [░░░░░] 0/5 (0%)   🔴 IN PROGRESS
Phase 2: Error Handling      [█████] 5/5 (100%) ✅ COMPLETE
Phase 3: Refactoring         [████░] 4/4 (100%) ✅ COMPLETE
Phase 4: Performance         [░░░░░] 0/5 (0%)   🔮 FUTURE
Phase 5: Visual Polish       [░░░░░] 0/5 (0%)   🎨 FUTURE

Overall: █████████░░░░░░░ 9/24 (37.5%)
```

---

## 🎯 Next Steps

1. **NOW:** Complete Task 1.1 (Diagnose variant issues)
2. **THEN:** Tasks 1.2-1.5 (Fix and test variant system)
3. **AFTER:** Phases 4 & 5 can be deferred

---

## 📝 Notes

- **Phase 1 is critical** - Blocks production deployment
- **Phase 2 & 3 are complete** - System is resilient and maintainable
- **Phase 4 & 5 are optional** - Can be done when time permits

---

## 🔗 Related Files

- [Implementation Checklist](./implementation-checklist.md) - Detailed task tracking
- [Performance Profile](./performance-profile.md) - To be created in Phase 4
- [Lessons Learned](./lessons.md) - Development insights
