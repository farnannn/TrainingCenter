import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import cloudStateHandler from './api/cloud-state.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(env)) {
    if (!process.env[k]) {
      process.env[k] = v;
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'supabase-cloud-state-middleware',
        configureServer(server) {
          server.middlewares.use('/api/cloud-state', async (req, res) => {
            try {
              const urlObj = new URL(req.url || '/', 'http://localhost');
              (req as any).query = Object.fromEntries(urlObj.searchParams.entries());

              if (req.method === 'POST') {
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                }
                const rawBody = Buffer.concat(chunks).toString('utf-8');
                (req as any).body = rawBody ? JSON.parse(rawBody) : {};
              }

              const vercelRes = {
                setHeader: (k: string, v: string) => res.setHeader(k, v),
                status: (code: number) => {
                  res.statusCode = code;
                  return {
                    json: (obj: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(obj));
                    },
                  };
                },
              };

              await cloudStateHandler(req as any, vercelRes as any);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: false,
                  error: err?.message || 'Cloud sync middleware error',
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
