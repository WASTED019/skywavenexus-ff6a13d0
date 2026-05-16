
-- Ensure RLS is on
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Let signed-in users read only their own reset requests (super admins already have a separate policy)
DROP POLICY IF EXISTS "Users read own reset requests" ON public.password_reset_requests;
CREATE POLICY "Users read own reset requests"
ON public.password_reset_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Explicitly deny all direct writes from any client role.
-- All inserts/updates/deletes must go through SECURITY DEFINER RPCs
-- (request_password_reset, approve_password_reset, reject_password_reset).
DROP POLICY IF EXISTS "Block direct inserts" ON public.password_reset_requests;
CREATE POLICY "Block direct inserts"
ON public.password_reset_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct updates" ON public.password_reset_requests;
CREATE POLICY "Block direct updates"
ON public.password_reset_requests
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct deletes" ON public.password_reset_requests;
CREATE POLICY "Block direct deletes"
ON public.password_reset_requests
FOR DELETE
TO anon, authenticated
USING (false);
