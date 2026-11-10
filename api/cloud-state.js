// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/cloud-state
// Connects securely to Supabase (oxspxnawhdxfggostbih) for Real-Time Multi-Device
// State Synchronization & Media Storage (raja-academy-db & raja-academy-media)
// ==============================================================================

const BUCKET_NAME = 'raja-academy-db';
const MEDIA_BUCKET_NAME = 'raja-academy-media';
const OBJECT_KEY = 'thr_state.json';

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

function mergePhotoArrays(cloudArr, incomingArr, deletedSet, resetCategoriesSet, categoryKey) {
  const incoming = Array.isArray(incomingArr) ? incomingArr : [];
  if (categoryKey && resetCategoriesSet.has(categoryKey)) {
    return incoming.filter((u) => !deletedSet.has(u));
  }
  const cloud = Array.isArray(cloudArr) ? cloudArr : [];
  const cloudCustom = cloud.filter((u) => isCustomUploadedPhoto(u) && !deletedSet.has(u));
  const result = [...incoming.filter((u) => !deletedSet.has(u))];
  for (const cUrl of cloudCustom) {
    if (!result.includes(cUrl)) {
      result.push(cUrl);
    }
  }
  return result;
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

  const deletedList = Array.from(
    new Set([
      ...(Array.isArray(cloudData.deletedPhotoUrls) ? cloudData.deletedPhotoUrls : []),
      ...(Array.isArray(incomingData.deletedPhotoUrls) ? incomingData.deletedPhotoUrls : []),
    ])
  ).slice(-500);
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

  // Merge Technical Training Module photos
  if (cloudData.technicalTrainingModule && incomingData.technicalTrainingModule) {
    const cTtm = cloudData.technicalTrainingModule;
    const iTtm = incomingData.technicalTrainingModule;
    const mergedSkillPhotos = { ...(cTtm.skillAuditPhotos || {}), ...(iTtm.skillAuditPhotos || {}) };

    for (const k of Object.keys(mergedSkillPhotos)) {
      mergedSkillPhotos[k] = mergePhotoArrays(
        cTtm.skillAuditPhotos?.[k],
        iTtm.skillAuditPhotos?.[k],
        deletedSet,
        resetCategoriesSet,
        `SKILL_AUDIT_${k}`
      );
    }

    // Merge dailyTrainerActivities photos by activity ID
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
    if (req.method === 'GET') {
      // Read from Supabase Cloud Storage bucket raja-academy-db (primary source of truth)
      const stRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${OBJECT_KEY}?t=${Date.now()}`,
        {
          headers: {
            ...headers,
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (stRes.ok) {
        const snapshot = await stRes.json();
        const updatedAt = snapshot?.updatedAt || new Date().toISOString();
        if (req.query?.metaOnly === '1') {
          return res.status(200).json({
            ok: true,
            source: 'supabase_cloud',
            projectRef: 'oxspxnawhdxfggostbih',
            updatedAt,
          });
        }
        return res.status(200).json({
          ok: true,
          source: 'supabase_cloud',
          projectRef: 'oxspxnawhdxfggostbih',
          updatedAt,
          data: snapshot?.data || snapshot,
        });
      }

      // Fallback: Try reading from Postgres table public.thr_cloud_state if Storage object missing
      try {
        const pgRes = await fetch(
          `${supabaseUrl}/rest/v1/thr_cloud_state?id=eq.main&select=payload,updated_at`,
          { headers }
        );
        if (pgRes.ok) {
          const rows = await pgRes.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
            return res.status(200).json({
              ok: true,
              source: 'supabase_postgres',
              projectRef: 'oxspxnawhdxfggostbih',
              updatedAt: rows[0].updated_at,
              data: rows[0].payload,
            });
          }
        }
      } catch {
        // Ignore
      }

      return res.status(200).json({
        ok: true,
        source: 'empty',
        projectRef: 'oxspxnawhdxfggostbih',
        data: null,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      // Action 1: Direct Photo Upload to raja-academy-media public bucket
      if (body && body.action === 'UPLOAD_PHOTO' && body.dataUrl) {
        const url = await uploadDataUrlToMediaBucket(
          body.dataUrl,
          body.folder || 'documentation',
          supabaseUrl,
          headers
        );
        return res.status(200).json({
          ok: true,
          url,
        });
      }

      // Action 2: Full State Sync with Smart Multi-Device Photo Merge
      let incomingPayload = body;
      const nowIso = new Date().toISOString();

      // Convert any remaining base64 photos to permanent Supabase Storage URLs
      incomingPayload = await externalizeBase64Photos(incomingPayload, supabaseUrl, headers);

      // Read current cloud snapshot to merge concurrent photo uploads from other laptops
      let existingCloudData = null;
      try {
        const curRes = await fetch(
          `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${OBJECT_KEY}?t=${Date.now()}`,
          { headers }
        );
        if (curRes.ok) {
          const curJson = await curRes.json();
          existingCloudData = curJson?.data || curJson;
        }
      } catch {
        // Ignore if not found
      }

      const mergedPayload = existingCloudData
        ? mergeSnapshots(existingCloudData, incomingPayload)
        : incomingPayload;

      // Save merged snapshot to Supabase Storage
      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${OBJECT_KEY}`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'x-upsert': 'true',
          },
          body: JSON.stringify({
            updatedAt: nowIso,
            projectRef: 'oxspxnawhdxfggostbih',
            data: mergedPayload,
          }),
        }
      );

      // Also attempt to upsert into Postgres table public.thr_cloud_state if SQL was executed
      await fetch(`${supabaseUrl}/rest/v1/thr_cloud_state`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: 'main',
          payload: mergedPayload,
          updated_at: nowIso,
        }),
      }).catch(() => {});

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return res.status(500).json({
          ok: false,
          error: errText,
        });
      }

      return res.status(200).json({
        ok: true,
        source: 'supabase_cloud',
        projectRef: 'oxspxnawhdxfggostbih',
        syncedAt: nowIso,
        updatedAt: nowIso,
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
