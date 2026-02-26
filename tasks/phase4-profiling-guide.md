# Phase 4: Profiling Execution Guide

**Date:** February 26, 2026  
**Status:** Ready to Execute  
**Profiler:** Enabled in `tracking-order-details.tsx`

---

## 🚀 Quick Start

### 1. Enable Development Mode
```bash
npm run dev
```

### 2. Open Browser DevTools
- Press `F12` or `Cmd+Opt+I` (Mac)
- Navigate to **Console** tab
- Clear console (`Cmd+K` or `Ctrl+L`)

### 3. Open Order Dialog
- Navigate to tracking page
- Click on any order to open dialog
- Watch console output

---

## 📊 Task 4.1: Profile Initial Dialog Open

### Test Scenario:
**Open an order with:**
- 5 line items
- 3 call log entries
- Status history
- Complete customer data

### What to Look For in Console:

You'll see logs like:
```
🏁 [Profiler] TrackingOrderDetails
  phase: "mount"
  actualDuration: "45.20ms"
  baseDuration: "52.30ms"
  improvement: "13.6%"

🏁 [Profiler] OrderDetailsHeader
  phase: "mount"
  actualDuration: "3.50ms"
  
🏁 [Profiler] CustomerDetailsSection
  phase: "mount"
  actualDuration: "8.20ms"
  
🏁 [Profiler] OrderItemsSection
  phase: "mount"
  actualDuration: "25.10ms"
  
🏁 [Profiler] OrderTimelinesSection
  phase: "mount"
  actualDuration: "7.40ms"
  
🏁 [Profiler] StatusActionBar
  phase: "mount"
  actualDuration: "12.30ms"
```

### Record Results:

Fill in the table in `performance-profile.md`:

| Component | Target | Actual | Status |
|-----------|--------|--------|--------|
| Total mount time | < 200ms | **___ms** | ⬜ |
| OrderDetailsHeader | < 20ms | **___ms** | ⬜ |
| CustomerDetailsSection | < 30ms | **___ms** | ⬜ |
| OrderItemsSection | < 50ms | **___ms** | ⬜ |
| OrderTimelinesSection | < 40ms | **___ms** | ⬜ |
| StatusActionBar | < 30ms | **___ms** | ⬜ |

### Success Criteria:
- ✅ Total mount < 200ms
- ✅ No component > 50ms
- ✅ No warnings in console

---

## 📊 Task 4.2: Profile Line Items Editing

### Test Scenarios:

#### A. Add Item
1. Clear console
2. Click "Add Product"
3. Select product and add
4. Count re-renders in console

**Expected:**
```
🔄 [Profiler] OrderItemsSection (update)
🔄 [Profiler] TrackingOrderDetails (update)
Total: 2 renders
```

#### B. Change Variant
1. Clear console
2. Change variant dropdown
3. Count re-renders

**Expected:**
```
🔄 [Profiler] OrderItemsSection (update)
🔄 [Profiler] TrackingOrderDetails (update)
Total: 2-3 renders (only changed row + parent)
```

#### C. Change Quantity
1. Clear console
2. Increase/decrease quantity
3. Count re-renders

**Expected:**
```
🔄 [Profiler] OrderItemsSection (update)
🔄 [Profiler] TrackingOrderDetails (update)
Total: 3-4 renders (+ delivery recalc)
```

#### D. Remove Item
1. Clear console
2. Click remove button
3. Count re-renders

**Expected:**
```
🔄 [Profiler] OrderItemsSection (update)
🔄 [Profiler] TrackingOrderDetails (update)
Total: 2-3 renders
```

### Record Results:

| Action | Expected | Actual | Status |
|--------|----------|--------|--------|
| Add item | ≤ 3 | **___** | ⬜ |
| Change variant | ≤ 3 | **___** | ⬜ |
| Change quantity | ≤ 4 | **___** | ⬜ |
| Remove item | ≤ 3 | **___** | ⬜ |

---

## 📊 Task 4.3: Profile Call Logging

### Test Scenarios:

#### A. Click Outcome Button
1. Clear console
2. Click "Answered" or "No Answer"
3. Measure time to UI update

**Expected:**
```
🔄 [Profiler] StatusActionBar (update)
actualDuration: < 50ms
```

#### B. Enter Note
1. Clear console
2. Type in note field
3. Watch for re-renders

**Expected:**
```
No Profiler logs (controlled input, no parent update)
```

#### C. Log Call
1. Clear console
2. Click "Log Call" button
3. Watch timeline update

**Expected:**
```
🔄 [Profiler] OrderTimelinesSection (update)
🔄 [Profiler] StatusActionBar (update)
Total: < 100ms
```

### Record Results:

