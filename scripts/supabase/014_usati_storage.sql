-- Usati: attachment columns and storage bucket
-- Run after 013_passwords.sql

-- 1. Add attachment columns to public.usati
ALTER TABLE public.usati
  ADD COLUMN IF NOT EXISTS allegato_documento TEXT,
  ADD COLUMN IF NOT EXISTS allegato_dichiarazione TEXT;

-- 2. Create the storage bucket "usati_attachments"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'usati_attachments',
  'usati_attachments',
  true,
  26214400, -- 25MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- Allow anyone to read (Public bucket)
CREATE POLICY "Allow public select on usati_attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'usati_attachments');

-- Allow authenticated users to upload/update/delete
CREATE POLICY "Allow authenticated insert on usati_attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'usati_attachments');

CREATE POLICY "Allow authenticated update on usati_attachments" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'usati_attachments');

CREATE POLICY "Allow authenticated delete on usati_attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'usati_attachments');
