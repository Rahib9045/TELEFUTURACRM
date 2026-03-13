-- Back Office (Gestione PDA): note and operatore_bo on contracts
-- Run after 003_contracts_ricerca.sql

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS operatore_bo TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_operatore_bo ON public.contracts(operatore_bo);
