# 🚨 Error Pages Guide

**Project:** Gayla Shop  
**Goal:** User-friendly error handling with helpful recovery actions  
**Date:** February 25, 2026  

---

## 🎯 Overview

This guide covers our custom error pages:
- 404 Not Found
- Error Boundary (500 errors)
- Global Error Boundary (critical errors)
- Error tracking integration
- User-friendly messaging

---

## 📝 Error Page Types

### 1. Not Found (404)

**File:** `app/not-found.tsx`  
**When:** Page doesn't exist

**Features:**
- ✅ Branded 404 design
- ✅ Popular pages suggestions
- ✅ Search-like navigation
- ✅ Back to home button
- ✅ Browse products link
- ✅ Accessible headings
- ✅ SEO meta tags (noindex)

**Triggers:**
```typescript
import { notFound } from 'next/navigation';

// In server component
if (!data) {
  notFound(); // Shows app/not-found.tsx
}
```

**Route-Specific 404:**
```typescript
// app/products/[slug]/not-found.tsx
export default function ProductNotFound() {
  return (
    <div>
      <h1>Product Not Found</h1>
      <p>This product doesn't exist or has been removed.</p>
    </div>
  );
}
```

---

### 2. Error Boundary (500)

**File:** `app/error.tsx`  
**When:** Runtime error in page/component

**Features:**
- ✅ Try again button (reset)
- ✅ Back to home link
- ✅ Error details (dev mode)
- ✅ Error ID/digest
- ✅ Helpful suggestions
- ✅ Auto error tracking

**Automatic Catching:**
```typescript
// Any error in components triggers error.tsx
function MyComponent() {
  // This error shows app/error.tsx
  throw new Error('Something went wrong');
}
```

**Manual Trigger:**
```typescript
'use client';

import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Unhandled errors caught by error boundary
    fetchData().catch(error => {
      throw error; // Shows error.tsx
    });
  }, []);
}
```

**Reset Handler:**
```typescript
// app/error.tsx
export default function Error({ error, reset }: ErrorProps) {
  return (
    <button onClick={reset}>
      Try Again {/* Re-renders component */}
    </button>
  );
}
```

---

### 3. Global Error (Critical)

**File:** `app/global-error.tsx`  
**When:** Error in root layout

**Features:**
- ✅ Full HTML page (no layout)
- ✅ Inline styles (no external CSS)
- ✅ Minimal dependencies
- ✅ Hard refresh option
- ✅ Critical error logging

**Differences:**
- Must include `<html>` and `<body>`
- Cannot use layout components
- Catches layout errors
- Last resort error handler

---

## 📦 Error Tracking Integration

### Setup Sentry (Recommended)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### Track Errors in Error Pages

```typescript
// app/error.tsx
import * as Sentry from '@sentry/nextjs';

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'app',
      },
      contexts: {
        page: {
          url: window.location.href,
        },
      },
    });
  }, [error]);

  // ...
}
```

### Track 404s

```typescript
// app/not-found.tsx
import * as Sentry from '@sentry/nextjs';

export default function NotFound() {
  useEffect(() => {
    // Track 404s (useful for finding broken links)
    Sentry.captureMessage('404 Page Not Found', {
      level: 'warning',
      tags: {
        errorType: '404',
        url: window.location.href,
      },
    });
  }, []);

  // ...
}
```

---

## ✍️ User-Friendly Error Messages

### Do's

✅ **Use plain language:**
```
"Something went wrong" ✓
"Uncaught TypeError: Cannot read property 'map' of undefined" ✗
```

✅ **Provide context:**
```
"We couldn't load your orders. Please try again." ✓
"Error 500" ✗
```

✅ **Offer solutions:**
```
"Click 'Try Again' to reload, or contact support if this persists." ✓
"An error occurred." ✗
```

✅ **Be empathetic:**
```
"Sorry for the inconvenience. Our team has been notified." ✓
"Error. Fix it yourself." ✗
```

### Don'ts

❌ **Don't blame the user:**
```
"You entered invalid data" ✗
"Please check your input and try again" ✓
```

❌ **Don't show stack traces to users:**
```typescript
// Show in dev only
{process.env.NODE_ENV === 'development' && (
  <pre>{error.stack}</pre>
)}
```

❌ **Don't use technical jargon:**
```
"HTTP 500 Internal Server Error" ✗
"Something went wrong on our end" ✓
```

---

## 📝 Error Message Examples

### Network Errors

```typescript
const errorMessages = {
  'Failed to fetch': 'Could not connect to server. Please check your internet connection.',
  'NetworkError': 'Network error. Please check your connection and try again.',
  'Timeout': 'Request took too long. Please try again.',
};
```

### Validation Errors

```typescript
const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must be no more than ${max} characters`,
};
```

### Auth Errors

```typescript
const authMessages = {
  unauthorized: 'Please log in to continue',
  forbidden: "You don't have permission to access this page",
  sessionExpired: 'Your session has expired. Please log in again.',
};
```

---

## ✅ Testing Error Pages

### Test 404 Page

```bash
# Navigate to non-existent page
http://localhost:3000/this-page-does-not-exist

# Should show app/not-found.tsx
```

### Test Error Boundary

```typescript
// Create test component
'use client';

export default function TestError() {
  // Throw error on button click
  return (
    <button onClick={() => {
      throw new Error('Test error');
    }}>
      Trigger Error
    </button>
  );
}
```

### Test Global Error

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  // Throw error in layout
  if (process.env.NODE_ENV === 'development') {
    // throw new Error('Test global error');
  }
  
  return <html><body>{children}</body></html>;
}
```

### Test Network Errors

```typescript
// Simulate network error
const { fetch } = useRetryFetch();

try {
  await fetch('/api/broken-endpoint');
} catch (error) {
  // Shows retry UI
}
```

---

## 📊 Monitoring

### Track Error Rates

```typescript
// Track error metrics
const errorMetrics = {
  total404s: 0,
  totalErrors: 0,
  errorsByPage: {},
  errorsByType: {},
};

// In error page
useEffect(() => {
  analytics.track('error_occurred', {
    type: 'boundary',
    page: window.location.pathname,
    message: error.message,
  });
}, [error]);
```

### Sentry Dashboard

```typescript
// View in Sentry:
// - Error count
// - Error types
// - Affected users
// - Stack traces
// - User sessions
// - Performance impact
```

---

## 👍 Best Practices

### Always Provide Recovery Actions

```typescript
// ✅ Good
<div>
  <p>Error loading data</p>
  <button onClick={retry}>Try Again</button>
  <Link href="/">Go Home</Link>
</div>

// ❌ Bad
<div>
  <p>Error</p>
</div>
```

### Keep Error Pages Working

```typescript
// ✅ Error pages should have minimal dependencies
// - No complex components
// - No external API calls
// - Simple, inline styles
// - No authentication required
```

### Test Error Recovery

```typescript
// Verify reset() works
function TestReset() {
  const [count, setCount] = useState(0);
  
  if (count > 0) {
    throw new Error('Test');
  }
  
  return (
    <button onClick={() => setCount(1)}>
      Trigger Error
    </button>
  );
}

// After error, click "Try Again"
// Should reset count to 0 and show button again
```

---

## 📚 References

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [User-Friendly Error Messages](https://uxdesign.cc/how-to-write-error-messages-that-dont-suck-f46f2b4b16ec)
- [Error Boundary Pattern](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
