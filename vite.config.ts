import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const BUCKET_NAME = 'raja-academy-db';
const OBJECT_KEY = 'thr_state.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl =
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    'https://oxspxnawhdxfggostbih.supabase.co';
  const secretKey = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  return {
    plugins: [
      react(),
      {
        name: 'supabase-cloud-state-middleware',
        configureServer(server) {
          server.middlewares.use('/api/cloud-state', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');

            if (!supabaseUrl || !secretKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({ ok: false, error: 'SUPABASE_CREDENTIALS_MISSING' }));
              return;
            }

            const headers: Record<string, string> = {
              apikey: secretKey,
              Authorization: `Bearer ${secretKey}`,
            };

            try {
              if (req.method === 'GET') {
                // 1. Try reading from Postgres table public.thr_cloud_state first
                try {
                  const pgRes = await fetch(
                    `${supabaseUrl}/rest/v1/thr_cloud_state?id=eq.main&select=payload,updated_at`,
                    { headers }
                  );
                  if (pgRes.ok) {
                    const rows = (await pgRes.json()) as any[];
                    if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
                      res.statusCode = 200;
                      res.end(
                        JSON.stringify({
                          ok: true,
                          source: 'supabase_postgres',
                          projectRef: 'oxspxnawhdxfggostbih',
                          updatedAt: rows[0].updated_at,
                          data: rows[0].payload,
                        })
                      );
                      return;
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
                  const snapshot = (await stRes.json()) as any;
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      ok: true,
                      source: 'supabase_cloud',
                      projectRef: 'oxspxnawhdxfggostbih',
                      updatedAt: snapshot?.updatedAt || new Date().toISOString(),
                      data: snapshot?.data || snapshot,
                    })
                  );
                  return;
                }

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    ok: true,
                    source: 'empty',
                    projectRef: 'oxspxnawhdxfggostbih',
                    data: null,
                  })
                );
                return;
              }

              if (req.method === 'POST') {
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                }
                const rawBody = Buffer.concat(chunks).toString('utf-8');
                const payload = rawBody ? JSON.parse(rawBody) : {};
                const nowIso = new Date().toISOString();

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

                // Also upsert into Postgres table public.thr_cloud_state if created
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
                  res.statusCode = 500;
                  res.end(JSON.stringify({ ok: false, error: errText }));
                  return;
                }

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    ok: true,
                    source: 'supabase_cloud',
                    projectRef: 'oxspxnawhdxfggostbih',
                    syncedAt: nowIso,
                  })
                );
                return;
              }

              res.statusCode = 405;
              res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  ok: false,
                  error: err?.message || 'Cloud sync failed',
                })
              );
            }
          });
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});
