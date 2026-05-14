// sentry.client.config.ts
// Runs in the browser. Loads Sentry for client-side errors.
// DSN comes from NEXT_PUBLIC_SENTRY_DSN env variable (Vercel).
//
// See docs/TOOLSTACK.md Section 5 for the canonical pattern.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only track actively in production. Development noise pollutes the dashboard.
  enabled: process.env.NODE_ENV === "production",

  // Performance tracing on 10% of requests
  tracesSampleRate: 0.1,

  // Session replays on 10% of sessions, 100% when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // ─── PII stripping ──────────────────────────────────────────────────────
  // Never send user email or IP to Sentry. EU + GDPR.
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
