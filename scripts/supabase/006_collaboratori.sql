-- Collaboratori: badge (shifts), ferie (vacation_requests), malattia (sickness_absences)
-- Run after previous migrations. Uses employee_name/store text (no employees table yet).

-- Shifts: one row per shift; active shift has ended_at = null
CREATE TABLE IF NOT EXISTS public.shifts (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  pause_started_at TIMESTAMPTZ,
  total_pause_minutes NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_employee ON public.shifts(employee_name);
CREATE INDEX IF NOT EXISTS idx_shifts_store ON public.shifts(store);
CREATE INDEX IF NOT EXISTS idx_shifts_started_at ON public.shifts(started_at);
CREATE INDEX IF NOT EXISTS idx_shifts_ended_at ON public.shifts(ended_at);

-- Vacation requests (ferie)
CREATE TABLE IF NOT EXISTS public.vacation_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacation_requests_employee ON public.vacation_requests(employee_name);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON public.vacation_requests(status);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_dates ON public.vacation_requests(date_from, date_to);

-- Sickness absences (malattia) - admin only
CREATE TABLE IF NOT EXISTS public.sickness_absences (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  certificate_number TEXT,
  certificate_path TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sickness_absences_employee ON public.sickness_absences(employee_name);
CREATE INDEX IF NOT EXISTS idx_sickness_absences_dates ON public.sickness_absences(date_from, date_to);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sickness_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon vacation_requests" ON public.vacation_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon sickness_absences" ON public.sickness_absences FOR ALL USING (true) WITH CHECK (true);
