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

let activePhotoUploadsCount = 0;

export function beginPhotoUpload() {
  activePhotoUploadsCount += 1;
}

export function endPhotoUpload() {
  activePhotoUploadsCount = Math.max(0, activePhotoUploadsCount - 1);
}

export function isPhotoUploadInProgress(): boolean {
  return activePhotoUploadsCount > 0;
}

let realtimeChannel: RealtimeChannel | null = null;
let localBroadcastChannel: BroadcastChannel | null = null;
const remoteUpdateListeners = new Set<(syncedAt: string, rev?: number) => void>();

function ensureRealtimeChannels() {
  if (typeof window === 'undefined') return;

  if (!localBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      localBroadcastChannel = new BroadcastChannel('raja_academy_cloud_sync_v2');
      localBroadcastChannel.onmessage = (ev) => {
        const msg = ev.data;
        if (msg && msg.senderId !== CLIENT_INSTANCE_ID && msg.syncedAt) {
          remoteUpdateListeners.forEach((cb) => cb(msg.syncedAt, msg.rev));
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
            remoteUpdateListeners.forEach((cb) => cb(ts, body.rev));
          }
        })
        .subscribe();
    } catch {
      // Ignore realtime init errors
    }
  }
}

export function subscribeToRealtimeCloudSync(
  onRemoteUpdate: (syncedAt: string, rev?: number) => void
): () => void {
  ensureRealtimeChannels();
  remoteUpdateListeners.add(onRemoteUpdate);
  return () => {
    remoteUpdateListeners.delete(onRemoteUpdate);
  };
}

export function broadcastCloudStateUpdated(syncedAt: string, rev?: number) {
  ensureRealtimeChannels();
  const message = {
    senderId: CLIENT_INSTANCE_ID,
    syncedAt,
    rev,
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
  rev?: number;
  updatedAt?: string;
  syncedAt?: string;
  data?: any;
  error?: string;
}

export interface PhotoUploadTarget {
  module: 'op' | 'skillAudit';
  key: string;
}

/**
 * Uploads a compressed base64 dataURL photo to Supabase Storage public bucket (raja-academy-media)
 * and atomically registers it in the latest immutable cloud snapshot if `photoTarget` is provided.
 */
export async function uploadPhotoToCloud(
  dataUrl: string,
  folder = 'documentation',
  photoTarget?: PhotoUploadTarget
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  beginPhotoUpload();
  try {
    const res = await fetch('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPLOAD_PHOTO',
        folder,
        dataUrl,
        photoTarget,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.ok && typeof json.url === 'string' && json.url.startsWith('http')) {
        if (json.rev) {
          broadcastCloudStateUpdated(json.updatedAt || new Date().toISOString(), json.rev);
        }
        return json.url;
      }
    }
  } catch {
    // Offline fallback: keep compressed dataUrl, server will externalize on next state sync
  } finally {
    endPhotoUpload();
  }
  return dataUrl;
}

/**
 * Uncached check for the latest cloud `rev` & `updatedAt` (queries Supabase PostgreSQL metadata directly)
 */
export async function fetchCloudStateMeta(): Promise<{ rev: number; updatedAt: string } | null> {
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
        if (json?.ok && (json.rev || json.updatedAt)) {
          return {
            rev: Number(json.rev) || Date.parse(json.updatedAt) || 0,
            updatedAt: json.updatedAt || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Fetches the persisted database state from Supabase Online (immutable versioned snapshot)
 */
export async function fetchCloudDatabaseState(): Promise<CloudSyncResponse> {
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
    // Ignore and return unreachable so stale CDN cache is never used
  }

  return { ok: false, error: 'CLOUD_UNREACHABLE' };
}

/**
 * Saves the full database state to Supabase Online (writes a brand-new immutable snapshot)
 * and broadcasts a real-time sync signal with `rev` to all connected laptops/devices.
 */
export async function saveCloudDatabaseState(snapshot: any): Promise<CloudSyncResponse> {
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
          broadcastCloudStateUpdated(json.syncedAt || new Date().toISOString(), json.rev);
          return json;
        }
      }
    }
  } catch {
    // Ignore
  }

  return { ok: false, error: 'CLOUD_SAVE_FAILED' };
}
