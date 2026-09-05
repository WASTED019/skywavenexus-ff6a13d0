-- 1) Close privilege-escalation path: admins could INSERT/UPDATE/DELETE user_roles
--    directly via the Data API and grant themselves super_admin, bypassing set_user_role().
DROP POLICY IF EXISTS "Admins manage roles insert" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles update" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles delete" ON public.user_roles;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;

-- 2) Stop account/email enumeration from the browser. These run server-side only now.
REVOKE EXECUTE ON FUNCTION public.resolve_login_email(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.customer_can_reset(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.request_password_reset(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_blog_post(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_showcase_item(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.clear_reset_flag() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- 3) Throttle reset requests (was unbounded insert for unauthenticated callers).
CREATE OR REPLACE FUNCTION public.request_password_reset(_identifier text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email text;
  v_user_id uuid;
  v_id uuid;
  v_recent int;
BEGIN
  IF _identifier IS NULL OR length(trim(_identifier)) < 3 THEN
    RAISE EXCEPTION 'identifier required';
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.password_reset_requests
  WHERE identifier = lower(trim(_identifier))
    AND created_at > now() - interval '15 minutes';
  IF v_recent >= 3 THEN
    RETURN NULL; -- silently throttled
  END IF;

  v_email := public.resolve_login_email(_identifier);
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;
  END IF;

  INSERT INTO public.password_reset_requests (identifier, email, user_id)
  VALUES (lower(trim(_identifier)), v_email, v_user_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END $function$;
REVOKE EXECUTE ON FUNCTION public.request_password_reset(text) FROM anon, authenticated, public;

-- 4) Request tracking: an empty/blank contact could match rows with blank contact fields.
CREATE OR REPLACE FUNCTION public.track_request(_ref text, _contact text)
RETURNS TABLE(ref text, status text, division_name text, service_name text, created_at timestamp with time zone, admin_feedback text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT s.ref, s.status, s.division_name, s.service_name, s.created_at, s.admin_feedback
  FROM public.service_requests s
  WHERE length(trim(coalesce(_ref,''))) >= 6
    AND length(trim(coalesce(_contact,''))) >= 5
    AND s.ref = trim(_ref)
    AND (
      (coalesce(s.email,'') <> '' AND lower(s.email) = lower(trim(_contact)))
      OR (coalesce(s.phone,'') <> '' AND s.phone = trim(_contact))
      OR (coalesce(s.whatsapp,'') <> '' AND s.whatsapp = trim(_contact))
    )
  LIMIT 1;
$function$;