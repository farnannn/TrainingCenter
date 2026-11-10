// ==============================================================================
// SUPABASE CLIENT & REAL-TIME MULTI-DEVICE CLOUD SYNCHRONIZATION
// Project ID: oxspxnawhdxfggostbih (https://oxspxnawhdxfggostbih.supabase.co)
// ==============================================================================

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_REF = 'oxspxnawhdxfggostbih';
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_REF}.supabase.co`;
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_BFWPoLZ0FkwVbYIaNJjkMA_r4ADaVRx';

export const isLiveSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isLiveSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Unique ID for this browser tab instance to avoid self-echo on broadcasts
export const CLIENT_INSTANCE_ID = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

let realtimeChannel: RealtimeChannel | null = null;
let localBroadcastChannel: BroadcastChannel | null = null;
const remoteUpdateListeners = new Set<(syncedAt: string) => void>();

function ensureRealtimeChannels() {
  if (typeof window === 'undefined') return;

  if (!localBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      localBroadcastChannel = new BroadcastChannel('raja_academy_cloud_sync_v1');
      localBroadcastChannel.onmessage = (ev) => {
        const msg = ev.data;
        if (msg && msg.senderId !== CLIENT_INSTANCE_ID && msg.syncedAt) {
          remoteUpdateListeners.forEach((cb) => cb(msg.syncedAt));
        }
      };
    } catch {
      // Ignore if BroadcastChannel is unsupported
    }
  }

  if (supabase && !realtimeChannel) {
    try {
      realtimeChannel = supabase.channel('raja-academy-live-sync', {
        config: {
          broadcast: { self: false },
        },
      });
      realtimeChannel
        .on('broadcast', { event: 'cloud_state_updated' }, (payload) => {
          const body = payload?.payload;
          if (body && body.senderId !== CLIENT_INSTANCE_ID) {
            const ts = body.syncedAt || new Date().toISOString();
            remoteUpdateListeners.forEach((cb) => cb(ts));
          }
        })
        .subscribe();
    } catch {
      // Ignore realtime init errors
    }
  }
}

export function subscribeToRealtimeCloudSync(
  onRemoteUpdate: (syncedAt: string) => void
): () => void {
  ensureRealtimeChannels();
  remoteUpdateListeners.add(onRemoteUpdate);
  return () => {
    remoteUpdateListeners.delete(onRemoteUpdate);
  };
}

export function broadcastCloudStateUpdated(syncedAt: string) {
  ensureRealtimeChannels();
  const message = {
    senderId: CLIENT_INSTANCE_ID,
    syncedAt,
  };
  try {
    localBroadcastChannel?.postMessage(message);
  } catch {
    // Ignore
  }
  try {
    realtimeChannel?.send({
      type: 'broadcast',
      event: 'cloud_state_updated',
      payload: message,
    });
  } catch {
    // Ignore
  }
}

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
 * Uploads a compressed base64 dataURL photo to Supabase Storage public bucket (raja-academy-media)
 * and returns the permanent public URL so all devices/laptops can load it directly.
 */
export async function uploadPhotoToCloud(
  dataUrl: string,
  folder = 'documentation'
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  try {
    const res = await fetch('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPLOAD_PHOTO',
        folder,
        dataUrl,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.ok && typeof json.url === 'string' && json.url.startsWith('http')) {
        return json.url;
      }
    }
  } catch {
    // Offline fallback: keep compressed dataUrl, server will externalize on next state sync
  }
  return dataUrl;
}

/**
 * Lightweight check for the latest cloud `updatedAt` timestamp
 */
export async function fetchCloudStateTimestamp(): Promise<string | null> {
  try {
    const res = await fetch(`/api/cloud-state?metaOnly=1&t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json?.ok && json.updatedAt) {
          return json.updatedAt;
        }
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Fetches the persisted database state from Supabase Online (oxspxnawhdxfggostbih)
 */
export async function fetchCloudDatabaseState(): Promise<CloudSyncResponse> {
  // 1. Try server-assisted /api/cloud-state endpoint (Vite middleware locally / Vercel Function in production)
  try {
    const res = await fetch(`/api/cloud-state?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.ok) {
          return json;
        }
      }
    }
  } catch {
    // Fallback to direct public Supabase Storage URL
  }

  // 2. Direct fallback to public Supabase Storage bucket raja-academy-db/thr_state.json
  try {
    const pubRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/raja-academy-db/thr_state.json?t=${Date.now()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }
    );
    if (pubRes.ok) {
      const snapshot = await pubRes.json();
      if (snapshot && (snapshot.data || snapshot.departments)) {
        return {
          ok: true,
          source: 'supabase_cloud',
          projectRef: SUPABASE_PROJECT_REF,
          updatedAt: snapshot.updatedAt || new Date().toISOString(),
          data: snapshot.data || snapshot,
        };
      }
    }
  } catch {
    // Fallback to PostgREST
  }

  // 3. Fallback: Direct Supabase PostgREST query to public.thr_cloud_state using publishable key
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
 * and broadcasts a real-time sync signal to all other connected laptops/devices.
 */
export async function saveCloudDatabaseState(snapshot: any): Promise<CloudSyncResponse> {
  // 1. Save via /api/cloud-state (merges concurrent photo uploads & persists to Supabase Storage)
  try {
    const res = await fetch('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json?.ok) {
          broadcastCloudStateUpdated(json.syncedAt || new Date().toISOString());
          return json;
        }
      }
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
        broadcastCloudStateUpdated(nowIso);
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
