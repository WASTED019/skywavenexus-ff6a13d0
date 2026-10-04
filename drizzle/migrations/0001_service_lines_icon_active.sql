ALTER TABLE public.service_lines ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.service_lines ADD COLUMN IF NOT EXISTS icon text;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_lines;
CREATE OR REPLACE FUNCTION public.upsert_service_line(_payload jsonb) RETURNS public.service_lines
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_slug text;
  old_row public.service_lines;
  new_row public.service_lines;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  v_slug := _payload->>'slug';
  IF v_slug IS NULL THEN RAISE EXCEPTION 'slug required'; END IF;
  SELECT * INTO old_row FROM public.service_lines WHERE slug = v_slug;
  INSERT INTO public.service_lines (slug, title, short_desc, full_desc, services, button_link, image_url, display_order, is_active, icon, updated_by)
  VALUES (
    v_slug, COALESCE(_payload->>'title', ''), _payload->>'short_desc', _payload->>'full_desc',
    COALESCE(_payload->'services', '[]'::jsonb), _payload->>'button_link', _payload->>'image_url',
    COALESCE((_payload->>'display_order')::int, 0),
    COALESCE((_payload->>'is_active')::boolean, true),
    NULLIF(left(_payload->>'icon', 40), ''),
    auth.uid()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, short_desc = EXCLUDED.short_desc, full_desc = EXCLUDED.full_desc,
    services = EXCLUDED.services, button_link = EXCLUDED.button_link, image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active, icon = EXCLUDED.icon,
    updated_at = now(), updated_by = auth.uid()
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('upsert_service_line','service_lines', v_slug, to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;