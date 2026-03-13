-- Documentation: brand docs by category (canvass, modulistica, operativa)
-- Run after 001_clients_contracts.sql

CREATE TABLE IF NOT EXISTS public.documentation (
  id BIGSERIAL PRIMARY KEY,
  brand_id TEXT NOT NULL,
  category_id TEXT NOT NULL CHECK (category_id IN ('canvass', 'modulistica', 'operativa')),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pdf',
  size TEXT,
  date TEXT,
  fillable BOOLEAN DEFAULT false,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documentation_brand_category ON public.documentation(brand_id, category_id);
CREATE INDEX IF NOT EXISTS idx_documentation_is_demo ON public.documentation(is_demo);

ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon documentation" ON public.documentation FOR ALL USING (true) WITH CHECK (true);
