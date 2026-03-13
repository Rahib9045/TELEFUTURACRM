-- Add file_path to documentation (path in Storage bucket for PDF file)
-- Run after 004_documentation.sql
--
-- Also create a Storage bucket in Supabase Dashboard:
--   Storage → New bucket → Name: documentation → Public: ON
-- Then in Storage → documentation → Policies, add:
--   - Policy for SELECT (allow read) for bucket_id = 'documentation'
--   - Policy for INSERT (allow upload) for bucket_id = 'documentation'
--   - Policy for DELETE (allow delete) for bucket_id = 'documentation'

ALTER TABLE public.documentation
  ADD COLUMN IF NOT EXISTS file_path TEXT;

COMMENT ON COLUMN public.documentation.file_path IS 'Path in storage bucket documentation/ e.g. brand_id/category_id/filename.pdf';
