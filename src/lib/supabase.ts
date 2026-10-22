import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL) as
  | string
  | undefined;
const anonKey = (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Single Supabase client for the whole app. Only the public anon key is used
 * in the browser — data isolation is enforced by Row Level Security.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'controle-gastos-auth',
      },
    })
  : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase não configurado.');
  return supabase;
}
