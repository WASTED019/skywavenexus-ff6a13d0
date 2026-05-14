CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);

CREATE OR REPLACE FUNCTION public.set_user_role(_target uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
  target_is_admin boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;

  IF _target IS NULL THEN
    RAISE EXCEPTION 'Target user is required';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _target AND role = 'admin')
    INTO target_is_admin;

  IF _role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target, 'admin')
    ON CONFLICT DO NOTHING;
    -- Remove customer role when promoting (optional cleanliness)
    DELETE FROM public.user_roles WHERE user_id = _target AND role = 'customer';
  ELSIF _role = 'customer' THEN
    IF target_is_admin THEN
      SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
      IF admin_count <= 1 THEN
        RAISE EXCEPTION 'Cannot demote the last remaining admin';
      END IF;
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _target AND role = 'admin';
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target, 'customer')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Unsupported role';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;