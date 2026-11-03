-- AethelTime workspace persistence for the authenticated single-user dashboard.
-- Apply this migration to the Neon development branch before enabling the Preview.
CREATE TABLE IF NOT EXISTS public.aethel_workspace (
  owner_id text PRIMARY KEY,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT USAGE ON SCHEMA public TO aethel_app_dev;
GRANT SELECT, INSERT, UPDATE ON public.aethel_workspace TO aethel_app_dev;

ALTER TABLE public.aethel_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aethel_workspace FORCE ROW LEVEL SECURITY;
CREATE POLICY aethel_workspace_owner_scope ON public.aethel_workspace
  FOR ALL TO aethel_app_dev
  USING (owner_id = current_setting('aethel.owner_id', true))
  WITH CHECK (owner_id = current_setting('aethel.owner_id', true));
