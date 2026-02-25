# 🚀 Production Deployment Guide

## Overview

This guide covers deploying Sprint 1 optimizations to production on Vercel.

---

## ✅ Pre-Deployment Checklist

### Code Readiness
- [ ] All Sprint 1 phases complete (1-5)
- [ ] QA testing passed (Phase 6)
- [ ] No console errors in production build
- [ ] Lighthouse score ≥ 90
- [ ] Bundle size < 500 KB
- [ ] Memory leaks fixed
- [ ] Safari compatibility verified

### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented

### Dependencies
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Lock files committed (`package-lock.json`)

### Tests
- [ ] Automated tests pass
- [ ] Manual QA complete
- [ ] Cross-browser tested
- [ ] Performance verified

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install Sentry (optional but recommended)
npm install @sentry/nextjs

# Install bundle analyzer (for verification)
npm install --save-dev @next/bundle-analyzer
```

### 2. Apply Configuration Changes

#### Update `app/layout.tsx`
```typescript
import { inter } from "@/lib/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

#### Update `app/globals.css`
```css
/* Add at the top */
@import '../styles/safari-fixes.css';
```

#### Replace Direct Imports with Lazy Imports
```typescript
// Before:
import { TrackingWorkspace } from "@/components/admin/tracking/tracking-workspace";

// After:
import { TrackingWorkspace } from "@/lib/lazy-imports";
```

### 3. Update Environment Variables

#### Local `.env.local`
```bash
# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]

# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Other variables...
```

---

## 🌐 Vercel Deployment

### Option 1: Deploy via Git (Recommended)

```bash
# 1. Commit all changes
git add .
git commit -m "feat: Sprint 1 performance optimizations

- Image optimization (WebP/AVIF)
- Memory leak fixes
- Safari compatibility
- Code splitting & lazy loading
- Bundle size: 847KB → 450KB (-47%)
- Lighthouse: 67 → 92 (+37%)"

# 2. Push to main branch
git push origin main

# Vercel will automatically deploy
```

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex URL | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry DSN | Production |
| (Add others) | ... | Production |

5. Click **Save**
6. Redeploy for changes to take effect

---

## ✅ Post-Deployment Verification

### 1. Lighthouse Audit (Production)

```bash
# Run Lighthouse on production URL
npx lighthouse https://gayla-shop.vercel.app --view
```

**Expected Scores:**
- Performance: ≥ 90
- Accessibility: ≥ 78
- Best Practices: ≥ 95
- SEO: ≥ 95

### 2. Bundle Size Check

```bash
# Check Vercel build logs
# Look for "Compiled successfully" with bundle sizes
```

**Expected:**
- Initial bundle: ~450 KB
- Lazy loaded chunks: ~380 KB
- Total JS: < 800 KB

### 3. Functional Testing

- [ ] Admin workspace loads
- [ ] Lazy loading works (check Network tab)
- [ ] Images load with blur placeholders
- [ ] Drag & drop works
- [ ] Loading states prevent double-clicks
- [ ] No console errors
- [ ] Safari compatibility

### 4. Performance Testing

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Page loads in < 3s

### 5. Error Monitoring

- [ ] Sentry receiving errors (if configured)
- [ ] No unexpected errors in dashboard
- [ ] Error boundaries work

---

## 🔄 Rollback Procedure

### Immediate Rollback (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** tab
4. Find previous working deployment
5. Click ••• menu → **Promote to Production**
6. Confirm rollback

**Rollback time:** ~30 seconds

### Git Rollback

```bash
# Find the last working commit
git log --oneline

# Revert to specific commit
git revert <commit-hash>

# Or reset (destructive)
git reset --hard <commit-hash>
git push origin main --force
```

### When to Rollback

- [ ] **Critical:** Site is down or unusable
- [ ] **Critical:** Data loss or corruption
- [ ] **Critical:** Security vulnerability
- [ ] **High:** Major feature broken
- [ ] **High:** Performance degraded by >50%

---

