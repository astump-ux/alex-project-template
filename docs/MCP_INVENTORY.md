# MCP Inventory — Connected Tools & Usage Rules

> This document tells AI assistants (Claude) which Model Context Protocol (MCP) connectors are available, what each one is for, and when to use vs. avoid each.
> Update this file when MCPs are added, removed, or re-scoped.

**Last updated:** 2026-05-14

---

## How to read this document

For each MCP, you'll find:
- **What it does** — capability summary
- **When to use** — default behavior for Claude
- **When NOT to use** — situations where Claude should ask first or refuse
- **Common operations** — high-frequency tool calls

A general rule: **Claude should not modify external state without confirming**, even when a tool is "connected". Reading data and proposing actions is the default; executing changes that affect production systems, billing, communication, or third parties always warrants explicit confirmation in the chat.

---

## 1. Vercel

**What it does:** Project management, deployment inspection, runtime logs, env var visibility.

**When to use freely:**
- List projects, get project details for the *current* project
- List deployments, read deploy metadata, fetch build/runtime logs
- Look up team / project IDs when needed
- Read toolbar comment threads (design feedback)

**When to ask first:**
- Triggering deploys (production has real users)
- Modifying env vars
- Editing or deleting toolbar threads

**Common operations:**
- `list_projects` to find a project by name
- `get_project` to confirm framework / Node version / domains
- `list_deployments` to inspect recent commit history & deploy state
- `get_runtime_logs` for debugging production errors

---

## 2. Supabase

**What it does:** Read schema, list tables, execute SQL, apply migrations, manage edge functions, read advisor notices.

**When to use freely:**
- `list_tables`, `list_migrations`, read advisors
- `execute_sql` for **read queries** during analysis or debugging
- `generate_typescript_types` for keeping TS types in sync with schema

**When to ask first:**
- `execute_sql` with `INSERT`, `UPDATE`, `DELETE`, `ALTER`, `DROP`, `TRUNCATE`
- `apply_migration` — always confirm the migration SQL before applying
- `deploy_edge_function` — confirm function content
- Creating branches (`create_branch`) — has a cost
- Anything in production projects vs. development branches

**When NOT to use:**
- Don't run destructive queries without an explicit "yes do it" in chat
- Don't apply migrations directly — prefer creating a `supabase/migrations/NNN_...sql` file, committing it, and applying via the proper migration flow

**Common operations:**
- `list_projects` → `list_tables` to orient yourself in a new project
- `execute_sql` with `SELECT` to debug data
- `apply_migration` to add a new table / column (after confirmation)

---

## 3. Stripe

**What it does:** Read/create products, prices, payment links, refunds; read customers, payments, invoices.

**When to use freely:**
- Read account info, list products, list prices, list customers, list payments
- Search Stripe docs

**When to ask first (always):**
- `create_product` / `create_price` / `create_payment_link` — these are real money paths
- `create_refund` — irreversible, real money
- `update_subscription` / `cancel_subscription` — affects user billing
- `update_dispute` — legal implications
- Any write operation in **live** (non-test) mode

**Pattern:**
- For development / new product setup, **prefer the Stripe Dashboard** over MCP writes. The Dashboard has confirmation steps; MCP doesn't always.
- For reporting / monitoring, MCP reads are fine.

---

## 4. Sentry

**What it does:** Read issues, replays, profiles; search events; analyze with Seer (AI root cause).

**When to use freely:**
- `find_organizations`, `find_projects`, `find_releases`, `find_teams`
- `search_issues` to triage errors
- `get_sentry_resource` for issue/event details
- `analyze_issue_with_seer` when the user explicitly asks for root cause help
- `get_replay_details` when investigating user-facing errors

**When to ask first:**
- Modifying issue status (resolve / ignore) — these are workflow decisions
- Downloading event attachments (may contain PII)

**Pattern:**
- Default org: `smart-work-labs-gmbh` (region: `https://de.sentry.io`)
- Don't `analyze_issue_with_seer` automatically as a follow-up — only when explicitly requested

---

## 5. Make.com

**What it does:** List / create / update / run scenarios; manage data stores; manage custom apps; manage credentials.

**When to use freely:**
- `users_me`, `scenarios_list`, `executions_list` — reading is fine
- `extract_blueprint_components` to understand existing scenarios

**When to ask first:**
- `scenarios_create`, `scenarios_update`, `scenarios_delete`
- `scenarios_run` — actually triggers automations (could send emails, deploy things)
- `data-stores_create` / `_delete`
- Creating connections / credentials

**Pattern:**
- Make MCP is most useful when the user is *building* a new automation. For day-to-day app work, you usually don't need it.

---

## 6. Airtable

**What it does:** Read / create / update bases, tables, fields, records; manage interface pages.

**When to use freely:**
- `list_workspaces`, `list_bases`, `list_tables_for_base`, `list_records_for_table`
- `get_table_schema`, `search_records`

**When to ask first:**
- `create_base`, `create_table`, `delete_records_for_table`
- Any write to existing data — Airtable changes are often visible to non-technical collaborators

**Pattern:**
- Don't use Airtable for app data. Default is Supabase. Use Airtable only when Airtable's UI is part of the actual workflow.

---

## 7. Google Workspace (Calendar, Gmail, Drive)

**What it does:** Read calendar events; read / draft / send Gmail; read / search Google Drive files.

**When to use freely:**
- Read calendar events (for scheduling context)
- Read existing emails (for context)
- Read Drive files (for source documents)
- **Draft** emails (create as drafts, don't send)

**When to ask first (always):**
- **Sending emails** — verify the recipient list and content explicitly
- Modifying calendar events
- Modifying Drive files (especially shared ones)
- Sharing Drive files with others (changing permissions)

**Pattern:**
- Default to drafts, never auto-send
- For Drive, prefer reading over modifying — the file may be shared and changes propagate

---

## 8. Gamma

**What it does:** Create new presentations / documents / webpages; read existing Gammas; manage themes & folders.

**When to use:**
- When the user explicitly asks for a presentation, deck, or social post
- For generating polished deliverables, not source documents

**When NOT to use:**
- Don't use Gamma for project documentation (CLAUDE.md, TOOLSTACK.md, PRD.md — those are markdown)
- Don't proactively suggest Gamma unless the user asks for a presentation

---

## 9. Claude in Chrome (browser automation)

**What it does:** Drive a Chrome tab via the Claude extension.

**When to use:**
- When the user explicitly asks for browser automation (testing UIs, scraping documented sources, filling forms they need help with)
- When no other MCP can solve the problem

**When NOT to use:**
- Don't browse unless asked — it's slow and shows up visibly in your browser
- Don't use to bypass MCPs that exist for a task (e.g. don't use the browser to do what Vercel MCP can do directly)

---

## 10. Vercel toolbar threads

**What it does:** Read & post to design-feedback threads attached to deploy previews.

**When to use:**
- Reading existing threads for context
- Replying to threads when the user wants to respond to a comment

**When to ask first:**
- Posting new threads — these are visible to everyone on the team

---

## How to know if an MCP is connected in this session

If the user asks "can you do X" and X is in this inventory, try the relevant tool. If it returns an error about the tool not being available, tell the user the MCP needs to be (re-)connected at `claude.ai/settings/connectors`.

If a tool would be useful but isn't in this inventory, suggest installing it as a custom connector rather than working around it.

---

## When to update this document

- An MCP is added or removed
- A connector's auth scope changes (e.g. we restrict an MCP to read-only)
- A new "ask first" rule is needed because of a near-miss or actual incident
- A pattern proves itself and should become canonical
