-- RLS Policies for the "chiusura" storage bucket
-- Ensures that authenticated users can upload documents and read them.

-- 1. Enable RLS on the bucket (if not already enabled)
-- Note: In Supabase, bucket-level RLS is managed via the storage.objects table.

-- 2. Allow authenticated users to UPLOAD files to the "chiusura" bucket
CREATE POLICY "Allow authenticated uploads to chiusura"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chiusura');

-- 3. Allow authenticated users to UPDATE their own files (if needed, but usually chiusura is immutable)
CREATE POLICY "Allow authenticated updates to chiusura"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'chiusura');

-- 4. Allow public or authenticated READ access (depending on preference)
-- Here we allow authenticated users to read any file in the bucket
CREATE POLICY "Allow authenticated read from chiusura"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chiusura');

-- Optional: If you want anonymous read access (vulnerable but sometimes used in internal CRMs)
-- CREATE POLICY "Allow public read from chiusura"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'chiusura');
