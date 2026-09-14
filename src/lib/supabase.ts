import { createClient } from '@supabase/supabase-js';

/**
 * Sanitizes and normalizes Supabase project URL.
 * Automatically cleans /rest/v1, /auth/v1, trailing slashes, or quotes
 * if the user entered the REST API endpoint from their Supabase dashboard.
 */
export function sanitizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  let cleaned = url.trim().replace(/^['"]|['"]$/g, '');
  try {
    const parsed = new URL(cleaned);
    // If it's a supabase.co domain, extract just the base protocol + hostname
    if (parsed.hostname.endsWith('.supabase.co')) {
      return `${parsed.protocol}//${parsed.hostname}`;
    }
    // For custom domains or self-hosted Supabase, remove /rest/v1 or /auth/v1 paths
    cleaned = cleaned.replace(/\/(rest|auth)\/v1\/?$/i, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  } catch {
    return cleaned.replace(/\/(rest|auth)\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

// Supabase browser client
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = rawSupabaseAnonKey.trim().replace(/^['"]|['"]$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

