# BOOTSTRAP — Starting a new project from this template

> Step-by-step checklist for spinning up a new project using `alex-project-template`.
> Goal: from "I have an idea" to "deployed Vercel preview" in 30 minutes.

> **Prerequisites:** Git installed locally, Node 24.x, npm. If this is a new machine, see `docs/DEV_ENV.md` first.

---

## Step 1 — Clone the template

In GitHub (web UI):
1. Go to `https://github.com/astump-ux/alex-project-template`
2. Click **"Use this template"** → **"Create a new repository"**
3. Owner: `astump-ux`. Repo name: `<your-project-name>` (lowercase-hyphenated).
4. Visibility: private by default (you can flip later).
5. **Important:** do NOT check "Include all branches" — just `main`.

In Claude Cowork (or your local terminal):
```bash
git clone https://github.com/astump-ux/<your-project-name>
cd <your-project-name>
```

---

## Step 2 — Find-and-replace the template placeholders

The template uses `[PROJECT NAME]` as a placeholder. Replace it with your real project name in:
- `CLAUDE.md` (multiple occurrences)
- `README.md`
- `docs/PRD.md`

In your IDE: project-wide find-and-replace `[PROJECT NAME]` → `<Your Project Name>`.

---

## Step 3 — Decide which optional modules you need

Read `docs/TOOLSTACK.md` Section 1 → "Optional modules enabled in this project".

For each module you don't need, **delete the relevant files**:
- **No Stripe?** Delete `docs/modules/stripe.md` and `src/lib/stripe.ts.template`
- **No AI?** Delete `docs/modules/ai.md` and `src/lib/ai-client.ts.template`
- **No Twilio?** Delete `docs/modules/twilio.md` and `src/lib/twilio.ts.template`

For each module you need:
- Rename `.template` files to remove the `.template` suffix
- Follow the setup steps in the module's `docs/modules/<name>.md`
- Add the module to the "Optional modules enabled" checklist in `CLAUDE.md`

---

## Step 4 — Create the Supabase project

Via Supabase MCP or dashboard:
1. **Organization:** `astump-ux's Org`
2. **Name:** match your GitHub repo name exactly (e.g. `my-new-thing`)
3. **Region:** `eu-central-1` or `eu-central-2`
4. **Postgres version:** latest stable
5. Wait for it to provision (~1 min)
6. Copy the project URL and anon key → add to Vercel env vars in Step 6

---

## Step 5 — Create the Vercel project

Via Vercel dashboard:
1. Click **Add New → Project**
2. Import the GitHub repo `<your-project-name>`
3. Team: `astump-8576s-projects`
4. Framework preset: **Next.js** (auto-detected)
5. **Don't deploy yet** — env vars first

---

## Step 6 — Add env vars to Vercel

In Vercel → Project → Settings → Environment Variables, add:

**Always required:**
```
NEXT_PUBLIC_SUPABASE_URL          (from Step 4)
NEXT_PUBLIC_SUPABASE_ANON_KEY     (from Step 4)
SUPABASE_SERVICE_ROLE_KEY         (from Step 4 → Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SENTRY_DSN            (from Step 7)
SENTRY_AUTH_TOKEN                 (from Step 7)
NEXT_PUBLIC_APP_URL               (https://<your-project-name>.vercel.app for now)
```

**Per optional module:** see the module doc.

Scope: add to **Production**, **Preview**, **Development** (you can use the same Supabase project for all three early on).

---

## Step 7 — Create the Sentry project

Via Sentry dashboard at `https://smart-work-labs-gmbh.sentry.io`:
1. Click **+ Create Project**
2. Platform: **Next.js**
3. Project slug: match your repo name
4. Team: default
5. After creation, copy the DSN → add to Vercel env vars (Step 6)
6. Generate an Auth Token (Settings → Auth Tokens) → add to Vercel as `SENTRY_AUTH_TOKEN`

Update `next.config.ts`:
```typescript
export default withSentryConfig(nextConfig, {
  org: "smart-work-labs-gmbh",
  project: "<your-project-name>",   // ← update this
  // ... rest unchanged
});
```

---

## Step 8 — Local development setup

```bash
cp .env.local.example .env.local
# Fill in .env.local with the same values you put in Vercel
npm install
npm run dev
```

Verify the app boots at `http://localhost:3000`.

---

## Step 9 — First deploy

```bash
git add .
git commit -m "chore: initialize from template"
git push origin main
```

Vercel auto-deploys. Watch the build in the Vercel dashboard. First deploy should be green if env vars are correct.

---

## Step 10 — Tell Claude what to do next

Open the project in Cowork and send Claude this message:

```
I just initialized this project from alex-project-template.
Please:
1. Read CLAUDE.md, docs/TOOLSTACK.md, and docs/MCP_INVENTORY.md
2. Read docs/PRD.md (which I'll fill out next)
3. Run the /requirements skill to help me complete the PRD
4. Then run /architecture to plan the first feature

Don't write code yet — let's plan first.
```

That kicks off the standard requirements → architecture → frontend → backend → qa → deploy flow defined in `.claude/skills/`.

---

## Optional Step 11 — Set up the Google Drive folder

Once the project is real, create the Drive folder structure described in `docs/TOOLSTACK.md` Section 10:

```
📁 Projekte/<your-project-name>/
   📁 01_Specs & Planung/
   📁 02_Quellen & Recherche/
   📁 03_Designs & Mockups/
   📁 04_Verträge & Rechtliches/
   📁 05_Exports & Deliverables/
   📁 99_Archiv/
```

Skip until you actually have specs/sources/designs to put there.

---

## What NOT to do

- **Don't** delete `docs/TOOLSTACK.md` or `docs/MCP_INVENTORY.md`. They're shared conventions; if you customize them per project, you've defeated the point.
- **Don't** commit `.env.local`. It's gitignored for a reason.
- **Don't** branch off `main` for personal experiments. Just create a topic branch per feature and PR back.
- **Don't** add new top-level folders without updating `CLAUDE.md` Section 6.
- **Don't** install new "core" dependencies (auth library, ORM, payments provider) without considering whether they should be additions to TOOLSTACK.md.
