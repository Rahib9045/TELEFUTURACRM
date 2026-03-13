-- Calendar: appointments, tasks, agenda blocks, meetings
-- Run in Supabase SQL Editor after 001_clients_contracts.sql

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing', 'self_generated')),
  agente TEXT NOT NULL DEFAULT '',
  store TEXT,
  customer_address TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  cf_piva TEXT,
  notes TEXT NOT NULL DEFAULT '',
  esito_note TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'attivato', 'ko', 'in_gestione', 'da_richiamare', 'da_rifissare', 'annullato')),
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agenda blocks (blocked dates)
CREATE TABLE IF NOT EXISTS public.agenda_blocks (
  id BIGSERIAL PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  note TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar tasks
CREATE TABLE IF NOT EXISTS public.calendar_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  status TEXT NOT NULL CHECK (status IN ('da_fare', 'fatta', 'sospesa', 'abbandonata')),
  notes TEXT,
  outcome_note TEXT,
  client_ref TEXT,
  created_by TEXT NOT NULL,
  assigned_to TEXT NOT NULL DEFAULT '',
  assigned_to_store TEXT,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar meetings (recipients stored as JSONB)
CREATE TABLE IF NOT EXISTS public.calendar_meetings (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in_person', 'video_call')),
  brand TEXT NOT NULL,
  location TEXT,
  link TEXT,
  notes TEXT,
  recipients JSONB NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_is_demo ON public.appointments(is_demo);
CREATE INDEX IF NOT EXISTS idx_agenda_blocks_dates ON public.agenda_blocks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_date ON public.calendar_tasks(date);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_is_demo ON public.calendar_tasks(is_demo);
CREATE INDEX IF NOT EXISTS idx_calendar_meetings_date ON public.calendar_meetings(date);
CREATE INDEX IF NOT EXISTS idx_calendar_meetings_is_demo ON public.calendar_meetings(is_demo);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon agenda_blocks" ON public.agenda_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon calendar_tasks" ON public.calendar_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon calendar_meetings" ON public.calendar_meetings FOR ALL USING (true) WITH CHECK (true);
