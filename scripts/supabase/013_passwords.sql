-- Password CRM: credentials + access log
-- Run after 011_usati.sql and 012_usati_seed.sql

CREATE TABLE IF NOT EXISTS public.password_credentials (
  id BIGSERIAL PRIMARY KEY,
  brand_id VARCHAR(50) NOT NULL,          -- 'windtre', 'vodafone', 'sky', 'fastweb', 'energia'
  category_id VARCHAR(50) NOT NULL,       -- 'ngpos', 'ask', 'findomestic', etc.
  store_id VARCHAR(50) NOT NULL,          -- 'roma-termini', 'milano-centrale', 'tutti'
  access_type VARCHAR(255) NOT NULL,      -- Display name like 'NGPOS Portal'
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,       -- AES-encrypted blob (handled in app)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_password_filter
  ON public.password_credentials(brand_id, category_id, store_id);

CREATE TABLE IF NOT EXISTS public.password_access_log (
  id BIGSERIAL PRIMARY KEY,
  credential_id BIGINT REFERENCES public.password_credentials(id) ON DELETE CASCADE,
  user_id UUID,
  action VARCHAR(50) NOT NULL,            -- 'view', 'reveal', 'copy'
  accessed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.password_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon password_credentials" ON public.password_credentials;
CREATE POLICY "Allow anon password_credentials" ON public.password_credentials
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon password_access_log" ON public.password_access_log;
CREATE POLICY "Allow anon password_access_log" ON public.password_access_log
  FOR ALL USING (true) WITH CHECK (true);

