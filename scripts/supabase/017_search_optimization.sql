-- Optimization for Search & Filtering
-- Run these in Supabase SQL Editor

-- 1. Enable extension for fast text search (ILike)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Trigram indexes for 'clients' table (faster ILike Searches)
CREATE INDEX IF NOT EXISTS idx_clients_nome_trgm ON public.clients USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_cognome_trgm ON public.clients USING gin (cognome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_ragione_sociale_trgm ON public.clients USING gin (ragione_sociale gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_cellulare_trgm ON public.clients USING gin (cellulare gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_cf_piva_trgm ON public.clients USING gin (cf_piva gin_trgm_ops);

-- 3. Trigram indexes for 'contracts' table
CREATE INDEX IF NOT EXISTS idx_contracts_id_trgm ON public.contracts USING gin (id gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contracts_brand_trgm ON public.contracts USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contracts_prodotto_trgm ON public.contracts USING gin (prodotto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contracts_codice_attivazione_trgm ON public.contracts USING gin (codice_attivazione gin_trgm_ops);

-- 4. B-Tree indexes for status and dates (already partially in 003, but ensuring they exist for paging)
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_stato ON public.contracts(stato);
CREATE INDEX IF NOT EXISTS idx_contracts_categoria ON public.contracts(categoria);
