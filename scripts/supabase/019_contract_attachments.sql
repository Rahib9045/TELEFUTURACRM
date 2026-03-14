-- Document Management Migration
-- Run in Supabase SQL Editor

-- 1. Add 'note' column to contracts if it doesn't exist
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS note TEXT;

-- 2. Create Attachment Type Enum (optional but cleaner)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachment_type') THEN
        CREATE TYPE attachment_type AS ENUM ('identity', 'contract', 'other');
    END IF;
END $$;

-- 3. Create contract_attachments table
CREATE TABLE IF NOT EXISTS public.contract_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT DEFAULT 'other', -- Using text for simplicity or enum if created
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.contract_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Allow anon for now to match other tables, tighten later)
CREATE POLICY "Allow anon all on attachments" ON public.contract_attachments
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Storage Bucket setup (Note: Bucket creation is usually done in Dashboard or Script)
-- To be run by the user in Supabase Dashboard -> Storage:
-- Create a new bucket named 'contracts' and set it to PUBLIC or add appropriate policies.
