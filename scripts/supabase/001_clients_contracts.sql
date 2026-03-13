-- Clients table (anagrafica clienti)
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('consumer', 'business')),
  nome TEXT NOT NULL,
  cognome TEXT,
  ragione_sociale TEXT,
  cellulare TEXT NOT NULL,
  email TEXT NOT NULL,
  cf_piva TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  citta TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contracts table (ultimi contratti per cliente)
CREATE TABLE IF NOT EXISTS public.contracts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  brand TEXT NOT NULL,
  categoria TEXT NOT NULL,
  stato TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for filters and lookups
CREATE INDEX IF NOT EXISTS idx_clients_tipo ON public.clients(tipo);
CREATE INDEX IF NOT EXISTS idx_clients_cf_piva ON public.clients(cf_piva);
CREATE INDEX IF NOT EXISTS idx_clients_is_demo ON public.clients(is_demo);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_is_demo ON public.contracts(is_demo);

-- Allow anon to read/write for now (tighten with RLS later when auth is wired)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read write clients" ON public.clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read write contracts" ON public.contracts
  FOR ALL USING (true) WITH CHECK (true);
