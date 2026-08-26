import { createClient, SupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  
  // If user pasted dashboard URL: https://supabase.com/dashboard/project/<id>/...
  const dashboardMatch = trimmed.match(/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  
  // If already standard format: https://<id>.supabase.co
  if (trimmed.startsWith("https://") && !trimmed.includes("/dashboard") && !trimmed.includes("placeholder")) {
    return trimmed.replace(/\/+$/, "");
  }
  
  return "";
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const cleanSupabaseUrl = resolveSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

/**
 * Returns true only if Supabase environment variables are properly configured.
 * Validates the URL format and checks for valid non-empty anon key.
 */
export const isSupabaseConfigured =
  !!cleanSupabaseUrl &&
  cleanSupabaseUrl.startsWith("https://") &&
  !!supabaseAnonKey &&
  supabaseAnonKey.length > 10;

let _supabase: SupabaseClient | null = null;

/**
 * Singleton Supabase browser client.
 * Returns null if Supabase is not configured.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_supabase) {
    _supabase = createClient(cleanSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _supabase;
}

// Legacy export for backward compatibility
export const supabase = isSupabaseConfigured
  ? getSupabaseBrowser()!
  : (null as unknown as SupabaseClient);
