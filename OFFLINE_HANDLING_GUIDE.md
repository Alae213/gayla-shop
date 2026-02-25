# 📶 Offline Handling Guide

**Project:** Gayla Shop  
**Goal:** Graceful offline experience with auto-retry  
**Date:** February 25, 2026  

---

## 🎯 Overview

This guide covers implementing offline-first features:
- Network status detection
- Offline UI feedback
- Request retry with exponential backoff
- Mutation queuing
- Auto-sync when back online

---

## 📶 Network Status Detection

### useOnlineStatus Hook

**Basic Usage:**
```typescript
import { useOnlineStatus } from '@/hooks/use-online-status';

function MyComponent() {
  const { isOnline, quality, canReachServer } = useOnlineStatus({
    checkServer: true,
    checkInterval: 30000, // Check every 30s
  });

  return (
    <div>
      {!isOnline && <p>You're offline</p>}
      {isOnline && !canReachServer && <p>Server unreachable</p>}
    </div>
  );
}
```

**Features:**
- Browser online/offline events
- Server reachability checks
- Connection quality monitoring
- Debounced status changes
- SSR compatible

**Connection Quality:**
```typescript
const { quality } = useOnlineStatus();

// quality.effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
// quality.downlink: Speed in Mbps
// quality.rtt: Round trip time in ms
// quality.saveData: Data saver enabled
```

---

## 👁️ Offline UI Components

### Offline Banner

**Add to layout:**
```typescript
// app/layout.tsx
import { OfflineBanner } from '@/components/offline-banner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OfflineBanner showQualityWarnings={true} />
        {children}
      </body>
    </html>
  );
}
```

**Features:**
- Shows when offline
- Warning for slow connections
- Auto-hides when back online
- Accessible (ARIA live region)
- Dismissible

**States:**
- ❌ **Offline:** "You are offline. Some features may be unavailable."
- ⚠️ **Server unreachable:** "Connection issues detected. Retrying..."
- ⚠️ **Slow connection:** "Connection is slow. Some features may load slowly."
- ✅ **Back online:** "Back online!" (auto-hides after 3s)

### Connection Status Indicator

**Add to navbar/footer:**
```typescript
import { ConnectionStatusIndicator } from '@/components/offline-banner';

function Navbar() {
  return (
    <nav>
      {/* ... */}
      <ConnectionStatusIndicator />
    </nav>
  );
}
```

---

## 🔄 Request Retry Strategy

### retryFetch Utility

**Basic Usage:**
```typescript
import { retryFetch } from '@/lib/utils/retry-fetch';

async function fetchData() {
  try {
    const response = await retryFetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed after retries:', error);
  }
}
```

**With Options:**
```typescript
const response = await retryFetch('/api/data', 
  {
    method: 'POST',
    body: JSON.stringify(payload),
  },
  {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
);
```

**Exponential Backoff:**
```
Attempt 1: Immediate
Attempt 2: Wait 1s  (1 × 2^0)
Attempt 3: Wait 2s  (1 × 2^1)
Attempt 4: Wait 4s  (1 × 2^2)
Attempt 5: Wait 8s  (1 × 2^3)
```

### useRetryFetch Hook

**In Components:**
```typescript
import { useRetryFetch } from '@/lib/utils/retry-fetch';

function DataComponent() {
  const { fetch, retryState } = useRetryFetch();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed:', error);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {retryState.isRetrying && (
        <p>Retrying... (attempt {retryState.attempt}/3)</p>
      )}
      {data && <DisplayData data={data} />}
    </div>
  );
}
```

---

## 📦 Mutation Queue

### Queue Mutations When Offline

**Setup:**
```typescript
import { useMutationQueue } from '@/lib/mutation-queue';
import { useOnlineStatus } from '@/hooks/use-online-status';

function OrderForm() {
  const { isOnline } = useOnlineStatus();
  const { enqueue, pending, processQueue } = useMutationQueue();

  const handleSubmit = async (data) => {
    if (!isOnline) {
      // Queue for later
      enqueue(
        'create_order',
        '/api/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        10 // Priority (higher = more important)
      );
      
      toast.success('Order saved. Will sync when online.');
      return;
    }

    // Online - submit directly
    await submitOrder(data);
  };

  // Auto-process when back online
  useEffect(() => {
    if (isOnline && pending.length > 0) {
      processQueue();
    }
  }, [isOnline, pending]);

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {pending.length > 0 && (
        <div className="text-warning-300">
          {pending.length} pending changes will sync when online
        </div>
      )}
    </form>
  );
}
```

### Mutation Queue Features

