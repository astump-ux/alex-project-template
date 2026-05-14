# alex-project-template

> Personal project template for new web apps under SMART work labs GmbH.
> Pre-wired for Vercel + Supabase + Sentry, with optional Stripe / AI / Twilio modules.

This template is a customization of the [AI Coding Starter Kit](https://github.com/anthropics) (skills, rules, agents) plus a canonical `docs/TOOLSTACK.md` documenting the tools and conventions shared across all my projects.

---

## Start a new project from this template

See **[`docs/BOOTSTRAP.md`](docs/BOOTSTRAP.md)** for the full 10-step checklist.

TL;DR:

1. Click **"Use this template"** on GitHub
2. Create new repo: `<your-project-name>`
3. Replace `[PROJECT NAME]` placeholders in `CLAUDE.md`, `README.md`, `docs/PRD.md`
4. Delete optional modules you don't need (`docs/modules/*.md`)
5. Create matching Supabase + Vercel + Sentry projects (use the MCPs)
6. Fill in Vercel env vars (template is in `.env.local.example`)
7. `git push origin main` → first deploy

---

## What's in this template

### Top-level
- **`CLAUDE.md`** — project-specific architecture notes (lean skeleton; grows with the project)
- **`README.md`** — this file
- **`.env.local.example`** — full env var inventory with optional modules
- **Standard Next.js 16 config** — `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, etc.
- **`components.json`** — shadcn/ui config (`new-york` style, `neutral` base)

### Documentation (`docs/`)
- **`TOOLSTACK.md`** — canonical stack & tool conventions across all my projects
- **`MCP_INVENTORY.md`** — which MCPs are connected and when to use each
- **`BOOTSTRAP.md`** — 10-step checklist for starting a new project
- **`PRD.md`** — empty product requirements template
- **`modules/stripe.md`** — Stripe setup (if your project takes payments)
- **`modules/ai.md`** — Anthropic + Gemini setup (if your project uses LLMs)
- **`modules/twilio.md`** — WhatsApp / SMS setup (if your project sends messages)

### AI-powered workflow (`.claude/`)
- **`skills/`** — `/requirements`, `/architecture`, `/frontend`, `/backend`, `/qa`, `/deploy`, `/help`
- **`rules/`** — general / frontend / backend / security rules Claude follows automatically
- **`agents/`** — specialized sub-agents (backend-dev, frontend-dev, qa-engineer)

### Feature tracking (`features/`)
- **`INDEX.md`** — running list of features in this project
- Individual feature specs land in `features/PROJ-N-<name>.md`

### Source (`src/`)
- Standard Next.js 16 App Router layout
- `src/lib/utils.ts` for shared utilities (and Supabase clients once you wire them up — see `docs/TOOLSTACK.md` Section 3)

---

## The workflow

Once a project is initialized, the standard flow is:

```
/requirements  →  /architecture  →  /frontend  →  /backend  →  /qa  →  /deploy
                       ↑
                   docs/PRD.md
                       ↓
              features/PROJ-1-*.md
```

Each skill is invoked in chat (e.g. type `/requirements` in Cowork). Skills update `features/INDEX.md` and individual feature spec files as work progresses.

For day-to-day development outside the formal workflow, just chat with Claude as normal — it'll automatically read `CLAUDE.md`, `docs/TOOLSTACK.md`, and `docs/MCP_INVENTORY.md` thanks to the `@` references at the top of `CLAUDE.md`.

---

## Conventions enforced by this template

Inherited from `docs/TOOLSTACK.md`:

- **Vercel team:** `astump-8576s-projects`
- **Supabase org:** `astump-ux's Org`, EU region only
- **Sentry org:** `smart-work-labs-gmbh`, DE region
- **GitHub org:** `astump-ux`
- **Node:** 24.x · **Bundler:** Turbopack · **Package manager:** npm
- **Language:** English in code, German in user-facing content
- **Commits:** sprint-based (`Sprint X: ...`) + conventional (`feat(scope): ...`)

---

## When to update this template (vs. a specific project)

**Update this template (`alex-project-template`) when:**
- A new tool is adopted across all your projects
- A naming convention changes
- A security rule needs to apply everywhere
- A pattern proves itself and should become canonical

**Don't update this template when:**
- A change is specific to one project — that goes in the project's `CLAUDE.md`
- Domain logic, schema, or UI — those belong in individual projects

---

## Credits

- Foundation: [`aicodingstarterkit`](https://github.com/astump-ux/aicodingstarterkit) (forked & customized 2026-05)
- Skills framework: AI Coding Starter Kit team
- Customizations: Alexander Stump / SMART work labs GmbH
