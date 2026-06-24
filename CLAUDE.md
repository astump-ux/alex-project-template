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

## 10. Working with this project in Cowork / Claude Code

### Git source of truth: ALWAYS the cloud GitHub repo (convention)

**Use the write-enabled GitHub MCP connector for every Git operation — reads *and* writes — against `github.com/astump-ux/[PROJECT NAME]`.** This is the standing convention; do not deviate. Treat the project as **remote-first**: read from and write to `origin/main` via the MCP connector. Any local clone is **not** the source of truth.

**Do NOT commit or push via the local sandbox git.** The Cowork bash sandbox mounts the working folder, but that mount has shown stale / truncated file views that lag the editor/file tools. Push content verified via the file tools (Read/Write), not via the sandbox mount.

### Read operations
The write-enabled GitHub MCP connector handles all reads: browsing files, reading code, listing issues/PRs, viewing commits.

### Write operations (commits, pushes, branches, PRs, issue updates)
Use the **same write-enabled GitHub MCP connector**. Commit style per `docs/TOOLSTACK.md` §13 (sprint-based + conventional commits; add `Co-Authored-By: Claude <noreply@anthropic.com>` for AI-assisted commits). A push/merge to `main` auto-deploys via Vercel. Once write access is confirmed for the repo, drop a `.mcp-write-verified.txt` marker in the repo root so future sessions know the connector is already wired and skip any setup detour.

### ⚠️ Connector gotcha — read this before concluding "no access"

There are **two** GitHub integrations available, and only one works for private repos:

- The default **OAuth GitHub connector sees only *public* repos.** On a private repo it returns a **404** — which *looks* like "no access / the repo wasn't granted to the app," but is really just "wrong connector." It will also list only the public repos under `astump-ux`, making a private repo look like it doesn't exist.
- The **write-enabled GitHub MCP connector** has full read+write access to the private `astump-ux` repos.

**Rule of thumb:** a `404` (or "repo not found") on a repo you *know* exists is **not** a missing access grant — it means you're on the OAuth connector. Switch to the write-enabled GitHub MCP connector and the repo is right there. Do **not** ask the user to "freigeben in den GitHub-App-Einstellungen" — switch connectors instead.

> The earlier **PAT / `github-write-setup` skill** workaround is **retired.** The write-enabled MCP connector provides persistent read+write access, so no per-session PAT is needed — and stale PATs were themselves a failure source ("Invalid username or token").

---

## 11. Update Log

| Date | Change |
|---|---|
| 2026-06-24 | §10 rewritten: GitHub workflow standardized on the **write-enabled GitHub MCP connector** for reads + writes (remote-first against `origin/main`). Documented the OAuth-connector "404-on-private = wrong connector, not a missing grant" gotcha; retired the PAT / `github-write-setup` workaround. |
| YYYY-MM-DD | Project initialized from `alex-project-template` |
