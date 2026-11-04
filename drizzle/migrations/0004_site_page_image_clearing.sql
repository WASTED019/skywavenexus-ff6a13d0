CREATE OR REPLACE FUNCTION public.upsert_site_page(_payload jsonb)
RETURNS public.site_pages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_row public.site_pages;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  INSERT INTO public.site_pages (slug, title, body, image_url, is_active, updated_by)
  VALUES (
    COALESCE(_payload->>'slug',''),
    COALESCE(_payload->>'title',''),
    _payload->>'body',
    _payload->>'image_url',
    COALESCE((_payload->>'is_active')::boolean, true),
    auth.uid()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = COALESCE(NULLIF(_payload->>'title',''), site_pages.title),
    body = COALESCE(_payload->>'body', site_pages.body),
    image_url = COALESCE(_payload->>'image_url', site_pages.image_url),
    is_active = COALESCE((_payload->>'is_active')::boolean, site_pages.is_active),
    updated_at = now(),
    updated_by = auth.uid()
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('upsert_site_page','site_pages', new_row.slug, NULL, to_jsonb(new_row));
  RETURN new_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_career_post(_payload jsonb)
RETURNS public.careers_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid; new_row public.careers_posts;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  v_id := NULLIF(_payload->>'id','')::uuid;
  IF v_id IS NULL THEN
    INSERT INTO public.careers_posts (title, location, job_type, description, image_url, display_order, is_active, updated_by)
    VALUES (
      COALESCE(_payload->>'title',''),
      _payload->>'location',
      _payload->>'job_type',
      _payload->>'description',
      _payload->>'image_url',
      COALESCE((_payload->>'display_order')::int, 0),
      COALESCE((_payload->>'is_active')::boolean, true),
      auth.uid()
    ) RETURNING * INTO new_row;
  ELSE
    UPDATE public.careers_posts SET
      title = COALESCE(_payload->>'title', title),
      location = COALESCE(_payload->>'location', location),
      job_type = COALESCE(_payload->>'job_type', job_type),
      description = COALESCE(_payload->>'description', description),
      image_url = COALESCE(_payload->>'image_url', image_url),
      display_order = COALESCE((_payload->>'display_order')::int, display_order),
      is_active = COALESCE((_payload->>'is_active')::boolean, is_active),
      updated_at = now(),
      updated_by = auth.uid()
    WHERE id = v_id RETURNING * INTO new_row;
  END IF;
  PERFORM public.log_admin_action('upsert_career_post','careers_posts', new_row.id::text, NULL, to_jsonb(new_row));
  RETURN new_row;
END;
$$;