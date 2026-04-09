-- 026: Caller module — calls and liste tables

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  tipo_cliente text not null check (tipo_cliente in ('consumer','business')),
  nome text default '',
  cognome text default '',
  ragione_sociale text default '',
  cf text default '',
  piva text default '',
  numero text default '',
  cellulare text default '',
  brand text default '',
  provenienza text default '',
  tipologia text default '',
  obiettivo text default '',
  stato text not null default '',
  data_chiamata timestamptz not null default now(),
  caller text not null,
  negozio_appuntamento text default '',
  data_appuntamento timestamptz,
  indirizzo text default '',
  agente text default '',
  segnalatore text default '',
  campagna text default '',
  negozio_provenienza text default '',
  mese_provenienza text default '',
  anno_provenienza text default '',
  whatsapp text default '',
  note text default '',
  data_richiamo timestamptz,
  lista_origine text,
  storico jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_calls_caller on public.calls(caller);
create index idx_calls_stato on public.calls(stato);
create index idx_calls_data_chiamata on public.calls(data_chiamata desc);
create index idx_calls_lista_origine on public.calls(lista_origine);
create index idx_calls_cf_piva on public.calls(cf, piva);

create table public.liste (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data timestamptz not null default now(),
  tipo text not null check (tipo in ('consumer','business')),
  provenienza text not null,
  segnalatore text default '',
  campagna text default '',
  brand_acq text default '',
  obiettivo_mkt text default '',
  interno_rows jsonb default '[]'::jsonb,
  file_name text default '',
  file_path text default '',
  num_cols int default 0,
  mappa jsonb default '{}'::jsonb,
  totale int not null default 0,
  splits jsonb not null default '[]'::jsonb,
  lavorate int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_liste_data on public.liste(data desc);
create index idx_liste_provenienza on public.liste(provenienza);

-- RLS policies (anon access, matching project pattern)
alter table public.calls enable row level security;
alter table public.liste enable row level security;

create policy "anon_select_calls" on public.calls for select using (true);
create policy "anon_insert_calls" on public.calls for insert with check (true);
create policy "anon_update_calls" on public.calls for update using (true);
create policy "anon_delete_calls" on public.calls for delete using (true);

create policy "anon_select_liste" on public.liste for select using (true);
create policy "anon_insert_liste" on public.liste for insert with check (true);
create policy "anon_update_liste" on public.liste for update using (true);
create policy "anon_delete_liste" on public.liste for delete using (true);
