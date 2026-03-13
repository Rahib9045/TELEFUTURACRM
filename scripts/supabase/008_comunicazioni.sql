-- Comunicazioni (announcements / avvisi)
-- Run after 007_gestione.sql

CREATE TABLE IF NOT EXISTS public.comunicazioni (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date_display TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comunicazioni_created_at ON public.comunicazioni(created_at DESC);

ALTER TABLE public.comunicazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read write comunicazioni" ON public.comunicazioni
  FOR ALL USING (true) WITH CHECK (true);

-- Seed initial rows
INSERT INTO public.comunicazioni (title, date_display, type, content) VALUES
  ('Aggiornamento Listini Energia Q4', '12 Nov 2023, 10:30', 'info', 'Si comunica a tutti gli agenti che i nuovi listini per il segmento Business sono stati pubblicati nella sezione Documentazione. Le nuove condizioni sono applicabili a partire dal 15 Novembre.'),
  ('Manutenzione Programmata Portale', '05 Nov 2023, 14:00', 'warning', 'Il portale subira una manutenzione programmata sabato dalle 22:00 alle 02:00 di domenica. Durante questa finestra non sara possibile inserire nuove PDA.'),
  ('Nuova Campagna Promozionale Summer', '28 Ott 2023, 09:15', 'success', 'E partita la nuova campagna promozionale estiva con extra bonus per i nuovi contratti consumer. Trovate tutti i dettagli e il materiale aggiornato nella vostra dashboard personale.')
;
