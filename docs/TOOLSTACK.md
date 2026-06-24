# TOOLSTACK — Canonical Stack & Tool Conventions

> This is the **single source of truth** for which tools, accounts, and conventions apply to every project under `astump-ux` / SMART work labs GmbH.
> AI assistants and developers should read this before making any architecture or tooling decisions.
> Update this document when conventions change, not when individual projects do.

**Last updated:** 2026-06-24
**Owner:** Alexander Stump
**Legal entity:** SMART work labs GmbH

---

## 0. Reading order

For a new project, read these files in order before writing any code:

1. **`docs/TOOLSTACK.md`** (this file) — what tools we use and why
2. **`docs/MCP_INVENTORY.md`** — which MCP connectors are available and when to use them
3. **`docs/PRD.md`** — the product requirements doc for *this specific* project
4. **`docs/BOOTSTRAP.md`** — the 10-step checklist for starting a new project
5. **`docs/DEV_ENV.md`** — what to install on a new machine to work with this template (per-machine setup, separate from per-project setup)
6. **`CLAUDE.md`** — project-specific architecture notes

---

## 1. Stack Overview

The canonical web stack across all projects:

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 16+ (App Router)** | Latest stable Next.js, server components, native streaming |
| Language | **TypeScript (strict mode)** | Type safety, IDE support |
| Styling | **Tailwind CSS 4** | Utility-first, predictable, fast |
| Components | **shadcn/ui** (`style: new-york`, `baseColor: neutral`) | Copy-paste components, full control, Radix under the hood |
| Icons | **Lucide React** | One icon library, consistent |
| Auth + DB | **Supabase (EU region)** | Postgres + RLS + Auth + Storage in one |
| Payments | **Stripe** (optional module) | Industry standard for SaaS |
| Observability | **Sentry (DE region)** | Errors + performance + session replay |
| AI providers | **Anthropic + Google Gemini** (optional module) | Both available, model per task |
| Comms | **Twilio** (optional module) | SMS / WhatsApp |
| Hosting | **Vercel** | Auto-deploy from `main`, edge functions, env management |
| CI/CD | **Vercel + GitHub Actions** | Vercel for deploys, Actions for cron / manual workflows |
| Code | **GitHub** (org `astump-ux`) | All projects are repos here |

**Node version:** 24.x (matches Vercel default).
**Bundler:** Turbopack (Next.js default in 16+).
**Package manager:** npm. Lockfile (`package-lock.json`) committed.

---

## 2. Hosting & Deployment — Vercel

### Account
- **Team:** `astump-8576s-projects`
- **Team ID:** `team_CgVT6Y3timGOmbTgvrGWXmjY`
- **Dashboard:** https://vercel.com/astump-8576s-projects

### Project naming convention
- Production app: `<project-name>` (e.g. `mediright-app`, `flipstaff`)
- Per-deliverable static sites: `<topic>-<purpose>` (e.g. `xiaomi-analyse`, `byd-analyse`) — these are legacy stock-analysis sites, not template-driven
- Avoid trailing `-app-main`, `-v2`, `-new` suffixes. If you must iterate, delete the old project after migration.

### Deploy convention
- **Branch:** `main` only. No `develop` / `staging` branches.
- **Auto-deploy:** every push to `main` deploys to production via GitHub integration.
- **Preview deploys:** every PR gets a unique preview URL automatically.
- **Rollback:** via Vercel dashboard → Deployments → "Promote to production" on prior deployment.
- **Manual deploys:** via deploy hook URL (one per project, stored in Vercel project settings).

### Env vars in Vercel
- All env vars live in **Vercel → Project → Settings → Environment Variables**, NEVER in the repo.
- Use scopes: **Production**, **Preview**, **Development**.
- Public vars (browser-accessible) must be prefixed `NEXT_PUBLIC_`. Everything else is server-only.
- Local development: copy values into `.env.local` (gitignored).

### Domain pattern
- Default domain: `<project-name>.vercel.app`
- Custom domains attached via Vercel → Domains. Use SMART work labs GmbH's domain registrar.

---

## 3. Database & Auth — Supabase

