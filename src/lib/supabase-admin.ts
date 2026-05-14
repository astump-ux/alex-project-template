// src/lib/supabase-admin.ts
// Service-role Supabase client. BYPASSES RLS.
//
// Use this ONLY for:
//   - Webhook handlers (Stripe, Twilio, etc.)
//   - Cron jobs / background tasks where there is no user session
//   - Admin operations that legitimately need to read/write across users
//
// Pattern for ownership-checked mutations:
//   1. Use supabase-server.ts (user client) to look up the row — RLS enforces ownership
//   2. Use this admin client only for the write
// This is safer than comparing UUIDs manually — see docs/TOOLSTACK.md Section 3.
//
// Lazy singleton pattern: env vars may not be available at module load time
// (e.g. during build), so we initialize on first use instead.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase admin env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}

// Backwards-compatible alias: lets existing routes use `supabaseAdmin.from(...)` directly
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
