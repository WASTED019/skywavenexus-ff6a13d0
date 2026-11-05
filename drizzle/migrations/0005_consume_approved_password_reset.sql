CREATE OR REPLACE FUNCTION public.consume_password_reset_approval()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  PERFORM 1
  FROM public.password_reset_requests
  WHERE user_id = v_user_id
    AND status = 'approved'
    AND expires_at > now()
  ORDER BY decided_at DESC NULLS LAST, requested_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET reset_approved = false
  WHERE id = v_user_id AND reset_approved = true
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.password_reset_requests
  SET status = 'completed'
  WHERE user_id = v_user_id AND status = 'approved';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_password_reset_approval() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_password_reset_approval() TO authenticated;