### Account
- **Organization:** `astump-ux's Org`
- **Org slug:** `illhztykeskvwpbaurnf`
- **Dashboard:** https://supabase.com/dashboard/org/illhztykeskvwpbaurnf

### Project naming convention
- Project name matches the **Vercel project name** wherever possible (e.g. `mediright-app` ↔ `mediright-app` on Vercel)
- **Region:** `eu-central-1` or `eu-central-2` (Frankfurt). Always EU for GDPR. Never US.
- **Postgres version:** latest stable (17 as of 2026-05).

### The 3-client pattern (canonical)

Every project uses three distinct Supabase client modules in `src/lib/`. This is non-negotiable — it's the security boundary.

| File | Role | Used in | Auth model |
|---|---|---|---|
| `supabase-server.ts` | SSR client with cookies | Server components, server actions, route handlers reading user data | **RLS-enforced** via `auth.uid()` |
| `supabase-admin.ts` | Service-role client | Server-only writes that must bypass RLS (cron jobs, webhooks, admin operations) | **Bypasses RLS** — use with extreme care |
| `supabase.ts` | Browser client | Client components only | RLS-enforced via session JWT |

**Pattern: ownership checks in PATCH routes.**
For any mutation route, look up the row using the **user client** (RLS automatically enforces `auth.uid() = user_id`), then write using the **admin client**. Never compare UUIDs manually — RLS is robust against format/type mismatches.

**Pattern: lazy admin singleton.**
Don't initialize the admin client at module load — env vars may not be available during build. Use a lazy getter wrapped in a Proxy for backwards compatibility:

```typescript
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase admin env vars missing');
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}
```

### Migrations
- All schema changes via SQL migration files in `supabase/migrations/`.
- Naming: `NNN_short_description.sql` (e.g. `001_add_phone_to_profiles.sql`).
- Numbered sequentially, never renumbered.
- Apply locally via `supabase db push` or in production via Supabase MCP `apply_migration`.

### RLS policies
- **Default deny.** Every new table starts with RLS enabled and no policies.
- Add per-table policies for `select`, `insert`, `update`, `delete` as needed.
- Always condition on `auth.uid() = user_id` for user-owned rows.

---

## 4. Payments — Stripe (optional module)

> Skip this section if your project doesn't take payments. See `docs/modules/stripe.md` for full setup if you do.

### Account
- **Account:** SMART work labs GmbH
- **Account ID:** `acct_1TOZMr5IQwN04rZy`
- **Dashboard:** https://dashboard.stripe.com/acct_1TOZMr5IQwN04rZy

### Pattern: credit packs + annual subscription
The mediright pricing model is a reusable reference:
- One-time products: `<Project> Starter / Standard / Profi` (credit packs, EUR, no recurring)
- Recurring product: `<Project> PRO Annual` (interval: year, EUR)

Don't use Stripe Customer Portal unless you actually offer plan management — the credit-pack model doesn't need it.

### Webhook handling
- Endpoint: `/api/stripe/webhook`
- Events to subscribe to: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`
- Webhook secret in env: `STRIPE_WEBHOOK_SECRET`
- Always verify the signature before processing.
- Credit gift / Pro activation logic lives in the webhook handler, idempotent (use `event.id` as a dedup key).

### Test mode rules
- Local development always uses test mode keys (`sk_test_...`, `pk_test_...`)
- Production keys (`sk_live_...`) only in Vercel production env scope
- **Never commit any Stripe key, test or live.**

---

## 5. Observability — Sentry

### Account
- **Organization:** `smart-work-labs-gmbh`
- **Region:** DE (https://de.sentry.io)
- **Dashboard:** https://smart-work-labs-gmbh.sentry.io

### Project naming
- Sentry project slug matches Vercel project name (e.g. `mediright-app` ↔ `mediright-app`).

### Configuration (canonical)
Sentry is wired via `@sentry/nextjs` and the `withSentryConfig()` wrapper in `next.config.ts`. Standard config:

```typescript
// next.config.ts
export default withSentryConfig(nextConfig, {
  org: "smart-work-labs-gmbh",
  project: "<your-project>",
  silent: !process.env.CI,
  sourcemaps: { disable: false },
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
  tunnelRoute: "/monitoring",  // bypass ad blockers
  disableLogger: true,
});
```

### Sentry client config — PII-stripping pattern
Always strip PII from events before sending. Standard `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

