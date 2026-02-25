# 🚀 Production Deployment Guide

**Project:** Gayla Shop  
**Date:** February 25, 2026  
**Status:** Ready for Production  

---

## 🎯 Overview

This guide covers deploying Gayla Shop to production:
- Pre-deployment checklist
- Environment configuration
- Build process
- Deployment steps
- Post-deployment verification
- Monitoring and rollback

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] TypeScript compilation successful
- [ ] ESLint warnings resolved
- [ ] Code reviewed and approved
- [ ] Git branch up to date with main

### Performance
- [ ] Lighthouse Performance: 90+
- [ ] Bundle size optimized (< 450 KB)
- [ ] Images optimized (WebP)
- [ ] Fonts subset and preloaded
- [ ] Code splitting configured
- [ ] Lazy loading implemented

### Accessibility
- [ ] Lighthouse Accessibility: 94+
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation tested
- [ ] Screen reader compatible
- [ ] Color contrast verified

### Security
- [ ] API keys in environment variables
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Authentication tested
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

### Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] Deployment instructions clear
- [ ] Environment variables documented
- [ ] Changelog updated

---

## 🔧 Environment Setup

### Environment Variables

**Create `.env.production`:**
```bash
# App
NEXT_PUBLIC_APP_URL=https://gaylashop.com
NODE_ENV=production

# Database
DATABASE_URL=your_production_database_url

# Authentication
NEXTAUTH_URL=https://gaylashop.com
NEXTAUTH_SECRET=your_production_secret

# API Keys (if applicable)
NEXT_PUBLIC_API_KEY=your_api_key

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

**Security Notes:**
- Never commit `.env.production` to git
- Use secrets management (Vercel, AWS Secrets Manager, etc.)
- Rotate secrets regularly
- Use different secrets for each environment

---

## 📚 Build Configuration

### Next.js Config

**Verify `next.config.js`:**
```javascript
module.exports = {
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### Build Scripts

**Update `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "analyze": "ANALYZE=true next build",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

**Step 4: Configure Environment Variables**
```bash
# In Vercel dashboard:
# 1. Go to Project Settings
# 2. Click "Environment Variables"
# 3. Add all variables from .env.production
# 4. Set environment to "Production"
```

**Step 5: Configure Custom Domain**
```bash
# In Vercel dashboard:
# 1. Go to Domains
# 2. Add custom domain
# 3. Follow DNS configuration instructions
# 4. Wait for SSL certificate provisioning
```

### Option 2: Docker + VPS

**Step 1: Create Dockerfile**
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

**Step 2: Build Docker Image**
```bash
docker build -t gayla-shop:latest .
```

**Step 3: Run Container**
```bash
docker run -d \
  --name gayla-shop \
  -p 3000:3000 \
  --env-file .env.production \
  gayla-shop:latest
```

**Step 4: Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name gaylashop.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 5: Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d gaylashop.com
```

### Option 3: AWS (EC2 + S3)

**Step 1: Build Static Export (if applicable)**
```bash
npm run build
npm run export
```

**Step 2: Upload to S3**
```bash
aws s3 sync out/ s3://your-bucket-name --delete
```

**Step 3: Configure CloudFront**
- Create CloudFront distribution
- Point to S3 bucket
- Configure SSL certificate
- Set up custom domain

---

## ✅ Post-Deployment Verification

### Immediate Checks (< 5 minutes)

**Site Accessibility:**
- [ ] Site loads at production URL
- [ ] HTTPS working correctly
- [ ] SSL certificate valid
- [ ] No certificate warnings
- [ ] Custom domain resolves

**Core Functionality:**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Products page loads
- [ ] Admin dashboard accessible
- [ ] Tracking page functional
- [ ] Forms submit correctly

**Performance:**
- [ ] Page load time acceptable (< 3s)
- [ ] Images loading
- [ ] No 404 errors
- [ ] API endpoints responding
- [ ] Database connections working

### Extended Checks (< 30 minutes)

**Lighthouse Audit:**
```bash
lighthouse https://gaylashop.com --output html --output-path ./production-audit.html
```

**Expected Scores:**
- [ ] Performance: 90+
- [ ] Accessibility: 94+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

**Cross-Browser Testing:**
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

**User Flows:**
- [ ] Browse products
- [ ] Create order
- [ ] Track order
- [ ] Admin login
- [ ] View analytics
- [ ] Export data

### Monitoring Setup

**Error Tracking (Sentry):**
```bash
# Verify Sentry is receiving errors
# Check Sentry dashboard for:
# - Zero critical errors
# - Source maps uploaded
# - Error alerts configured
```

**Analytics:**
```bash
# Verify analytics tracking:
# - Google Analytics receiving data
# - Events firing correctly
# - Real-time data visible
```

**Uptime Monitoring:**
```bash
# Setup monitoring with:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom
# - New Relic
# - DataDog
```

---

## 🚨 Rollback Procedures

### Vercel Rollback

**Instant Rollback:**
```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "..." menu
# 4. Select "Promote to Production"
```

**CLI Rollback:**
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url> --scope=<team-name>
```

### Docker Rollback

**Keep Previous Image:**
```bash
# Tag current image
docker tag gayla-shop:latest gayla-shop:backup

# Deploy new version
docker tag gayla-shop:v2.0 gayla-shop:latest

# Rollback if needed
docker stop gayla-shop
docker rm gayla-shop
docker run -d --name gayla-shop gayla-shop:backup
```

### Database Rollback

**Backup Before Deployment:**
```bash
# PostgreSQL
pg_dump -h localhost -U user -d database > backup-$(date +%Y%m%d).sql

# MySQL
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Restore if needed
psql -h localhost -U user -d database < backup-20260225.sql
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

- [ ] Site is accessible
- [ ] No critical errors in Sentry
- [ ] Server resources normal
- [ ] Response times acceptable
- [ ] No security alerts

### Weekly Checks

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Update dependencies (security patches)
- [ ] Backup database

### Monthly Checks

- [ ] Run full Lighthouse audit
- [ ] Review analytics
- [ ] Check for outdated dependencies
- [ ] Review and rotate secrets
- [ ] Update documentation

---

## 🛠️ Troubleshooting

### Build Failures

**Issue:** Build fails with errors
```bash
# Check build locally
npm run build

# Check TypeScript
npm run type-check

# Check for dependency issues
rm -rf node_modules package-lock.json
npm install
```

### Slow Performance

**Issue:** Site loading slowly
```bash
# Check bundle size
npm run analyze

# Profile with Chrome DevTools
# 1. Open DevTools
# 2. Performance tab
# 3. Record page load
# 4. Identify bottlenecks
```

### Database Connection Issues

**Issue:** Can't connect to database
```bash
# Check connection string
# Verify environment variables
# Test database credentials
# Check firewall rules
# Verify database is running
```

### SSL Certificate Issues

**Issue:** SSL certificate invalid/expired
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Or in Vercel/Cloudflare:
# Certificates auto-renew
# Check dashboard for issues
```

---

## 📝 Deployment Checklist Summary

### Before Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Database backed up

### During Deployment
- [ ] Build successful
- [ ] Deploy to staging first
- [ ] Verify staging works
- [ ] Deploy to production
- [ ] Monitor deployment

### After Deployment
- [ ] Site accessible
- [ ] Core features working
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Team notified

---

## ✅ Sign-Off

**Deployed By:** _________________  
**Date:** _________________  
**Version:** _________________  
**Status:** ✅ Production  

**Deployment Notes:**



**Verified By:** _________________  
**Date:** _________________  
