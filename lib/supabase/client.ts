import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://plwzzbtwovoxbaocijnz.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_jgH10PehN1XwT8FNPv06ag_M3gvrmQS";

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

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const cleanSupabaseUrl = resolveSupabaseUrl(rawUrlClean(rawSupabaseUrl)) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

function rawUrlClean(val: string): string {
  return val ? val.trim() : "";
}

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
 * Singleton Supabase browser client with multi-device persistent session.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_supabase) {
    _supabase = createClient(cleanSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabase;
}

// Legacy export for backward compatibility
export const supabase = isSupabaseConfigured
  ? getSupabaseBrowser()!
  : (null as unknown as SupabaseClient);

/**
 * Check if the remote database tables are created.
 */
export async function checkSupabaseTablesStatus(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  userCount: number;
  schoolCount: number;
  errorMessage?: string;
}> {
  const client = getSupabaseBrowser();
  if (!client) {
    return {
      connected: false,
      tablesExist: false,
      userCount: 0,
      schoolCount: 0,
      errorMessage: "Supabase client not configured",
    };
  }

  try {
    const { data, error } = await client.from("schools").select("id, name").limit(1);
    if (error) {
      return {
        connected: true,
        tablesExist: false,
        userCount: 0,
        schoolCount: 0,
        errorMessage: error.message,
      };
    }

    return {
      connected: true,
      tablesExist: true,
      userCount: 0,
      schoolCount: data ? data.length : 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      userCount: 0,
      schoolCount: 0,
      errorMessage: err?.message || "Unknown connection error",
    };
  }
}