**Persistence:**
- Stored in localStorage
- Survives page reloads
- Max 50 mutations

**Priority:**
```typescript
enqueue('update_critical', url, options, 100); // High priority
enqueue('update_optional', url, options, 10);  // Low priority
```

**Deduplication:**
- Prevents duplicate mutations
- Checks type + timestamp
- Within 1 second window

**Retry Logic:**
- Max 3 attempts per mutation
- Failed mutations moved to failed queue
- Can retry or clear failed

---

## 👍 Best Practices

### Disable Actions When Offline

```typescript
import { useOnlineStatus } from '@/hooks/use-online-status';

function SaveButton() {
  const { isOnline } = useOnlineStatus();

  return (
    <button 
      disabled={!isOnline}
      aria-disabled={!isOnline}
    >
      {!isOnline ? 'Offline - Cannot Save' : 'Save'}
    </button>
  );
}
```

### Show Loading States During Retry

```typescript
const { fetch, retryState } = useRetryFetch();

return (
  <button disabled={retryState.isRetrying}>
    {retryState.isRetrying 
      ? `Retrying... (${retryState.attempt}/3)`
      : 'Submit'
    }
  </button>
);
```

### Provide Feedback

```typescript
const { pending, processing } = useMutationQueue();

return (
  <div role="status" aria-live="polite">
    {processing && (
      <p>Syncing {pending.length} changes...</p>
    )}
  </div>
);
```

### Handle Errors Gracefully

```typescript
try {
  await retryFetch('/api/data');
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An error occurred. Please try again.');
  }
}
```

---

## ✅ Testing Checklist

### Network Status
- [ ] Browser detects offline/online
- [ ] Banner shows when offline
- [ ] Banner hides when online
- [ ] Slow connection warning works
- [ ] Server unreachable detected

### Retry Logic
- [ ] Failed requests retry automatically
- [ ] Exponential backoff delays work
- [ ] Max 3 retries per request
- [ ] Retry count shown to user
- [ ] Gives up after max retries

### Mutation Queue
- [ ] Mutations queue when offline
- [ ] Queue persists across reloads
- [ ] Auto-syncs when online
- [ ] Priority ordering works
- [ ] Failed mutations can retry
- [ ] Pending count accurate

### User Experience
- [ ] Actions disabled when offline
- [ ] Loading states during retry
- [ ] Success/error feedback
- [ ] Queue status visible
- [ ] No data loss offline

---

## 🧪 Testing Offline Behavior

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Click "No throttling" dropdown
4. Select "Offline"
5. Test application behavior

**Throttling Options:**
- Offline
- Slow 3G
- Fast 3G
- Custom (configure speed)

### Firefox DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Click gear icon
4. Check "Enable throttling"
5. Select throttling profile

### Programmatic Testing

```typescript
// Simulate offline
if ('serviceWorker' in navigator) {
  // Toggle offline mode
  navigator.serviceWorker.controller?.postMessage({
    type: 'SIMULATE_OFFLINE',
  });
}
```

---

## 📊 Monitoring

### Track Offline Usage

```typescript
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useEffect } from 'react';

function OfflineAnalytics() {
  const { isOnline, lastOfflineAt } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline && lastOfflineAt) {
      // Track offline event
      analytics.track('user_offline', {
        timestamp: lastOfflineAt,
      });
    }
  }, [isOnline, lastOfflineAt]);

  return null;
}
```

### Track Failed Requests

```typescript
const response = await retryFetch(url, options, {
  onRetry: (error, attempt) => {
    analytics.track('request_retry', {
      url,
      attempt,
      error: error.message,
    });
  },
});
```

### Track Queue Size

```typescript
const { pending } = useMutationQueue();

useEffect(() => {
  if (pending.length > 10) {
    analytics.track('large_mutation_queue', {
      size: pending.length,
    });
  }
}, [pending]);
```

---

## 🛠️ Troubleshooting

### Queue Not Processing

**Check:**
- Is network actually online?
- Is server reachable?
- Check console for errors
- Verify localStorage not full

**Fix:**
```typescript
const { processQueue } = useMutationQueue();

// Manually trigger
processQueue();
```

### Mutations Failing

**Check:**
- Server endpoint correct?
- Authentication tokens valid?
- Request format correct?

**Debug:**
```typescript
const { failed } = useMutationQueue();

console.log('Failed mutations:', failed);
```

### localStorage Full

**Clear old data:**
```typescript
const { clearAll } = useMutationQueue();

// Clear everything
clearAll();
```

---

## 📚 References

- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Online/Offline Events](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Offline First Pattern](https://offlinefirst.org/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
