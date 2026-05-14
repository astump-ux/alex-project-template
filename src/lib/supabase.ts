// src/lib/supabase.ts
// Browser Supabase client. Use ONLY in client components.
// RLS is enforced via the session JWT.
//
// For server-side code, use:
//   - supabase-server.ts (SSR with cookies, RLS-enforced)
//   - supabase-admin.ts  (service role, bypasses RLS)
//
// See docs/TOOLSTACK.md Section 3 for the canonical pattern.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Lazy singleton for client components — avoids re-creating clients on every render
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_client) _client = createClient();
  return _client;
}

// Backwards-compatible default export (Proxy delegates to the lazy singleton)
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