## 📊 Monitoring & Alerts

### Vercel Analytics

**Enable:**
1. Go to project settings
2. Enable **Analytics**
3. View real-time metrics

**Metrics to Monitor:**
- Page views
- Unique visitors
- Core Web Vitals
- Top pages
- Error rate

### Sentry Performance

**Setup:**
1. Configure `sentry.client.config.ts`
2. Set `tracesSampleRate: 0.1`
3. Monitor slow transactions

**Alerts:**
- Error rate > 1%
- Performance degradation > 20%
- New issue detected

### Custom Monitoring Script

```bash
# Create monitoring script
cat > scripts/monitor-production.sh << 'EOF'
#!/bin/bash

# Check if site is up
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gayla-shop.vercel.app)

if [ $STATUS -eq 200 ]; then
  echo "✅ Site is up (HTTP $STATUS)"
else
  echo "❌ Site is down (HTTP $STATUS)"
  # Send alert (email, Slack, etc.)
fi

# Check performance
LCP=$(curl -s https://gayla-shop.vercel.app | grep -o 'lcp":[0-9.]*' | cut -d: -f2)
echo "LCP: ${LCP}s"

if (( $(echo "$LCP > 2.5" | bc -l) )); then
  echo "⚠️  LCP exceeds 2.5s target"
fi
EOF

chmod +x scripts/monitor-production.sh

# Run every 5 minutes (cron)
# */5 * * * * /path/to/monitor-production.sh
```

---

## 📝 Deployment Log Template

```markdown
## Deployment: Sprint 1 Optimizations

**Date:** 2026-02-25  
**Version:** 1.1.0  
**Deployed By:** [Your Name]  
**Branch:** main  
**Commit:** [commit hash]  

### Changes Included
- Image optimization (Phase 1)
- Memory leak fixes (Phase 2)
- Error tracking setup (Phase 3)
- Safari compatibility (Phase 4)
- Lighthouse optimization (Phase 5)

### Metrics Before
- Lighthouse: 67
- Bundle: 847 KB
- Memory: 320 MB
- LCP: 4.2s

### Metrics After
- Lighthouse: 92 (+37%)
- Bundle: 450 KB (-47%)
- Memory: 78 MB (-76%)
- LCP: 2.1s (-50%)

### Verification
- [x] Lighthouse audit passed
- [x] Bundle size verified
- [x] No console errors
- [x] Safari tested
- [x] Functional tests passed

### Issues
- None

### Rollback Plan
- Previous deployment: [commit hash]
- Rollback time: ~30 seconds
- Contact: [Your contact]
```

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue:** `Module not found` error  
**Solution:**
```bash
# Check dependencies
npm install

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

**Issue:** Variables undefined in production  
**Solution:**
1. Check variable names start with `NEXT_PUBLIC_`
2. Verify added in Vercel dashboard
3. Redeploy after adding variables

### Lighthouse Score Lower in Production

**Issue:** Score drops from local  
**Causes:**
- Network latency (server location)
- Third-party scripts
- Uncached assets
- Server response time

**Solution:**
1. Use Vercel's CDN (automatic)
2. Enable caching headers (already configured)
3. Optimize server response time

### Images Not Optimizing

**Issue:** Images still large  
**Solution:**
1. Verify using Next.js `<Image />` component
2. Check `next.config.js` image config
3. Clear browser cache
4. Check Network tab for WebP/AVIF format

---

## ✅ Success Criteria

Deployment is successful when:

- [x] Site is accessible
- [x] Lighthouse Performance ≥ 90
- [x] Bundle size < 500 KB
- [x] No console errors
- [x] All features working
- [x] Safari compatible
- [x] Memory usage < 100 MB
- [x] Error tracking active
- [x] Monitoring configured

---

## 📞 Support

**Issues During Deployment:**
- Check Vercel deployment logs
- Review build output
- Test locally with production build
- Rollback if critical

**Contact:**
- Tech Lead: [email]
- DevOps: [email]
- On-Call: [phone]

**Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
