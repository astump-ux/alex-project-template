// src/lib/supabase-server.ts
// SSR Supabase client. Use in server components, server actions, and route handlers
// where the user's session matters. RLS is enforced via auth.uid().
//
// For client components, use src/lib/supabase.ts.
// For service-role operations (bypasses RLS), use src/lib/supabase-admin.ts.
//
// See docs/TOOLSTACK.md Section 3 for the canonical pattern.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie setting fails when called from a Server Component —
            // that's expected; middleware handles cookie refresh in those cases.
          }
        },
      },
    }
  );
}
