@docs/TOOLSTACK.md
@docs/MCP_INVENTORY.md
@docs/PRD.md
@features/INDEX.md

# [PROJECT NAME] — Architecture & Source of Truth

> Last updated: [YYYY-MM-DD]
> This file is the primary reference for AI assistants and developers on this project.
> Keep it current. When in doubt, prefer this file over chat memory.

---

## 1. Project Overview

**[PROJECT NAME]** is [one-sentence description of what this project does].

**Primary User / Use Case:** [describe the target user; reference any anchor user]

**Stack (inherited from `docs/TOOLSTACK.md`):**
Next.js 16 (App Router) · TypeScript · Tailwind 4 · shadcn/ui · Supabase (Postgres + Storage + Auth) · Vercel (Hosting) · Sentry (Observability)

**Optional modules enabled in this project:**
- [ ] Stripe payments — see `docs/modules/stripe.md` if enabled
- [ ] AI providers (Anthropic / Google Gemini) — see `docs/modules/ai.md` if enabled
- [ ] Twilio (WhatsApp / SMS) — see `docs/modules/twilio.md` if enabled

---

## 2. Language Convention

- **Code, comments, commit messages, variable names:** English
- **User-facing content** (UI strings, error messages shown to users, marketing copy, docs in `docs/`): German
- **Architectural docs** (this file, ADRs in `docs/`): English
- **Domain-specific German terms in code are OK** when they map to a real-world concept with no clean English equivalent. Don't over-translate.

---

## 3. Core Architecture Decisions

> *Document each non-obvious architecture decision here as you make it. One short subsection per decision: what, why, and the trade-off accepted. Do not pre-fill this section — let it grow with real decisions.*

### 3.1 [First decision title]

[Short description: what is the rule, why does it exist, what's the trade-off]

---

## 4. Data Flow

> *Diagram the main flows once they exist.*

```
[Event] → [Step 1]
       → [Step 2]
       → [Step 3]
```

---

## 5. Database Schema

> *List tables and their purpose once the schema is non-trivial. Skip until you have >5 tables.*

| Table | Purpose |
|---|---|
| `profiles` | (auth-linked user profile — see `docs/TOOLSTACK.md` Supabase section) |

---

## 6. Services (`src/lib/`)

> *List shared modules once you have >5 of them. Reference patterns in `docs/TOOLSTACK.md`.*

| File | Purpose |
|---|---|
| `supabase-server.ts` | SSR Supabase client (cookies-based, RLS-enforced) |
| `supabase-admin.ts` | Service-role Supabase client (server-only, bypasses RLS) |
| `supabase.ts` | Browser Supabase client |
| `utils.ts` | `cn()` and other shared utilities |

---

## 7. API Routes

> *List once you have >5 routes. Group by feature.*

| Route | Method | Purpose |
|---|---|---|

---

## 8. Environment Variables

> *See `docs/TOOLSTACK.md` for the canonical list with naming conventions and which value goes in Vercel vs. .env.local.*
> *Add project-specific env vars here as you add them.*

**Project-specific env vars:**
```
# (none yet — inherits base set from TOOLSTACK.md)
```

---

## 9. Known Gaps & Open TODOs

> *Keep this lean. If a TODO sits here >30 days, either do it or delete it.*

- [ ] [Open item 1]

---

## 10. Update Log

| Date | Change |
|---|---|
| YYYY-MM-DD | Project initialized from `alex-project-template` |
