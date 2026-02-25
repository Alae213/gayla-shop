import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Server Configuration
 * 
 * Tracks errors in Next.js server-side code:
 * - API routes
 * - Server components
 * - Middleware
 * - getServerSideProps
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

if (SENTRY_DSN && ENVIRONMENT === "production") {
  Sentry.init({
    // Data Source Name
    dsn: SENTRY_DSN,

    // Environment
    environment: ENVIRONMENT,

    // Release version
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "unknown",

    // --- Performance Monitoring ---
    
    // Lower sample rate on server to reduce overhead
    tracesSampleRate: 0.05, // 5% of requests

    // --- Filtering ---
    
    // Ignore expected errors
    ignoreErrors: [
      "AbortError",
      "Operation aborted",
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
    ],

    // --- Privacy ---
    
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }

      // Redact phone numbers from request data
      if (event.request?.data) {
        const data = JSON.stringify(event.request.data);
        event.request.data = JSON.parse(
          data
            .replace(/\+213\s?\d{3}\s?\d{3}\s?\d{3}/g, "+213 XXX XXX XXX")
            .replace(/0\d{9}/g, "0XXXXXXXXX")
        );
      }

      return event;
    },

    // --- Debugging ---
    
    debug: false,
  });
}
