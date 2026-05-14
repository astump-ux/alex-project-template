# Migration Notes — Retrofitting Existing Projects

> How to bring an existing project (mediright-app, flipstaff, etc.) under this template's conventions WITHOUT breaking it.
> Optional reading. Skip until you actually want to migrate something.

---

## TL;DR — Recommended approach

**Don't migrate. Just adopt the docs.**

The valuable part of this template is `docs/TOOLSTACK.md` and `docs/MCP_INVENTORY.md`. Copy those two files into any existing project, point its `CLAUDE.md` at them with `@docs/TOOLSTACK.md`, and you're 80% of the way there. No code changes, no risk.

---

## Migration tiers

### Tier 1 — Documentation only (safe, ~10 minutes)

Copy these files from `alex-project-template` into the existing project:
- `docs/TOOLSTACK.md`
- `docs/MCP_INVENTORY.md`
- `docs/modules/*.md` (only the ones the project actually uses)

Edit the existing project's `CLAUDE.md`:
1. Add `@docs/TOOLSTACK.md` and `@docs/MCP_INVENTORY.md` to the top (the `@` syntax auto-loads them for Claude)
2. Remove any duplicate content that's now in `TOOLSTACK.md` (env var inventory, account names, conventions)
3. Keep project-specific content (architecture decisions, data flow, schema)

That's it for Tier 1. You now have a single source of truth for stack conventions, and the existing project's docs become *project-specific* rather than *all-the-things*.

### Tier 2 — Code patterns alignment (medium, ~1 hour per project)

For each pattern you want to adopt, change one file at a time:

- **Supabase 3-client pattern:** if the existing project has a single `supabase.ts`, split it into `supabase.ts` (browser), `supabase-server.ts` (SSR), `supabase-admin.ts` (service role). Update imports gradually.
- **Sentry PII stripping:** add `beforeSend()` hook to `sentry.client.config.ts` and `sentry.server.config.ts`.
- **Sentry tunneling:** add `tunnelRoute: "/monitoring"` to `next.config.ts`.
- **Env var naming:** rename anything that diverges from `docs/TOOLSTACK.md` Section 12 conventions. Update Vercel env vars in lockstep.

Do these one at a time, deploy after each, verify nothing broke.

### Tier 3 — Full template adoption (high effort, only when justified)

Not recommended for `mediright-app` — it's deeply entrenched and the template wouldn't add enough value to justify the risk. Better to keep mediright as it is and apply the template to *new* projects.

If you really want to do this for a smaller project:
1. Create a fresh repo from `alex-project-template`
2. Copy the existing project's `src/` and `supabase/migrations/` into it
3. Reconcile `package.json` dependencies
4. Re-test thoroughly before pointing Vercel at the new repo

---

## Project-by-project guidance

### `mediright-app`
- **Recommendation:** Tier 1 only. Don't touch the code.
- The existing CLAUDE.md is mature and project-specific; just trim out the parts duplicated by TOOLSTACK.md.

### `flipstaff`
- **Recommendation:** Tier 1 + Tier 2 if it's still in early stages.
- Brand-new (May 2026), fewer entrenched patterns. Good candidate for code alignment.

### Per-ticker analysis sites (`xiaomi-analyse`, `byd-analyse`, etc.)
- **Recommendation:** Skip entirely.
- These are static deliverables, not apps. They don't benefit from the template.

### `portfolio-canvas`, `v0-stock-analyses`
- **Recommendation:** Tier 1 only.
- Adopt the docs for context, but they're tooling projects with different patterns.

---

## What NOT to migrate

- **User-level skills** (`~/.claude/skills/pkv-*`, `stock-analysis-html`, `email-schreiben`) — these are personal, not project-level. They follow you across all projects automatically.
- **Project-specific schemas, business logic, prompts** — these are by definition NOT template material.
- **Anything tied to the project's specific user / customer** — like mediright's AXA ActiveMe-U references.

---

## Reverse direction — promoting patterns back into the template

If you discover a pattern in an existing project that should become canonical:
1. Verify it works in production for at least 30 days
2. Extract the pattern into a doc or code snippet
3. PR it into `alex-project-template` with a brief justification
4. Update `docs/TOOLSTACK.md` "Last updated" date and `Section 15` (when this file changes)
5. Optionally: propagate the change to other existing projects

The goal is for the template to capture *proven* patterns, not aspirational ones.
