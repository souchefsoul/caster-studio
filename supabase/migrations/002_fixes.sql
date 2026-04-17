-- Fix: allow 'video' generation mode
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_mode_check;
ALTER TABLE public.generations ADD CONSTRAINT generations_mode_check
  CHECK (mode IN ('on-model', 'catalog', 'colorway', 'design-copy', 'text-to-image', 'video'));

-- Fix: users can delete their own generations
DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Drop collections tables (feature removed from UI)
DROP TABLE IF EXISTS public.collection_items;
DROP TABLE IF EXISTS public.collections;

-- Storage bucket for user-uploaded reference images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: authenticated users can upload to their own folder (uploads/{user_id}/...)
DROP POLICY IF EXISTS "Users upload to own folder" ON storage.objects;
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can read uploads" ON storage.objects;
CREATE POLICY "Anyone can read uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Users delete own uploads" ON storage.objects;
CREATE POLICY "Users delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
