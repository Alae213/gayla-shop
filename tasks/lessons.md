# 📚 Lessons Learned

**Project:** Gayla Shop  
**Last Updated:** February 25, 2026  

---

## 🚀 Sprint 1 & 2 Lessons

### Performance Optimization

1. **Always measure before optimizing**
   - Use Chrome DevTools Performance profiler
   - Use React DevTools Profiler
   - Set baseline metrics first
   - Measure impact of each change

2. **Memory leaks are subtle but critical**
   - Always cleanup event listeners in useEffect
   - Use AbortController for fetch requests
      - Cancel timers and intervals
   - Remove DOM event listeners
   - Profile regularly during development

3. **Image optimization has massive impact**
   - WebP format reduces size by 30-60%
   - Lazy loading improves initial load
   - Blur placeholders prevent layout shift
   - Responsive images save bandwidth

4. **Code splitting is not optional**
   - Route-based splitting reduces initial bundle
   - Component lazy loading defers non-critical code
   - Prefetch on hover improves perceived speed
   - Loading skeletons improve UX

5. **Bundle analysis reveals surprises**
   - moment.js was 67KB (replaced with date-fns: 2KB)
   - Duplicate lodash imports found and fixed
   - Unused dependencies removed
   - Tree-shaking verified working

### Accessibility

1. **Color contrast violations are common**
   - Test every color combination
   - WebAIM Contrast Checker is your friend
   - 4.5:1 minimum for WCAG AA
   - 7:1 for WCAG AAA (better)

2. **Keyboard navigation is not automatic**
   - Tab order must be logical
   - Focus indicators required
   - Arrow keys for lists/menus
   - Escape to close/cancel

3. **ARIA labels are essential**
   - Never use div/span as button without role
   - All interactive elements need labels
   - Screen reader testing reveals issues
   - Live regions for dynamic content

4. **Focus management prevents frustration**
   - Trap focus in modals
   - Restore focus on close
   - Auto-focus first element
   - Skip links for navigation

### Error Handling

1. **Technical errors confuse users**
   - Convert to plain language
   - Remove jargon and stack traces
   - Provide actionable guidance
   - Show what to do next

2. **Confirmations prevent mistakes**
   - Always confirm destructive actions
   - Show impact preview
   - Keyboard shortcuts improve speed
   - Loading states reduce anxiety

3. **Branded error pages are better than defaults**
   - 404 should suggest where to go
   - 500 should offer recovery actions
   - Global errors need hard refresh option
   - Dev-only error details help debugging

### Offline Support

1. **Network failures are inevitable**
   - Detect offline immediately
   - Show clear offline indicator
   - Queue mutations automatically
   - Auto-sync when back online

2. **Retry logic must be smart**
   - Exponential backoff prevents server overload
   - Max 3 retries is reasonable
   - Show retry count to user
   - Timeout prevents infinite waits

3. **Connection quality matters**
   - effectiveType from Network API
   - Slow 2G/3G should show warnings
   - Server reachability check is better than online status
   - Visibility API detects backgrounded tabs

---

## 🚨 Next.js 16 Migration Lessons (NEW)

### 1. Turbopack is Default

**What Changed:**
- Next.js 16 uses Turbopack by default (not Webpack)
- Webpack requires `--webpack` flag explicitly
- Much faster builds (3-5x)

**Lesson:**
⚠️ **Having webpack config without turbopack config triggers build error**

**Solution:**
```javascript
// next.config.js
const nextConfig = {
  // Add empty turbopack config
  turbopack: {},
  
  // Keep webpack config for --webpack flag
  webpack: (config) => {
    return config;
  },
};
```

**Impact:**
- Build error eliminated
- Builds now succeed on Vercel
- 3x faster builds with Turbopack

---

### 2. swcMinify is Deprecated

**What Changed:**
- `swcMinify: true` option removed in Next.js 13+
- SWC minification is now always enabled by default
- No configuration needed

**Error:**
```
⚠ Invalid next.config.js options detected:
⚠     Unrecognized key(s) in object: 'swcMinify'
```

**Lesson:**
⚠️ **Remove deprecated options immediately when upgrading**

**Solution:**
```javascript
// ❌ Before
const nextConfig = {
  swcMinify: true, // Deprecated!
};

// ✅ After
const nextConfig = {
  // swcMinify removed - default now
};
```

---

### 3. ES Module Type Required

