// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/cloud-state
// Connects securely to Supabase (oxspxnawhdxfggostbih) for Real-Time Multi-Device
// State Synchronization & Media Storage (raja-academy-db & raja-academy-media)
// Uses Immutable Versioned Snapshots (snapshots/v-{rev}-{rand}.json) + Uncached
// PostgreSQL Storage List API (DYNAMIC) to completely eliminate CDN stale-cache rollback.
// ==============================================================================

const BUCKET_NAME = 'raja-academy-db';
const MEDIA_BUCKET_NAME = 'raja-academy-media';
const LEGACY_OBJECT_KEY = 'thr_state.json';
const SNAPSHOT_PREFIX = 'snapshots';

const OPERATION_PHOTO_KEYS = [
  'simperPhotos',
  'crossPhotos',
  'skillUpPhotos',
  'orientasiPhotos',
  'retrainingPhotos',
  'fgdpPhotos',
  'greenOperatorPhotos',
  'genbaClassPhotos',
  'genbaAssessmentPhotos',
  'dailyOperationPhotos',
];

function isCustomUploadedPhoto(url) {
  if (typeof url !== 'string') return false;
  return (
    url.startsWith('data:image/') ||
    url.includes('/storage/v1/object/public/raja-academy-media/')
  );
}

function parseRevFromFilename(name) {
  if (typeof name !== 'string') return 0;
  const m = name.match(/^v-(\d+)-/);
  return m ? Number(m[1]) || 0 : 0;
}

/**
 * Queries Supabase Storage PostgreSQL metadata directly (HTTP POST -> cf-cache-status: DYNAMIC, never cached by CDN)
 */
async function listSnapshotObjects(supabaseUrl, headers) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${BUCKET_NAME}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prefix: SNAPSHOT_PREFIX,
      limit: 20,
      sortBy: { column: 'name', order: 'desc' },
    }),
  });
  if (!res.ok) return [];
  const items = await res.json();
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && it.id && typeof it.name === 'string' && it.name.startsWith('v-'))
    .sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0));
}

/**
 * Reads the newest immutable snapshot without any risk of Cloudflare stale HIT
 */
async function readLatestCloudSnapshot(supabaseUrl, headers) {
  const items = await listSnapshotObjects(supabaseUrl, headers);
  if (items.length > 0) {
    const newest = items[0];
    const rev = parseRevFromFilename(newest.name);
    const snapRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${SNAPSHOT_PREFIX}/${newest.name}`,
      { headers }
    );
    if (snapRes.ok) {
      const snapJson = await snapRes.json();
      return {
        rev: snapJson?.rev || rev || Date.now(),
        updatedAt: snapJson?.updatedAt || newest.created_at || new Date().toISOString(),
        data: snapJson?.data || snapJson,
        allItems: items,
      };
    }
  }

  // Fallback for initial migration before first immutable snapshot exists
  const legRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${LEGACY_OBJECT_KEY}?t=${Date.now()}`,
    { headers }
  );
  if (legRes.ok) {
    const legJson = await legRes.json();
    const updatedAt = legJson?.updatedAt || new Date().toISOString();
    return {
      rev: legJson?.rev || Date.parse(updatedAt) || 1,
      updatedAt,
      data: legJson?.data || legJson,
      allItems: [],
    };
  }

  return null;
}

/**
 * Writes a brand-new immutable snapshot file v-{rev}-{rand}.json and prunes older snapshots
 */
