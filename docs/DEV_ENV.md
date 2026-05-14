DEV_ENV — Local Machine Setup
> What you need installed on your laptop to develop projects from this template.
> This is **per-machine** setup, not per-project. Install once per computer, then any project from this template just works.
>
> Different from `TOOLSTACK.md`: that doc covers what every *project* uses (Vercel, Supabase, etc.). This doc covers what *your machine* needs.
---
TL;DR — minimum viable setup
If you're on a new machine and just want the fastest path:
Git — `https://git-scm.com/download/win` (Windows) or `brew install git` (macOS)
Node 24.x — `https://nodejs.org` (download the LTS installer matching Node 24)
A terminal — Windows: Git Bash (comes with Git for Windows) or PowerShell; macOS: built-in Terminal
That's it. Optional tools below help, but aren't strictly required.
---
Required tools
Git
Used for: cloning template, pushing projects, every commit.
Install:
Windows: `https://git-scm.com/download/win` → run installer, accept all defaults. Includes Git Bash and Git Credential Manager.
macOS: `brew install git` (install Homebrew first from `https://brew.sh` if needed). Or use the version that ships with Xcode Command Line Tools.
Linux: `sudo apt install git` (Debian/Ubuntu) or equivalent.
Verify:
```bash
git --version
# Should print: git version 2.x.x or similar
```
First-time config (per machine, once):
```bash
git config --global user.name "Alexander Stump"
git config --global user.email "astump@dl-remote.com"
```
Optional: use GitHub's no-reply email for privacy. Find yours at `https://github.com/settings/emails` under "Keep my email addresses private", looks like `12345+astump-ux@users.noreply.github.com`.
Node.js + npm
Used for: running the dev server, building, installing packages.
Install:
Download Node 24.x LTS from `https://nodejs.org` — must match the Vercel Node version (see TOOLSTACK Section 1)
npm comes bundled with Node
Verify:
```bash
node --version    # should print v24.x.x
npm --version     # should print 10.x.x or similar
```
Why 24.x specifically: Vercel uses Node 24 by default. Locally running a different major version risks subtle differences between local and prod (e.g. behaviour of `fetch`, native crypto, ESM resolution). Match Vercel.
A terminal you're comfortable with
Used for: running `git`, `npm`, occasional scripts.
Windows options (any of these works):
Git Bash — bundled with Git for Windows, supports Unix-style commands (`ls`, `cd ~/Downloads/...`). Recommended.
PowerShell — built into Windows, more verbose syntax.
Windows Terminal — Microsoft's modern terminal app, can host any of the above.
cmd (Eingabeaufforderung) — works but uses Windows-style paths (`cd %USERPROFILE%\Downloads`), `dir` instead of `ls`.
macOS: built-in Terminal.app or iTerm2.
---
Optional tools (recommended)
GitHub Desktop
Used for: GUI-driven Git workflow if terminal feels heavy.
When to use: good for visually reviewing diffs before commits, exploring branch history, or if you ever skip the terminal.
Install: `https://desktop.github.com`. Sign in with your GitHub account on first launch.
When NOT to use: if you're comfortable in terminal, skip it — Git Credential Manager (auto-installed with Git for Windows) handles auth equally well.
VS Code
Used for: editing code, when you're not in Cowork.
Install: `https://code.visualstudio.com`. macOS: `brew install --cask visual-studio-code`.
Recommended extensions for this template's stack:
ESLint (`dbaeumer.vscode-eslint`)
Prettier (`esbenp.prettier-vscode`)
Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
GitLens (`eamodio.gitlens`)
TypeScript Vue Plugin (Volar) — not needed; we're not using Vue
Error Lens (`usernamehw.errorlens`) — inline error display
You can dump these into `.vscode/extensions.json` per project so VS Code prompts to install them when you open the repo. Not bundled into the template by default to keep it editor-agnostic.
GitHub CLI (`gh`)
Used for: rapid repo creation, PR management from terminal.
When to use: if you create new repos frequently, `gh repo create alex-new-thing --private --template astump-ux/alex-project-template --clone` is faster than the browser flow.
Install: `https://cli.github.com` or `winget install GitHub.cli` (Windows), `brew install gh` (macOS).
First-time auth: `gh auth login` — walks you through browser-based authentication.
Not required. GitHub web + `git` CLI cover all the same ground.
Claude Code (Anthropic's CLI)
Used for: agentic coding from terminal, when you want Claude to autonomously work through tasks without the chat UI.
Install: see `https://docs.claude.com/en/docs/claude-code/getting-started`. Requires Node 18+ (Node 24 is fine).
When to use: for long-running refactors, multi-file changes, or tasks where Cowork's chat-driven workflow is too much back-and-forth.
When NOT to use: for the standard `/requirements → /architecture → ...` workflow that this template's `.claude/skills/` are designed for — Cowork is better for that.
---
Authentication setup
GitHub (for git push)
You need either:
A) Git Credential Manager (recommended, auto-installed with Git for Windows)
The first `git push` triggers a browser popup
Click "Sign in with your browser"
Authorize "Git Credential Manager" on GitHub
Credentials cached for all future pushes — no token needed
This is what we set up on 2026-05-14
B) Personal Access Token (fallback if popup fails)
Generate at `https://github.com/settings/tokens` → "Generate new token (classic)"
Scope: `repo` (full control of private repos)
Expiration: 90 days
Use the token as the password when git prompts during push
Option A is set up on this machine as of 2026-05-14. Won't need option B unless something breaks.
Vercel CLI (optional)
Only needed if you want to run Vercel commands locally (deploy from CLI, pull env vars). Most workflows don't need this since Vercel auto-deploys from GitHub.
Install: `npm install -g vercel`
Auth: `vercel login`
Supabase CLI (optional but useful)
Used for: running migrations locally, generating TypeScript types, testing edge functions.
Install: `npm install -g supabase` or `brew install supabase/tap/supabase` (macOS).
Auth: `supabase login`
Not required for basic development, but if you do schema work, this saves time.
---
Per-project setup (after cloning a project from this template)
Once your machine is set up, every new project from this template needs:
```bash
git clone https://github.com/astump-ux/<your-project-name>
cd <your-project-name>
npm install
cp .env.local.example .env.local
# fill in .env.local with values from Vercel
npm run dev
```
That's it. App boots at `http://localhost:3000`.
---
Verifying a fresh machine
When you're on a new computer, run this checklist to confirm you can do template work:
```bash
git --version              # need 2.x.x or higher
node --version             # need v24.x.x
npm --version              # need 10.x.x or higher
git config --global user.name    # should print your name
git config --global user.email   # should print your email
```
If any fail, install the missing tool from the sections above.
---
When this doc changes
Update this file when:
A new must-have local tool is added (rare)
The required Node version changes (when Vercel bumps theirs)
A simpler installation path becomes available
Your authentication setup changes (new device, lost credentials, etc.)
Don't update for editor preferences, shell preferences, or any "this is what I happen to use" — those aren't requirements, they're taste.
---
Setup log (this machine)
Date	Machine	What was done
2026-05-14	Windows (stump)	Git for Windows installed; Git Credential Manager OAuth via Browser; user.name + user.email set; first push to `terminal_test`, then `alex-project-template`
