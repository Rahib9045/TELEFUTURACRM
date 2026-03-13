-- Add columns for Ricerca Contratto (contract search) view
-- Run after 001_clients_contracts.sql

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS venditore TEXT,
  ADD COLUMN IF NOT EXISTS prodotto TEXT,
  ADD COLUMN IF NOT EXISTS negozio TEXT,
  ADD COLUMN IF NOT EXISTS codice_attivazione TEXT,
  ADD COLUMN IF NOT EXISTS data_registrazione TEXT,
  ADD COLUMN IF NOT EXISTS data_attivazione TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_venditore ON public.contracts(venditore);
CREATE INDEX IF NOT EXISTS idx_contracts_negozio ON public.contracts(negozio);
CREATE INDEX IF NOT EXISTS idx_contracts_data_registrazione ON public.contracts(data_registrazione);
CREATE INDEX IF NOT EXISTS idx_contracts_data_attivazione ON public.contracts(data_attivazione);