| Action | Target | Actual | Status |
|--------|--------|--------|--------|
| Outcome click | < 50ms | **___ms** | ⬜ |
| Note input | No re-render | **___** | ⬜ |
| Log call | < 100ms | **___ms** | ⬜ |
| Timeline update | < 50ms | **___ms** | ⬜ |

---

## 🛠️ Using React DevTools Profiler

### Step 1: Install Extension
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Step 2: Open Profiler Tab
1. Open DevTools (F12)
2. Click "Profiler" tab (next to Console)
3. Click gear icon for settings
4. Enable "Record why each component rendered"

### Step 3: Record a Session
1. Click blue record button (🔴)
2. Open order dialog
3. Perform actions (edit items, log call, etc.)
4. Click stop button (⏹️)

### Step 4: Analyze Flame Graph
- **Width:** Time spent rendering
- **Color:**
  - 🟢 Green: Fast (< 10ms)
  - 🟡 Yellow: Moderate (10-50ms)
  - 🔴 Red: Slow (> 50ms)
- **Click component:** See why it rendered

### Step 5: Check Ranked Chart
- Shows components by render duration
- Identify slowest components
- Focus optimization efforts

---

## 📸 Taking Screenshots

### Flame Graph Screenshot:
1. Complete profiling session
2. Switch to Flame Graph view
3. Take screenshot (`Cmd+Shift+4` on Mac)
4. Save as `phase4-flamegraph-initial.png`
5. Upload to `/tasks/screenshots/`

### Ranked Chart Screenshot:
1. Switch to Ranked Chart view
2. Take screenshot
3. Save as `phase4-ranked-initial.png`
4. Upload to `/tasks/screenshots/`

---

## ⚠️ Common Issues

### Issue 1: No Console Logs
**Solution:** Check `PROFILING_ENABLED` is `true` in `tracking-order-details.tsx`

### Issue 2: Profiler Tab Missing
**Solution:** Install React DevTools extension

### Issue 3: Slow Performance in Dev Mode
**Solution:** Build production and test:
```bash
npm run build
npm run start
```

### Issue 4: Too Many Logs
**Solution:** Use React DevTools Profiler instead of console logs

---

## 📝 Recording Template

Copy this to `performance-profile.md` after testing:

```markdown
## Task 4.1 Results: Initial Dialog Open

**Date:** [DATE]
**Browser:** Chrome/Firefox/Safari
**Device:** [DEVICE NAME]

### Metrics:

| Component | Target | Actual | Status |
|-----------|--------|--------|--------|
| Total mount | < 200ms | XXXms | ✅/❌ |
| OrderDetailsHeader | < 20ms | XXms | ✅/❌ |
| CustomerDetailsSection | < 30ms | XXms | ✅/❌ |
| OrderItemsSection | < 50ms | XXms | ✅/❌ |
| OrderTimelinesSection | < 40ms | XXms | ✅/❌ |
| StatusActionBar | < 30ms | XXms | ✅/❌ |

### Observations:
- [Any slow components]
- [Any warnings]
- [Overall performance]

### Screenshots:
- Flame graph: `phase4-flamegraph-task41.png`
- Ranked chart: `phase4-ranked-task41.png`
```

---

## 🎯 Success Criteria Summary

### Task 4.1: Initial Render
- ✅ Total mount < 200ms
- ✅ No component > 50ms individually
- ✅ No console warnings

### Task 4.2: Line Items Editing
- ✅ < 5 re-renders per action
- ✅ Only affected components re-render
- ✅ No unnecessary parent re-renders

### Task 4.3: Call Logging
- ✅ UI updates < 100ms
- ✅ No input lag
- ✅ Timeline updates smoothly

---

## 🚀 Next Steps After Profiling

### If Performance is Good (✅):
1. Document baseline metrics
2. Remove Profiler wrappers
3. Mark Task 4.4 as "N/A - No optimizations needed"
4. Complete Task 4.5 documentation
5. Phase 4 complete!

### If Performance Needs Work (❌):
1. Identify bottlenecks from flame graph
2. Apply optimizations (Task 4.4):
   - Add React.memo
   - Split heavy components
   - Optimize hooks
3. Re-profile to measure improvement
4. Document before/after metrics
5. Phase 4 complete!

---

## 📄 Files to Update

After profiling:

1. **`tasks/performance-profile.md`**
   - Fill in baseline metrics tables
   - Add "Results Summary" section
   - Upload screenshots

2. **`tasks/todo.md`**
   - Mark Task 4.1, 4.2, 4.3 as complete
   - Update progress bars

3. **`tasks/implementation-checklist.md`**
   - Update Phase 4 progress
   - Add commit links

4. **`components/admin/tracking/views/tracking-order-details.tsx`**
   - Set `PROFILING_ENABLED = false`
   - Or remove Profiler wrappers entirely

---

**Ready to start?** Open the app, open console, and begin Task 4.1! 🚀