**Sample rates** (these are good defaults — increase only if needed):
- `tracesSampleRate: 0.1` — performance traces on 10% of requests
- `replaysSessionSampleRate: 0.1` — session replays on 10% of sessions
- `replaysOnErrorSampleRate: 1.0` — always replay on error

### Alert convention
- All projects: alert on `level:error` unresolved for >1 hour
- Production projects: also alert on `level:warning firstSeen:-24h userCount:>10`

---

## 6. AI Providers (optional module)

> Skip if your project doesn't use LLMs. See `docs/modules/ai.md` for full setup.

### Available providers
- **Anthropic** (`@anthropic-ai/sdk`) — Claude Haiku 4.5 (fast/cheap), Sonnet 4.6 (default), Opus (rare)
- **Google** (`@google/generative-ai`) — Gemini 2.0 Flash / Pro (fallback)

### Pattern: per-task model selection
Don't hardcode model names in business logic. Use an abstraction layer (`src/lib/ai-client.ts`) and store the chosen model per-task in your `app_settings` table (Supabase). This way you can swap models without redeploying.

### Pattern: deterministic-first
For structured tasks (parsing, classification), build a rule engine first. Only fall back to LLM if rule-engine confidence < threshold. Saves money and gives you a baseline that doesn't drift.

### Env vars
```
ANTHROPIC_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
```

---

## 7. Automation — Make.com (optional module)

### Account
- **User:** Alexander Stump (id 51531)
- **Timezone:** Europe/Zurich
- **Dashboard:** https://eu1.make.com

### When to use Make.com vs. native code
- **Use Make.com for:** glue between external SaaS tools (Slack ↔ Airtable ↔ Email), one-off automations that don't justify a full deployment
- **Don't use Make.com for:** anything in the critical path of your web app (use Vercel serverless functions instead — faster, more reliable, version-controlled)

### Webhook convention
Webhook scenarios that get called by your app should have stable names. Document them in this project's CLAUDE.md, not in Make's UI alone.

---

## 8. Storage & Forms — Airtable (optional module)

### Existing workspaces (informational)
- `Offcamp` (`wsp4lZvbMlQcQdDe2`)
- `DLR` (`wspCGKDd2WQx0et0x`)
- `Workspace` (`wspFYIcTT4hvo12dJ`)
- `stocknotes` (`wspvJveGBAeYTe7Tr`)

### When to use Airtable vs. Supabase
- **Airtable** for ad-hoc data collection, forms, content management you'll edit by hand. Best when non-technical collaborators need to view/edit.
- **Supabase** for any data that's part of your app's logic. Default to Supabase unless Airtable's UI is the actual product feature.
- For a new project: create a new Airtable workspace if and only if Airtable is a real part of the project. Don't pre-provision empty workspaces.

---

## 9. Communication — Twilio (optional module)

> Skip if your project doesn't send SMS or WhatsApp. See `docs/modules/twilio.md` for full setup.

Used in mediright-app for WhatsApp PDF ingestion + result notification.

### Env vars
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER  # e.g. whatsapp:+49...
```

### Pattern
- Webhook endpoint at `/api/whatsapp/webhook` (or `/api/sms/webhook`)
- Always verify Twilio's signature before processing
- Keep replies under 3 sentences — WhatsApp users skim

---

## 10. Productivity Tools — Google Workspace

### Convention
We use Google Drive for source documents, Gmail for client comms, Calendar for milestones.

### Google Drive folder structure (canonical)
Every project gets a folder under `📁 Projekte/`:

```
📁 Projekte/
   📁 <project-name>/                  ← matches GitHub repo name (lowercase, hyphenated)
      📁 01_Specs & Planung/           ← exports of PRD.md, feature specs, design briefs
      📁 02_Quellen & Recherche/       ← reference docs, screenshots, articles, competitor analysis
      📁 03_Designs & Mockups/         ← Figma exports, sketches, brand assets
      📁 04_Verträge & Rechtliches/    ← contracts, AGB, legal review notes
      📁 05_Exports & Deliverables/    ← generated PDFs/DOCX, presentations, reports
      📁 99_Archiv/                    ← superseded versions, kept for reference
