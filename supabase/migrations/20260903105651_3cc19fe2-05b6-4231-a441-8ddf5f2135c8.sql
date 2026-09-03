CREATE OR REPLACE FUNCTION public.delete_service_line(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE old_row public.service_lines;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.service_lines WHERE slug = _slug;
  DELETE FROM public.service_lines WHERE slug = _slug;
  PERFORM public.log_admin_action('delete_service_line','service_lines', _slug, to_jsonb(old_row), NULL);
END $function$;

CREATE OR REPLACE FUNCTION public.rename_service_line(_old_slug text, _new_slug text)
RETURNS service_lines
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE old_row public.service_lines; new_row public.service_lines;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  IF _new_slug IS NULL OR length(trim(_new_slug)) = 0 THEN
    RAISE EXCEPTION 'New slug required';
  END IF;
  SELECT * INTO old_row FROM public.service_lines WHERE slug = _old_slug;
  IF old_row IS NULL THEN RAISE EXCEPTION 'Service line not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.service_lines WHERE slug = _new_slug) THEN
    RAISE EXCEPTION 'A service line with that id already exists';
  END IF;
  UPDATE public.service_lines SET slug = _new_slug, updated_at = now(), updated_by = auth.uid()
    WHERE slug = _old_slug RETURNING * INTO new_row;
  PERFORM public.log_admin_action('rename_service_line','service_lines', _new_slug, to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $function$;

REVOKE ALL ON FUNCTION public.delete_service_line(text) FROM anon;
REVOKE ALL ON FUNCTION public.rename_service_line(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_service_line(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rename_service_line(text, text) TO authenticated;