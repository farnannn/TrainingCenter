-- ============================================================================
-- RAJA ACADEMY — COMPLETE SUPABASE ONLINE DATABASE SETUP
-- Project ID: oxspxnawhdxfggostbih (https://oxspxnawhdxfggostbih.supabase.co)
-- ============================================================================

-- 1. Cloud State Synchronization Table (Used for real-time full-state persistence)
CREATE TABLE IF NOT EXISTS public.thr_cloud_state (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.thr_cloud_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "thr_cloud_state_read_policy" ON public.thr_cloud_state;
CREATE POLICY "thr_cloud_state_read_policy"
  ON public.thr_cloud_state
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "thr_cloud_state_insert_policy" ON public.thr_cloud_state;
CREATE POLICY "thr_cloud_state_insert_policy"
  ON public.thr_cloud_state
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "thr_cloud_state_update_policy" ON public.thr_cloud_state;
CREATE POLICY "thr_cloud_state_update_policy"
  ON public.thr_cloud_state
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

GRANT SELECT ON public.thr_cloud_state TO anon, authenticated;
GRANT INSERT, UPDATE ON public.thr_cloud_state TO authenticated;
