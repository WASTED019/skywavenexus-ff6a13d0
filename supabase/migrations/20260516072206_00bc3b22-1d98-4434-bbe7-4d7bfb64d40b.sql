-- Tighten storage policies for request-uploads bucket

DROP POLICY IF EXISTS "Anyone can upload request files" ON storage.objects;

CREATE POLICY "Upload request files for valid request"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'request-uploads'
  AND EXISTS (
    SELECT 1 FROM public.service_requests r
    WHERE r.id::text = (storage.foldername(name))[1]
      AND (r.user_id IS NULL OR r.user_id = auth.uid())
  )
);

CREATE POLICY "Customers read own request files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'request-uploads'
  AND EXISTS (
    SELECT 1
    FROM public.request_files rf
    JOIN public.service_requests r ON r.id = rf.request_id
    WHERE rf.storage_path = storage.objects.name
      AND r.user_id = auth.uid()
  )
);