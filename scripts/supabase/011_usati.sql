-- Usati: used devices (smartphones, tablets, etc.) lifecycle
-- Run after 010_chiusura_storage.sql

CREATE TABLE IF NOT EXISTS public.usati (
  id BIGSERIAL PRIMARY KEY,
  model TEXT NOT NULL,
  imei TEXT NOT NULL,
  status TEXT NOT NULL,
  sale_price NUMERIC(12,2) DEFAULT 0,
  purchase_price NUMERIC(12,2) NOT NULL,
  store TEXT NOT NULL,
  target_store TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  purchase_date TIMESTAMPTZ,
  listed_date TIMESTAMPTZ,
  sold_date TIMESTAMPTZ,
  ricambi JSONB DEFAULT '[]',
  note_tecnico TEXT DEFAULT '',
  status_history JSONB DEFAULT '{}',
  provenienza_subito BOOLEAN DEFAULT false,
  extra_margine JSONB,
  pagamento JSONB NOT NULL DEFAULT '{}',
  grado_usura TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_usati_status ON public.usati(status);
CREATE INDEX IF NOT EXISTS idx_usati_store ON public.usati(store);
CREATE INDEX IF NOT EXISTS idx_usati_created_at ON public.usati(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usati_imei ON public.usati(imei);

ALTER TABLE public.usati ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read write usati" ON public.usati;
CREATE POLICY "Allow anon read write usati" ON public.usati
  FOR ALL USING (true) WITH CHECK (true);
