-- Chiusura negozio: closures and attachments (metadata only; no file storage)
-- Run after 008_comunicazioni.sql

CREATE TABLE IF NOT EXISTS public.chiusura (
  id BIGSERIAL PRIMARY KEY,
  store TEXT NOT NULL,
  societa TEXT NOT NULL,
  date TEXT NOT NULL,
  "user" TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chiusura_attachments (
  id BIGSERIAL PRIMARY KEY,
  chiusura_id BIGINT NOT NULL REFERENCES public.chiusura(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cat TEXT NOT NULL CHECK (cat IN ('cassa', 'pos', 'ddt_w3', 'ddt_vf', 'fatture')),
  size TEXT,
  emessa BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chiusura_date ON public.chiusura(date);
CREATE INDEX IF NOT EXISTS idx_chiusura_store ON public.chiusura(store);
CREATE INDEX IF NOT EXISTS idx_chiusura_attachments_chiusura_id ON public.chiusura_attachments(chiusura_id);

ALTER TABLE public.chiusura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiusura_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read write chiusura" ON public.chiusura;
CREATE POLICY "Allow anon read write chiusura" ON public.chiusura
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read write chiusura_attachments" ON public.chiusura_attachments;
CREATE POLICY "Allow anon read write chiusura_attachments" ON public.chiusura_attachments
  FOR ALL USING (true) WITH CHECK (true);
