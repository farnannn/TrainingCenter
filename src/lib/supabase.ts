// ==============================================================================
// SUPABASE CLIENT & ONLINE CLOUD DATABASE SYNCHRONIZATION
// Project ID: oxspxnawhdxfggostbih (https://oxspxnawhdxfggostbih.supabase.co)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_REF = 'oxspxnawhdxfggostbih';
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_REF}.supabase.co`;
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_BFWPoLZ0FkwVbYIaNJjkMA_r4ADaVRx';

export const isLiveSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isLiveSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface CloudSyncResponse {
  ok: boolean;
  source?: 'supabase_postgres' | 'supabase_cloud' | 'empty';
  projectRef?: string;
  updatedAt?: string;
  syncedAt?: string;
  data?: any;
  error?: string;
}

/**
 * Fetches the persisted database state from Supabase Online (oxspxnawhdxfggostbih)
 */
export async function fetchCloudDatabaseState(): Promise<CloudSyncResponse> {
  // 1. Try server-assisted /api/cloud-state endpoint (Vite middleware locally / Vercel Function in production)
  try {
    const res = await fetch('/api/cloud-state', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to direct Supabase PostgREST call if /api/cloud-state is unreachable
  }

  // 2. Fallback: Direct Supabase PostgREST query to public.thr_cloud_state using publishable key
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('thr_cloud_state')
        .select('payload, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.payload) {
        return {
          ok: true,
          source: 'supabase_postgres',
          projectRef: SUPABASE_PROJECT_REF,
          updatedAt: data.updated_at,
          data: data.payload,
        };
      }
    } catch {
      // Ignore if table not created yet
    }
  }

  return { ok: false, error: 'CLOUD_UNREACHABLE' };
}

/**
 * Saves the full database state to Supabase Online (oxspxnawhdxfggostbih)
 */
export async function saveCloudDatabaseState(snapshot: any): Promise<CloudSyncResponse> {
  // 1. Save via /api/cloud-state (persists to both Supabase Storage & Postgres thr_cloud_state)
  try {
    const res = await fetch('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to direct Supabase client
  }

  // 2. Fallback: Direct Supabase PostgREST upsert to public.thr_cloud_state
  if (supabase) {
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase.from('thr_cloud_state').upsert({
        id: 'main',
        payload: snapshot,
        updated_at: nowIso,
      });
      if (!error) {
        return {
          ok: true,
          source: 'supabase_postgres',
          projectRef: SUPABASE_PROJECT_REF,
          syncedAt: nowIso,
        };
      }
    } catch {
      // Ignore
    }
  }

  return { ok: false, error: 'CLOUD_SAVE_FAILED' };
}
