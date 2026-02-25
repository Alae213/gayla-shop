# ✅ QA Testing Checklist - Sprint 1

**Project:** Gayla Shop - Performance & Stability  
**Sprint:** Sprint 1 (Days 1-5)  
**Testing Date:** Day 5  
**Tester:** _____________  

---

## 🎯 Testing Objectives

- [ ] Verify all performance optimizations work
- [ ] Ensure no regressions in functionality
- [ ] Confirm cross-browser compatibility
- [ ] Validate memory leak fixes
- [ ] Check loading states prevent double-clicks
- [ ] Test lazy loading and code splitting

---

## 📊 1. Lighthouse Audits

### Desktop Audit
**URL:** `http://localhost:3000/admin/tracking`

```bash
# Run Lighthouse CLI
npx lighthouse http://localhost:3000/admin/tracking --view
```

- [ ] **Performance Score:** ≥ 90 (Current: ____ )
- [ ] **Accessibility Score:** ≥ 78 (Current: ____ )
- [ ] **Best Practices Score:** ≥ 95 (Current: ____ )
- [ ] **SEO Score:** ≥ 95 (Current: ____ )

### Core Web Vitals
- [ ] **LCP (Largest Contentful Paint):** < 2.5s (Current: ____ )
- [ ] **FID (First Input Delay):** < 100ms (Current: ____ )
- [ ] **CLS (Cumulative Layout Shift):** < 0.1 (Current: ____ )
- [ ] **FCP (First Contentful Paint):** < 1.8s (Current: ____ )
- [ ] **TTI (Time to Interactive):** < 3.8s (Current: ____ )

### Mobile Audit
- [ ] Performance Score ≥ 85
- [ ] LCP < 3.0s
- [ ] No layout shifts
- [ ] Touch targets ≥ 44x44px

**Notes:**
```
[Record any issues or observations]
```

---

## 🌐 2. Cross-Browser Testing

### Desktop Browsers

#### Chrome (Latest)
- [ ] Admin workspace loads correctly
- [ ] Drag & drop works smoothly
- [ ] Images load with blur placeholders
- [ ] Lazy loading works (check Network tab)
- [ ] No console errors
- [ ] Loading states prevent double-clicks

#### Firefox (Latest)
- [ ] All features work
- [ ] CSS Grid layout correct
- [ ] Flexbox behaves correctly
- [ ] No console errors

#### Safari (macOS)
- [ ] Safari CSS fixes applied
- [ ] Webkit prefixes working
- [ ] GPU acceleration smooth
- [ ] Date formatting correct
- [ ] Modal z-index correct
- [ ] No console errors

#### Edge (Latest)
- [ ] All features work
- [ ] No console errors

### Mobile Browsers

#### Safari (iOS 16+)
- [ ] Layout respects safe areas (notch)
- [ ] Touch interactions work
- [ ] No zoom on input focus
- [ ] Momentum scrolling smooth
- [ ] Date picker works

#### Chrome (Android)
- [ ] All features work
- [ ] Touch interactions smooth

**Issues Found:**
```
Browser: ______
Issue: ______
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
```

---

## 🧠 3. Memory Leak Verification

### Test Scenario: Rapid Order Opening
**Steps:**
1. Open admin tracking page
2. Open DevTools > Memory tab
3. Take heap snapshot
4. Open 50 orders rapidly (click each card)
5. Close all orders
6. Click "Collect garbage"
7. Take another heap snapshot
8. Compare memory usage

**Results:**
- [ ] Initial memory: ____ MB
- [ ] After opening 50 orders: ____ MB
- [ ] After closing & GC: ____ MB
- [ ] **Memory leak detected:** [ ] Yes [ ] No
- [ ] **Target:** Memory returns to < 100 MB after GC

### Test Scenario: Component Mounting/Unmounting
**Steps:**
1. Navigate between views 20 times
2. Check for memory accumulation
3. Verify cleanup functions run

**Results:**
- [ ] No memory accumulation
- [ ] Cleanup functions run (check console)
- [ ] Event listeners removed
- [ ] AbortControllers triggered

**Notes:**
```
[Record any memory issues]
```

---

## ⚡ 4. Performance Testing

### Bundle Size Verification
```bash
npm run build
# Check .next/static/chunks
```

- [ ] **Initial bundle:** < 500 KB (Current: ____ KB)
- [ ] **Admin chunk:** Lazy loaded separately
- [ ] **Vendor chunks:** Split correctly
- [ ] **Total JS:** < 800 KB (Current: ____ KB)

### Lazy Loading Test
**Steps:**
1. Open Network tab
2. Navigate to admin page
3. Verify admin chunks load on demand
4. Check skeleton shows during load

**Results:**
- [ ] Workspace skeleton appears
- [ ] Admin chunk loads after initial load
- [ ] No full page reload
- [ ] Smooth transition

