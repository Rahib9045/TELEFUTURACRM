-- 025: Add missing columns to clients table
-- cap (postal code), nome_ref (business reference first name), cognome_ref (business reference surname)
-- Also add unique constraint on cf_piva to enable proper upsert deduplication

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS cap TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS nome_ref TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cognome_ref TEXT DEFAULT '';

-- Unique constraint on cf_piva so we can reliably find/update existing clients

-- Step 1: Fix empty cf_piva values (set to their id so they're unique)
UPDATE public.clients SET cf_piva = id WHERE cf_piva IS NULL OR cf_piva = '';

-- Step 2: Remove duplicates — keep the most recent row per cf_piva
DELETE FROM public.clients
WHERE id NOT IN (
  SELECT DISTINCT ON (cf_piva) id
  FROM public.clients
  ORDER BY cf_piva, created_at DESC
);

-- Step 3: Now add the unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_clients_cf_piva'
  ) THEN
    ALTER TABLE public.clients ADD CONSTRAINT uq_clients_cf_piva UNIQUE(cf_piva);
  END IF;
END $$;
