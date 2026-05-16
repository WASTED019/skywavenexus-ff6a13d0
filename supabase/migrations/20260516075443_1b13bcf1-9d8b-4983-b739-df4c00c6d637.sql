DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;
-- Public bucket files remain accessible via their public URL without an RLS SELECT policy.
-- Removing this policy prevents anonymous clients from LISTING all files in the bucket.