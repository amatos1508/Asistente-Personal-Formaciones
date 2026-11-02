-- AethelTime workspace persistence for the authenticated single-user dashboard.
-- Apply this migration to the Neon development branch before enabling the Preview.
CREATE TABLE IF NOT EXISTS public.aethel_workspace (
  owner_id text PRIMARY KEY,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT USAGE ON SCHEMA public TO aethel_app_dev;
GRANT SELECT, INSERT, UPDATE ON public.aethel_workspace TO aethel_app_dev;