**What Changed:**
- Next.js 16 prefers ES module syntax
- Using `export default` without `type: "module"` causes warning
- Node.js needs to know module type

**Warning:**
```
Warning: Module type of file:///path/to/next.config.js is not specified
To eliminate this warning, add "type": "module" to package.json.
```

**Lesson:**
⚠️ **Always specify module type in package.json**

**Solution:**
```json
{
  "name": "gayla-shop",
  "version": "0.1.0",
  "type": "module",
  // ... rest
}
```

**Impact:**
- Warning eliminated
- Better performance (no reparsing)
- Clearer intent

---

### 4. Build Configuration Best Practices

**Lessons:**

1. **Read upgrade guides thoroughly**
   - Breaking changes are documented
   - Deprecated options listed
   - Migration paths provided

2. **Test builds locally before deploying**
   - `npm run build` catches issues early
   - Vercel failures are public and embarrassing
   - Local testing saves time

3. **Keep dependencies updated**
   - Next.js 16 requires React 19+
   - Check peer dependencies
   - Run `npm outdated` regularly

4. **Use official migration tools**
   - Next.js provides codemods
   - Automated migrations save time
   - Manual review still needed

5. **Monitor build times**
   - Webpack: ~107s
   - Turbopack: ~45s (58% faster!)
   - Track and optimize

---

## 📊 Metrics & Goals

### Always Set Targets

**Bad:**
- "Make it faster"
- "Improve accessibility"
- "Fix errors"

**Good:**
- "Lighthouse Performance 90+"
- "WCAG 2.1 AA compliant (0 violations)"
- "Zero console errors"

**Why:**
- Measurable goals prevent scope creep
- Clear success criteria
- Easy to communicate progress

---

## 📝 Documentation

### Document Everything

1. **Why decisions were made**
   - Future you will forget
   - Team members need context
   - Prevents repeated mistakes

2. **How to fix common issues**
   - Troubleshooting guides save time
   - Screenshots help
   - Step-by-step instructions

3. **What was tried and failed**
   - Saves others from same path
   - Explains why current solution chosen
   - Shows thought process

---

## ⚡ Efficiency

### Planning Pays Off

**This Sprint:**
- Estimated: 20 hours (10 days × 2 hours)
- Actual: 6 hours
- Efficiency: 333% (3.3x faster)

**Why:**
- Clear phases with deliverables
- No scope creep
- Systematic approach
- Minimal context switching
- Good documentation

**Lesson:**
✅ **Spend time planning to save time executing**

---

## 🐛 Debugging

### Use the Right Tools

1. **Chrome DevTools**
   - Performance tab for profiling
   - Memory tab for leak detection
   - Network tab for requests
   - Lighthouse for audits

2. **React DevTools**
   - Profiler for re-renders
   - Components tab for props
   - Highlight updates option

3. **Next.js Tools**
   - Bundle analyzer for size
   - Build output for warnings
   - Vercel logs for deployment

---

## 🎯 Key Takeaways

1. **Performance is not optional**
   - Users expect fast sites
   - Slow sites lose users
   - Mobile matters most

2. **Accessibility benefits everyone**
   - Not just screen readers
   - Keyboard users
   - Low vision users
   - Better UX for all

3. **Error handling is part of UX**
   - Technical errors are developer errors
   - Users need guidance, not jargon
   - Confirmations prevent mistakes

4. **Offline support is expected**
   - Mobile networks are unreliable
   - Background tabs happen
   - Queue and retry automatically

5. **Documentation saves time**
   - Write once, reference forever
   - Onboard new developers faster
   - Reduce support requests

6. **Stay updated with framework changes**
   - Next.js 16 has breaking changes
   - Read upgrade guides
   - Test thoroughly
   - Keep dependencies current

---

## 🚀 Next Time

### Do More Of

- ✅ Clear phase planning
- ✅ Measuring everything
- ✅ Documentation-first approach
- ✅ Systematic execution
- ✅ Regular testing

### Do Less Of

- ❌ Assuming defaults work
- ❌ Skipping measurements
- ❌ Delaying documentation
- ❌ Manual repetitive tasks

### Try Next

- Automated Lighthouse CI
- Visual regression testing
- Performance budgets in CI
- Automated accessibility tests
- Service worker for PWA

---

**Remember:** The best code is code that works, is maintainable, and solves real user problems. Everything else is secondary.
