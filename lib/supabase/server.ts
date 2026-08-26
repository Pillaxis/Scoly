import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase server-side client using the service role key.
 * Only used in API routes (app/api/...) — NEVER expose this client to the browser.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
