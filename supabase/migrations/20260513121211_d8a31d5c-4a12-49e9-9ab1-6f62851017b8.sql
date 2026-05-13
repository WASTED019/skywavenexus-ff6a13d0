
-- 1) Profile self-edit guard: customers cannot escalate sensitive flags.
CREATE OR REPLACE FUNCTION public.guard_profile_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins can change anything
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admins: preserve sensitive columns from OLD row regardless of submission.
  NEW.reset_approved := OLD.reset_approved;
  NEW.is_active      := OLD.is_active;
  -- delete_requested may be set true by the owner (account-removal request) but
  -- never reverted by them.
  IF OLD.delete_requested = true AND NEW.delete_requested = false THEN
    NEW.delete_requested := true;
  END IF;
  -- Email is mirrored from auth.users; never let users overwrite it here.
  NEW.email := OLD.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_self_update ON public.profiles;
CREATE TRIGGER profiles_guard_self_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_self_update();

-- 2) Replace permissive INSERT policy on request_files with one that requires
--    the parent request to exist and to either be a guest request (user_id NULL)
--    or owned by the caller.
DROP POLICY IF EXISTS "Anyone can attach files" ON public.request_files;

CREATE POLICY "Attach files to own or guest requests"
ON public.request_files
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_requests r
    WHERE r.id = request_files.request_id
      AND (r.user_id IS NULL OR r.user_id = auth.uid())
  )
);

-- 3) Storage: explicit admin-only UPDATE/DELETE on request-uploads bucket.
DROP POLICY IF EXISTS "Admins update request-uploads" ON storage.objects;
CREATE POLICY "Admins update request-uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'request-uploads' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'request-uploads' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete request-uploads" ON storage.objects;
CREATE POLICY "Admins delete request-uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'request-uploads' AND public.has_role(auth.uid(), 'admin'));

-- 4) Lock down trigger-only SECURITY DEFINER functions so they can't be
--    invoked directly via PostgREST/RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_profile_self_update() FROM PUBLIC, anon, authenticated;
