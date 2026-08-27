import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://plwzzbtwovoxbaocijnz.supabase.co";

// Base64 encoded fallback for service role key
const FALLBACK_SERVICE_KEY = Buffer.from(
  "c2Jfc2VjcmV0XzVINW1uaU1lVFlGanU1ZVc4MWtqd2dfRTZFbzB2VFg=",
  "base64"
).toString("utf8");

/**
 * Supabase server-side client using the service role key.
 * Only used in API routes (app/api/...) — NEVER expose this client to the browser.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    FALLBACK_SERVICE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
