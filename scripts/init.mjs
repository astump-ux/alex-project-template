#!/usr/bin/env node
/**
 * Init script for alex-project-template.
 *
 * Replaces [PROJECT NAME] placeholders in all relevant files,
 * sets package.json name, and prunes unused docs/modules.
 *
 * Usage:
 *   node scripts/init.mjs <project-name> [--keep mod1,mod2]
 *
 * Modules are kept by default. Use --keep to specify only the ones you want;
 * the rest will be removed from docs/modules/.
 *
 * Examples:
 *   node scripts/init.mjs my-app
 *   node scripts/init.mjs my-app --keep ai
 *   node scripts/init.mjs my-app --keep ai,stripe
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ALL_MODULES = ['ai', 'stripe', 'twilio'];
const PLACEHOLDER_FILES = [
  'CLAUDE.md',
  'README.md',
  'docs/BOOTSTRAP.md',
  'next.config.ts',
];

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0].startsWith('--')) {
    console.error('Usage: node scripts/init.mjs <project-name> [--keep mod1,mod2]');
    console.error('Available modules:', ALL_MODULES.join(', '));
    process.exit(1);
  }

  const projectName = args[0];
  const keepIdx = args.indexOf('--keep');
  const keepModules = keepIdx > -1 && args[keepIdx + 1]
    ? args[keepIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
    : ALL_MODULES;
  const removeModules = ALL_MODULES.filter((m) => !keepModules.includes(m));

  console.log(`\nInitializing project: ${projectName}`);
  console.log(`Keep modules:   ${keepModules.join(', ') || '(none)'}`);
  console.log(`Remove modules: ${removeModules.join(', ') || '(none)'}\n`);

  // 1. Replace [PROJECT NAME] in placeholder files
  let totalReplaced = 0;
  for (const rel of PLACEHOLDER_FILES) {
    const abs = path.join(ROOT, rel);
    try {
      let content = await fs.readFile(abs, 'utf8');
      const matches = (content.match(/\[PROJECT NAME\]/g) || []).length;
      if (matches > 0) {
        content = content.replaceAll('[PROJECT NAME]', projectName);
        await fs.writeFile(abs, content);
        console.log(`  ✓ ${rel} (${matches} replacement${matches === 1 ? '' : 's'})`);
        totalReplaced += matches;
      } else {
        console.log(`  - ${rel} (no placeholders found)`);
      }
    } catch (err) {
      console.warn(`  ⚠ ${rel}: ${err.message}`);
    }
  }
  console.log(`Total placeholder replacements: ${totalReplaced}\n`);

  // 2. Update package.json name
  const pkgPath = path.join(ROOT, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    pkg.name = projectName;
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`  ✓ package.json name set to "${projectName}"\n`);
  } catch (err) {
    console.warn(`  ⚠ package.json: ${err.message}\n`);
  }

  // 3. Remove unused module docs
  for (const mod of removeModules) {
    const modPath = path.join(ROOT, 'docs/modules', `${mod}.md`);
    try {
      await fs.unlink(modPath);
      console.log(`  ✓ removed docs/modules/${mod}.md`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn(`  ⚠ ${mod}.md: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. Next steps:`);
  console.log(`  1. git add -A && git commit -m "chore: initialize ${projectName}"`);
  console.log(`  2. Create Supabase / Vercel / Sentry projects (see docs/BOOTSTRAP.md)`);
  console.log(`  3. Set Vercel env vars (template in .env.local.example)`);
  console.log(`  4. git push origin main\n`);
}

main().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
