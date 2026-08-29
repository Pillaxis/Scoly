import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://plwzzbtwovoxbaocijnz.supabase.co";

/**
 * Supabase server-side client using the service role key.
 * Only used in API routes (app/api/...) — NEVER expose this client to the browser.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[getSupabaseServer] Warning: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.");
    }
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
