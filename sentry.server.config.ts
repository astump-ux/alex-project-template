// sentry.server.config.ts
// Runs on Vercel serverless functions. Loads Sentry for server-side errors.
//
// See docs/TOOLSTACK.md Section 5 for the canonical pattern.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,

  // Strip PII from server events as well
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