### Image Optimization Test
**Steps:**
1. Open Network tab
2. Filter by "Img"
3. Check image formats and sizes

**Results:**
- [ ] WebP/AVIF format delivered
- [ ] Responsive srcset used
- [ ] Blur placeholders visible
- [ ] Lazy loading works (below fold)
- [ ] Images < 200 KB each

### Font Loading Test
**Steps:**
1. Open Network tab
2. Check font loading behavior
3. Look for FOIT (flash of invisible text)

**Results:**
- [ ] `font-display: swap` working
- [ ] No invisible text flash
- [ ] Variable fonts loaded
- [ ] Fonts preloaded correctly

**Notes:**
```
[Record performance observations]
```

---

## 🧪 5. Feature Validation

### Images & Loading States (Phase 1)
- [ ] Product images use Next.js Image
- [ ] Blur placeholders show while loading
- [ ] Images lazy load below the fold
- [ ] Loading states on save buttons
- [ ] Loading states on remove buttons
- [ ] Double-click prevented during operations

### Memory Leaks Fixed (Phase 2)
- [ ] useAbortableEffect hook works
- [ ] Requests cancelled on unmount
- [ ] No "setState after unmount" warnings
- [ ] Cleanup functions run correctly
- [ ] Memory usage stays under 100 MB

### Error Tracking (Phase 3)
- [ ] Error boundaries catch errors
- [ ] Fallback UI shows on error
- [ ] "Try again" button works
- [ ] Errors logged to console (dev mode)
- [ ] (Optional) Errors sent to Sentry

### Safari Compatibility (Phase 4)
- [ ] CSS Grid renders correctly
- [ ] Flexbox behaves correctly
- [ ] Transforms have webkit prefixes
- [ ] GPU acceleration smooth
- [ ] Date formatting works
- [ ] Modal z-index correct
- [ ] Drag & drop smooth

### Lighthouse Optimization (Phase 5)
- [ ] Admin components lazy loaded
- [ ] Skeleton appears during load
- [ ] Code splitting works
- [ ] Fonts optimized (display: swap)
- [ ] DNS prefetch configured
- [ ] Cache headers correct

---

## 🐛 6. Bug Report Template

**Bug #:** ______  
**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low  
**Priority:** [ ] P0 [ ] P1 [ ] P2 [ ] P3  

**Title:**
```
[Concise description]
```

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
```
[What should happen]
```

**Actual Behavior:**
```
[What actually happens]
```

**Environment:**
- Browser: ______
- OS: ______
- Device: ______
- Screen Size: ______

**Screenshots/Video:**
[Attach if applicable]

**Console Errors:**
```
[Paste console output]
```

**Additional Context:**
```
[Any other relevant information]
```

---

## ✅ 7. Acceptance Criteria

### Sprint 1 Goals
- [ ] Lighthouse Performance ≥ 90
- [ ] Bundle size < 500 KB
- [ ] Memory usage < 100 MB
- [ ] Safari compatibility ≥ 95%
- [ ] Zero memory leaks
- [ ] All features functional
- [ ] No console errors

### Deployment Readiness
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

---

## 📝 8. Test Results Summary

**Date:** __________  
**Tested By:** __________  
**Build Version:** __________  

### Overall Status
- [ ] ✅ All tests passed
- [ ] ⚠️ Tests passed with minor issues
- [ ] ❌ Tests failed - blocking issues found

### Test Coverage
- Lighthouse Audits: [ ] Pass [ ] Fail
- Cross-Browser: [ ] Pass [ ] Fail
- Memory Leaks: [ ] Pass [ ] Fail
- Performance: [ ] Pass [ ] Fail
- Features: [ ] Pass [ ] Fail

### Bugs Found
- Critical: ____ bugs
- High: ____ bugs
- Medium: ____ bugs
- Low: ____ bugs

### Recommendation
- [ ] ✅ Ready for production
- [ ] ⏸️ Ready for staging (minor fixes needed)
- [ ] ❌ Not ready (critical issues)

**Sign-off:**

_______________ (QA Engineer)  
_______________ (Tech Lead)  
_______________ (Product Owner)  

---

## 🔧 9. Debugging Tools

### Chrome DevTools
```javascript
// Check lazy loading
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('.js'))
  .forEach(r => console.log(r.name, (r.transferSize / 1024).toFixed(2) + ' KB'));

// Check memory usage
console.log((performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB');

// Check bundle size
for (const [key, value] of performance.getEntriesByType('navigation')[0]) {
  if (key.includes('Size')) console.log(key, value);
}
```

### React DevTools Profiler
1. Open React DevTools
2. Go to Profiler tab
3. Click record
4. Interact with app
5. Stop recording
6. Analyze render times

### Network Tab Filters
```
# Only JavaScript
type:script

# Only Images
type:image

# Only Fonts
type:font

# Larger than 100KB
larger-than:100000
```

---

## 📚 Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
