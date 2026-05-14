---
paths:
  - "src/app/api/**"
  - ".env*"
  - "supabase/**"
  - "next.config.*"
---

# Security Rules

## Inherited from TOOLSTACK.md

These rules apply to every project; see `docs/TOOLSTACK.md` Section 14 for the canonical version:

- **EU data residency is mandatory.** Supabase eu-central-1/2, Sentry DE. Never move to US regions without re-doing GDPR review.
- **No secrets in any committed file. Ever.** Real values live only in Vercel env vars and (for local dev) `.env.local` (gitignored).
- **No real API keys in `.env.local.example` or any markdown** — names only.
- **No PII in Sentry.** Strip `email` and `ip_address` in the `beforeSend()` hook of `sentry.client.config.ts`.
- **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** Never reaches the browser. If you find yourself wanting it client-side, you have a design problem.
- **RLS-first.** Default-deny on every new table; opt in via policies. Use the user-client (RLS-enforced) for ownership lookups and admin-client only for writes that legitimately must bypass RLS.
- **Stripe writes only via verified webhooks** — never trust client-side success redirects.

## Secrets Management
- NEVER commit secrets, API keys, or credentials to git
- Use `.env.local` for local development (already in .gitignore)
- Use `NEXT_PUBLIC_` prefix ONLY for values safe to expose in browser
- Document all required env vars in `.env.local.example` with dummy values

## Input Validation
- Validate ALL user input on the server side with Zod
- Never trust client-side validation alone
- Sanitize data before database insertion

## Authentication
- Always verify authentication before processing API requests
- Use Supabase RLS as a second line of defense
- Implement rate limiting on authentication endpoints

## Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Strict-Transport-Security with includeSubDomains

## Code Review Triggers
- Any changes to RLS policies require explicit user approval
- Any changes to authentication flow require explicit user approval
- Any new environment variables must be documented in .env.local.example