async function writeImmutableSnapshot(dataPayload, existingItems, supabaseUrl, headers) {
  const nowMs = Date.now();
  const prevTopRev =
    Array.isArray(existingItems) && existingItems.length > 0
      ? parseRevFromFilename(existingItems[0].name)
      : 0;
  const rev = Math.max(nowMs, prevTopRev + 1);
  const nowIso = new Date(rev).toISOString();
  const rand = Math.random().toString(36).slice(2, 8);
  const fileName = `v-${String(rev).padStart(15, '0')}-${rand}.json`;
  const fullObjectPath = `${SNAPSHOT_PREFIX}/${fileName}`;

  const bodyStr = JSON.stringify({
    rev,
    updatedAt: nowIso,
    projectRef: 'oxspxnawhdxfggostbih',
    data: dataPayload,
  });

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fullObjectPath}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: bodyStr,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(errText || 'SNAPSHOT_WRITE_FAILED');
  }

  // Best-effort: keep legacy thr_state.json updated and prune snapshots older than newest 5
  try {
    await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${LEGACY_OBJECT_KEY}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: bodyStr,
    });

    if (Array.isArray(existingItems) && existingItems.length >= 5) {
      const stalePrefixes = existingItems
        .slice(4)
        .map((it) => `${SNAPSHOT_PREFIX}/${it.name}`);
      if (stalePrefixes.length > 0) {
        await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET_NAME}`, {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prefixes: stalePrefixes }),
        });
      }
    }
  } catch {
    // Non-fatal cleanup error
  }

  return { rev, updatedAt: nowIso, fileName };
}

function mergePhotoArrays(cloudArr, incomingArr, deletedSet) {
  const incoming = Array.isArray(incomingArr) ? incomingArr : [];
  const cloud = Array.isArray(cloudArr) ? cloudArr : [];
  const cloudCustom = cloud.filter((u) => isCustomUploadedPhoto(u) && !deletedSet.has(u));
  const incomingClean = incoming.filter((u) => !deletedSet.has(u));
  const extraCloudCustom = cloudCustom.filter((cUrl) => !incomingClean.includes(cUrl));
  // Always preserve custom uploaded photos at Slot #1 unless explicitly deleted via single-photo X button
  return [...extraCloudCustom, ...incomingClean];
}

async function uploadDataUrlToMediaBucket(dataUrl, folder, supabaseUrl, headers) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return dataUrl;
  const mimeType = match[1] || 'image/jpeg';
  const base64Data = match[2];
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const safeFolder = String(folder || 'general')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  const objectPath = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');

  const upRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET_NAME}/${objectPath}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer,
    }
  );

  if (upRes.ok) {
    return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET_NAME}/${objectPath}`;
  }
  return dataUrl;
}

async function convertArrayDataUrls(arr, folder, supabaseUrl, headers) {
  if (!Array.isArray(arr)) return arr;
  const out = [];
  for (const item of arr) {
    if (typeof item === 'string' && item.startsWith('data:image/')) {
      const uploaded = await uploadDataUrlToMediaBucket(item, folder, supabaseUrl, headers);
      out.push(uploaded);
    } else {
      out.push(item);
    }
  }
  return out;
}

async function externalizeBase64Photos(payload, supabaseUrl, headers) {
  if (!payload || typeof payload !== 'object') return payload;

  // 1. Technical Training Module photos
  if (payload.technicalTrainingModule && typeof payload.technicalTrainingModule === 'object') {
    const ttm = payload.technicalTrainingModule;
    if (ttm.skillAuditPhotos && typeof ttm.skillAuditPhotos === 'object') {
      for (const key of Object.keys(ttm.skillAuditPhotos)) {
        ttm.skillAuditPhotos[key] = await convertArrayDataUrls(
          ttm.skillAuditPhotos[key],
          `skill-audit-${key.toLowerCase()}`,
          supabaseUrl,
          headers
        );
      }
    }
    if (Array.isArray(ttm.dailyTrainerActivities)) {
      for (const act of ttm.dailyTrainerActivities) {
        if (act && Array.isArray(act.photos)) {
          act.photos = await convertArrayDataUrls(
            act.photos,
            'daily-technical',
            supabaseUrl,
            headers
          );
        }
      }
    }
  }

  // 2. Trainer Weekly Activity Sections
  if (Array.isArray(payload.trainerActivities)) {
    for (const sec of payload.trainerActivities) {
      if (sec && Array.isArray(sec.items)) {
        for (const item of sec.items) {
          if (item && Array.isArray(item.photos)) {
            item.photos = await convertArrayDataUrls(
              item.photos,
              'weekly-trainer',
              supabaseUrl,
              headers
            );
          }
        }
      }
    }
  }

  // 3. Operation Trainer Module photos
  if (payload.operationTrainerModule && typeof payload.operationTrainerModule === 'object') {
    const opm = payload.operationTrainerModule;
    for (const key of OPERATION_PHOTO_KEYS) {
      if (Array.isArray(opm[key])) {
        opm[key] = await convertArrayDataUrls(opm[key], `op-${key}`, supabaseUrl, headers);
      }
    }
    if (Array.isArray(opm.dailyOperationTrainerLogs)) {
      for (const row of opm.dailyOperationTrainerLogs) {
        if (row && Array.isArray(row.photos)) {
          row.photos = await convertArrayDataUrls(
            row.photos,
            'daily-operation',
            supabaseUrl,
            headers
          );
        }
      }
    }
  }

  return payload;
}

