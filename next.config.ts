import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Project-specific Next.js config goes here
};

export default withSentryConfig(nextConfig, {
  // ─── Sentry organization + project (for source map uploads) ───────────────
  // Update `project` to match this project's Sentry project slug.
  // See docs/TOOLSTACK.md Section 5 for the canonical config.
  org: "smart-work-labs-gmbh",
  project: "[PROJECT NAME]",

  // Silent in local dev, verbose in CI
  silent: !process.env.CI,

  // Upload source maps for readable production stack traces
  sourcemaps: {
    disable: false,
  },

  // Auto-instrument server functions, middleware, and the App Router
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,

  // Tunnel Sentry through your own domain to bypass ad blockers
  tunnelRoute: "/monitoring",

  // Don't fail builds if SENTRY_AUTH_TOKEN is missing locally
  disableLogger: true,
});
