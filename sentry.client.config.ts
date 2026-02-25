import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Client Configuration
 * 
 * Tracks errors and performance in the browser.
 * Only initializes in production to avoid noise during development.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

if (SENTRY_DSN && ENVIRONMENT === "production") {
  Sentry.init({
    // Data Source Name - unique identifier for your Sentry project
    dsn: SENTRY_DSN,

    // Environment: production, staging, development
    environment: ENVIRONMENT,

    // Release version for tracking which deploy caused issues
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "unknown",

    // --- Error Tracking ---
    
    // Capture unhandled promise rejections
    integrations: [
      new Sentry.BrowserTracing({
        // Trace HTTP requests
        tracePropagationTargets: [
          "localhost",
          /^https:\/\/.*\.convex\.cloud/,
          /^https:\/\/gayla-shop\.vercel\.app/,
        ],
      }),
      new Sentry.Replay({
        // Mask all text and user input for privacy
        maskAllText: true,
        blockAllMedia: true,
        // Network details for debugging
        networkDetailAllowUrls: [
          /^https:\/\/.*\.convex\.cloud/,
        ],
      }),
    ],

    // --- Performance Monitoring ---
    
    // Sample rate for performance monitoring (0.0 to 1.0)
    // 0.1 = 10% of transactions will be sent
    tracesSampleRate: 0.1,

    // --- Session Replay ---
    
    // Capture 10% of all sessions
    replaysSessionSampleRate: 0.1,
    
    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,

    // --- Filtering ---
    
    // Ignore specific errors that are not actionable
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "atomicFindClose",
      // Network errors (user's connection issues)
      "NetworkError",
      "Network request failed",
      // Expected errors
      "AbortError",
      "Operation aborted",
      // ResizeObserver loop limit exceeded (benign)
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],

    // Don't send errors from browser extensions
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],

    // --- Privacy ---
    
    // Remove sensitive data before sending
    beforeSend(event, hint) {
      // Remove customer phone numbers from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.message) {
            // Redact phone numbers (Algerian format)
            breadcrumb.message = breadcrumb.message.replace(
              /\+213\s?\d{3}\s?\d{3}\s?\d{3}/g,
              "+213 XXX XXX XXX"
            );
            breadcrumb.message = breadcrumb.message.replace(
              /0\d{9}/g,
              "0XXXXXXXXX"
            );
          }
          return breadcrumb;
        });
      }

      // Remove customer data from event context
      if (event.contexts?.order) {
        delete event.contexts.order.customerPhone;
        delete event.contexts.order.customerAddress;
      }

      return event;
    },

    // --- Debugging ---
    
    // Enable debug mode in development
    debug: false,
  });
}

// Export helper to manually capture errors
export function captureError(error: Error, context?: Record<string, any>) {
  if (SENTRY_DSN && ENVIRONMENT === "production") {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    console.error("[Sentry Debug]", error, context);
  }
}

// Export helper to capture messages (info/warnings)
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (SENTRY_DSN && ENVIRONMENT === "production") {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[Sentry Debug] [${level}]`, message);
  }
}

// Export helper to set user context
export function setUserContext(user: { id: string; email?: string; name?: string }) {
  if (SENTRY_DSN && ENVIRONMENT === "production") {
    Sentry.setUser(user);
  }
}

// Export helper to clear user context (on logout)
export function clearUserContext() {
  if (SENTRY_DSN && ENVIRONMENT === "production") {
    Sentry.setUser(null);
  }
}
