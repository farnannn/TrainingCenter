// ==============================================================================
// SUPABASE CLIENT CONFIGURATION & POSTGRES INTERFACE
// ==============================================================================

// Reads environment variables or falls back to simulated database engine
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