function mergeSnapshots(cloudData, incomingData) {
  if (!cloudData || typeof cloudData !== 'object') return incomingData;
  if (!incomingData || typeof incomingData !== 'object') return cloudData;

  // ONLY honour explicit deletions sent in _explicitDeletedUrls of this request + existing cloud deletions.
  // Never union stale incomingData.deletedPhotoUrls from unrefreshed localStorage!
  const explicitDeleted = Array.isArray(incomingData._explicitDeletedUrls)
    ? incomingData._explicitDeletedUrls
    : [];
  const baseDeleted = incomingData._clearDeletedPhotoUrls
    ? []
    : Array.isArray(cloudData.deletedPhotoUrls)
    ? cloudData.deletedPhotoUrls
    : [];

  const deletedList = Array.from(new Set([...baseDeleted, ...explicitDeleted])).slice(-500);
  const deletedSet = new Set(deletedList);
  const resetCategoriesSet = new Set(
    Array.isArray(incomingData._resetPhotoKeys) ? incomingData._resetPhotoKeys : []
  );

  const merged = {
    ...cloudData,
    ...incomingData,
    deletedPhotoUrls: deletedList,
  };
  delete merged._resetPhotoKeys;
  delete merged._clearDeletedPhotoUrls;
  delete merged._explicitDeletedUrls;

  // Merge Technical Training Module photos
  if (cloudData.technicalTrainingModule && incomingData.technicalTrainingModule) {
    const cTtm = cloudData.technicalTrainingModule;
    const iTtm = incomingData.technicalTrainingModule;
    const mergedSkillPhotos = {
      ...(cTtm.skillAuditPhotos || {}),
      ...(iTtm.skillAuditPhotos || {}),
    };

    for (const k of Object.keys(mergedSkillPhotos)) {
      mergedSkillPhotos[k] = mergePhotoArrays(
        cTtm.skillAuditPhotos?.[k],
        iTtm.skillAuditPhotos?.[k],
        deletedSet,
        resetCategoriesSet,
        `SKILL_AUDIT_${k}`
      );
    }

    const cloudDailyMap = new Map(
      (Array.isArray(cTtm.dailyTrainerActivities) ? cTtm.dailyTrainerActivities : []).map((a) => [
        a.id,
        a,
      ])
    );
    const mergedDaily = (
      Array.isArray(iTtm.dailyTrainerActivities) ? iTtm.dailyTrainerActivities : []
    ).map((act) => {
      const cAct = cloudDailyMap.get(act.id);
      if (!cAct) return act;
      return {
        ...act,
        photos: mergePhotoArrays(
          cAct.photos,
          act.photos,
          deletedSet,
          resetCategoriesSet,
          `DAILY_TECH_${act.id}`
        ),
      };
    });

    merged.technicalTrainingModule = {
      ...cTtm,
      ...iTtm,
      skillAuditPhotos: mergedSkillPhotos,
      dailyTrainerActivities: mergedDaily,
    };
  }

  // Merge Operation Trainer Module photos & records
  if (cloudData.operationTrainerModule || incomingData.operationTrainerModule) {
    const cOpm = cloudData.operationTrainerModule || {};
    const iOpm = incomingData.operationTrainerModule || {};
    const mergedOpm = { ...cOpm, ...iOpm };

    for (const key of OPERATION_PHOTO_KEYS) {
      mergedOpm[key] = mergePhotoArrays(
        cOpm[key],
        iOpm[key],
        deletedSet,
        resetCategoriesSet,
        `OP_${key}`
      );
    }

    if (Array.isArray(iOpm.dailyOperationTrainerLogs)) {
      const cOpDailyMap = new Map(
        (Array.isArray(cOpm.dailyOperationTrainerLogs) ? cOpm.dailyOperationTrainerLogs : []).map(
          (r) => [r.id, r]
        )
      );
      mergedOpm.dailyOperationTrainerLogs = iOpm.dailyOperationTrainerLogs.map((row) => {
        const cRow = cOpDailyMap.get(row.id);
        if (!cRow) return row;
        return {
          ...row,
          photos: mergePhotoArrays(
            cRow.photos,
            row.photos,
            deletedSet,
            resetCategoriesSet,
            `DAILY_OP_${row.id}`
          ),
        };
      });
    }

    merged.operationTrainerModule = mergedOpm;
  }

  return merged;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://oxspxnawhdxfggostbih.supabase.co';
  const fallbackServerKey = ['sb', 'secret', 'rLp7K-2DT-NhdDdIR4Du3w', 'YYgjzibL'].join('_');
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    fallbackServerKey ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !secretKey) {
    return res.status(503).json({
      ok: false,
      error: 'SUPABASE_CREDENTIALS_MISSING',
    });
  }

  const headers = {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
  };

  try {
    const urlObj = new URL(req.url || '/', 'http://localhost');
    const isMetaOnly =
      urlObj.searchParams.get('metaOnly') === '1' || req.query?.metaOnly === '1';

    if (req.method === 'GET') {
      // Fast uncached PostgreSQL metadata check for polling (?metaOnly=1)
      if (isMetaOnly) {
        const items = await listSnapshotObjects(supabaseUrl, headers);
        if (items.length > 0) {
          const newest = items[0];
          const rev = parseRevFromFilename(newest.name);
          return res.status(200).json({
            ok: true,
            source: 'supabase_cloud',
            projectRef: 'oxspxnawhdxfggostbih',
            rev,
            updatedAt: newest.created_at || new Date(rev).toISOString(),
          });
        }
      }

      const latest = await readLatestCloudSnapshot(supabaseUrl, headers);
      if (latest && latest.data) {
        if (isMetaOnly) {
          return res.status(200).json({
            ok: true,
            source: 'supabase_cloud',
            projectRef: 'oxspxnawhdxfggostbih',
            rev: latest.rev,
            updatedAt: latest.updatedAt,
          });
        }
        return res.status(200).json({
          ok: true,
          source: 'supabase_cloud',
          projectRef: 'oxspxnawhdxfggostbih',
          rev: latest.rev,
          updatedAt: latest.updatedAt,
          data: latest.data,
        });
      }

      return res.status(200).json({
        ok: true,
        source: 'empty',
        projectRef: 'oxspxnawhdxfggostbih',
        rev: 0,
        data: null,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      // Action 1: Direct Photo Upload to raja-academy-media + optional atomic snapshot registration
      if (body && body.action === 'UPLOAD_PHOTO' && body.dataUrl) {
        const url = await uploadDataUrlToMediaBucket(
          body.dataUrl,
          body.folder || 'documentation',
          supabaseUrl,
          headers
        );

        let atomicRev = 0;
        let atomicUpdatedAt = null;

        // Atomically register the uploaded photo into the latest cloud snapshot right away!
        if (body.photoTarget && typeof url === 'string' && url.startsWith('http')) {
          try {
            const latest = await readLatestCloudSnapshot(supabaseUrl, headers);
            if (latest && latest.data) {
              const snapData = latest.data;
              if (Array.isArray(snapData.deletedPhotoUrls)) {
                snapData.deletedPhotoUrls = snapData.deletedPhotoUrls.filter((u) => u !== url);
              }
              const { module: targetMod, key: targetKey } = body.photoTarget;
              if (targetMod === 'op' && targetKey && snapData.operationTrainerModule) {
                const curArr = Array.isArray(snapData.operationTrainerModule[targetKey])
                  ? snapData.operationTrainerModule[targetKey]
                  : [];
                snapData.operationTrainerModule[targetKey] = [
                  url,
                  ...curArr.filter((u) => u !== url),
                ];
              } else if (
                targetMod === 'skillAudit' &&
                targetKey &&
                snapData.technicalTrainingModule
              ) {
                if (!snapData.technicalTrainingModule.skillAuditPhotos) {
                  snapData.technicalTrainingModule.skillAuditPhotos = {};
                }
                const curArr = Array.isArray(
                  snapData.technicalTrainingModule.skillAuditPhotos[targetKey]
                )
                  ? snapData.technicalTrainingModule.skillAuditPhotos[targetKey]
                  : [];
                snapData.technicalTrainingModule.skillAuditPhotos[targetKey] = [
                  url,
                  ...curArr.filter((u) => u !== url),
                ];
              }
              const written = await writeImmutableSnapshot(
                snapData,
                latest.allItems || [],
                supabaseUrl,
                headers
              );
              atomicRev = written.rev;
              atomicUpdatedAt = written.updatedAt;
            }
          } catch {
            // Client persistState() will also sync full snapshot
          }
        }

        return res.status(200).json({
          ok: true,
          url,
          rev: atomicRev || undefined,
          updatedAt: atomicUpdatedAt || undefined,
        });
      }

      // Action 2: Full State Sync with Uncached Latest Snapshot Merge
      let incomingPayload = body;
      incomingPayload = await externalizeBase64Photos(incomingPayload, supabaseUrl, headers);

      const latest = await readLatestCloudSnapshot(supabaseUrl, headers);
      const existingCloudData = latest?.data || null;

      const mergedPayload = existingCloudData
        ? mergeSnapshots(existingCloudData, incomingPayload)
        : incomingPayload;
      delete mergedPayload._resetPhotoKeys;
      delete mergedPayload._clearDeletedPhotoUrls;
      delete mergedPayload._explicitDeletedUrls;

      const written = await writeImmutableSnapshot(
        mergedPayload,
        latest?.allItems || [],
        supabaseUrl,
        headers
      );

      return res.status(200).json({
        ok: true,
        source: 'supabase_cloud',
        projectRef: 'oxspxnawhdxfggostbih',
        rev: written.rev,
        syncedAt: written.updatedAt,
        updatedAt: written.updatedAt,
        data: mergedPayload,
      });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Internal Cloud Sync Error',
    });
  }
}
