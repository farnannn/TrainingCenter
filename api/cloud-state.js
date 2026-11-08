// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/cloud-state
// Connects securely to Supabase (oxspxnawhdxfggostbih) using server-side credentials
// ==============================================================================

const BUCKET_NAME = 'raja-academy-db';
const OBJECT_KEY = 'thr_state.json';

export default async function handler(req, res) {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://oxspxnawhdxfggostbih.supabase.co';
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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
      // 1. Try reading from Postgres table public.thr_cloud_state first (if created via SQL Editor)
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
        // Fallback to Supabase Storage
      }

      // 2. Read from Supabase Cloud Storage bucket raja-academy-db
      const stRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${OBJECT_KEY}`,
        { headers }
      );
      if (stRes.ok) {
        const snapshot = await stRes.json();
        return res.status(200).json({
          ok: true,
          source: 'supabase_cloud',
          projectRef: 'oxspxnawhdxfggostbih',
          updatedAt: snapshot?.updatedAt || new Date().toISOString(),
          data: snapshot?.data || snapshot,
        });
      }

      return res.status(200).json({
        ok: true,
        source: 'empty',
        projectRef: 'oxspxnawhdxfggostbih',
        data: null,
      });
    }

    if (req.method === 'POST') {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const nowIso = new Date().toISOString();

      // Ensure bucket exists
      await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: BUCKET_NAME,
          name: BUCKET_NAME,
          public: false,
        }),
      }).catch(() => {});

      // Save snapshot to Supabase Storage
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
            data: payload,
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
          payload,
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

