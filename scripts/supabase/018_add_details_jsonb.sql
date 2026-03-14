-- Add JSONB column for full contract/PDA details
-- Run in Supabase SQL Editor

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS dettagli JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.contracts.dettagli IS 'Stores full form details, including dynamic fields from PDA and registration wizards.';