```

**Rules:**
- Number prefixes so folders sort meaningfully, not alphabetically
- Project subfolder name matches the GitHub repo name exactly
- `99_Archiv` keeps stale content out of sight without deleting

### Gmail
- No automated email sending from app code unless explicitly required (use a transactional provider like Resend if you do — not Gmail SMTP)
- Client comms by hand, not by Claude unless you reviewed every word

### Calendar
- Project milestones go in your personal calendar with a `[<project-name>]` prefix

---

## 11. Connected MCPs (reference)

See `docs/MCP_INVENTORY.md` for the full list with usage rules. Quick summary:

| MCP | Purpose | Default behavior |
|---|---|---|
| **GitHub (write-enabled MCP connector)** | Repo reads **and** writes: browse/read files, commits, pushes, branches, PRs, issues | Use for **ALL** git ops, remote-first against `origin/main`. **NOT** the default OAuth GitHub connector — that one only sees *public* repos and returns **404 on private repos** (looks like a missing grant, is actually the wrong connector). See `CLAUDE.md` §10. |
| Vercel | Project + deploy management | Use freely for the current project |
| Supabase | DB queries + migrations | Use freely for the current project |
| Stripe | Read products / customers / payments | Read-only freely; write actions need confirmation |
| Sentry | Read issues + analyze with Seer | Use freely |
| Make.com | Scenario management | Use only when explicitly working on automations |
| Airtable | Workspace + base management | Use only when explicitly working on Airtable data |
| Google Drive / Gmail / Calendar | Read documents, draft emails | **Always confirm before sending or modifying** |
| Gamma | Create presentations | Use for deliverables, not project source |

---

## 12. Canonical Env Var Inventory

Names only — never put real values in this file. Real values live in:
- **Vercel → Project → Settings → Env Variables** (production source of truth)
- **`.env.local`** in your local checkout (gitignored)

### Always required (every project)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN          # for source map uploads, CI-only
NEXT_PUBLIC_APP_URL        # canonical app URL, no trailing slash
```

### If using Stripe
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_<PRODUCT_NAME>  # one per product
```

### If using AI
```
ANTHROPIC_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
```

### If using Twilio
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER
```

### For internal route-to-route calls (rare)
```
INTERNAL_API_SECRET
```

---

## 13. Commit Conventions

- **Style:** sprint-based + conventional commits hybrid
- **Format:**
  - For sprints / multi-commit features: `Sprint <X>: <high-level description>` followed by bulleted body
  - For single-purpose commits: `<type>(<scope>): <description>` (e.g. `fix(matching): handle missing invoice date`)
- **Allowed types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `revert`
- **Body:** explain *why* the change was needed; the diff already shows *what*
- **Language:** English. German domain terms OK if they're already in code.
- **Co-author tag for AI-assisted commits:** `Co-Authored-By: Claude <noreply@anthropic.com>` (optional but useful for audit)

---

## 14. Security Conventions

- **No secrets in any committed file. Ever.** Use Vercel env vars + `.env.local`.
- **No real API keys in `.env.local.example`** — names only.
- **No PII in Sentry** — strip in `beforeSend()` hook.
- **EU data residency** — Supabase EU-Central, Sentry DE. Never move to US regions without re-doing GDPR review.
- **All Stripe writes go through verified webhooks**, never trust client-side success callbacks.
- **Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only.** Never reaches the browser. If you find yourself wanting to use it client-side, you have a design problem.
- **RLS-first:** default deny on every new table, opt in to access via policies.

---

## 15. When this file changes

Update this file when:
- A new tool is adopted across projects
- A naming convention changes
- A security rule is added or modified
- A pattern proves itself in production and should become canonical

**Don't update this file for project-specific changes** — those go in the project's `CLAUDE.md`.

**Update protocol:**
1. Edit the relevant section
2. Update "Last updated" at the top
3. Commit with: `docs(toolstack): <what changed>`
4. Optionally: propagate the change to existing projects via PR
