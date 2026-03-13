-- Chiusura: file_path for attachments and storage bucket for uploads
-- Run after 009_chiusura.sql
--
-- After running this, in Supabase Dashboard → Storage: create bucket "chiusura" if not
-- created by the insert below, set Public ON, and add policies for INSERT + SELECT.

ALTER TABLE public.chiusura_attachments
  ADD COLUMN IF NOT EXISTS file_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chiusura',
  'chiusura',
  true,
  26214400,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;
