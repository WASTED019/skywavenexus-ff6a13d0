
-- =========================================================
-- Helpers
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'super_admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.role_rank(_role app_role)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _role
    WHEN 'super_admin' THEN 100
    WHEN 'admin'       THEN 80
    WHEN 'staff'       THEN 60
    WHEN 'viewer'      THEN 40
    WHEN 'customer'    THEN 20
    WHEN 'user'        THEN 10
    ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.has_min_role(_uid uuid, _min app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND public.role_rank(role) >= public.role_rank(_min)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_min_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_min_role(uuid, app_role) TO authenticated;

-- =========================================================
-- Activity log
-- =========================================================
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read activity log" ON public.admin_activity_log
  FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action text, _entity_type text, _entity_id text, _old jsonb, _new jsonb
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.admin_activity_log (actor_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _old, _new);
$$;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text,text,text,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text,text,text,jsonb,jsonb) TO authenticated;

-- =========================================================
-- site_settings
-- =========================================================
CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  phone text,
  whatsapp text,
  email text,
  location text,
  logo_url text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  footer_text text,
  footer_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_settings (id, phone, whatsapp, email, location, footer_text, social_links)
VALUES ('global', '0753366995', '0753366995', 'skywavenexus@gmail.com', 'Nyange, Nyeri, Kenya',
        'Integrated Solutions for Food Safety, Value Addition and Digital Connectivity.',
        '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- =========================================================
-- homepage_content (single row 'hero') + versions
-- =========================================================
CREATE TABLE public.homepage_content (
  id text PRIMARY KEY DEFAULT 'hero',
  hero_title text,
  hero_subtitle text,
  hero_body text,
  button_text text,
  button_link text,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read homepage" ON public.homepage_content FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.homepage_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload jsonb NOT NULL,
  edited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read homepage versions" ON public.homepage_content_versions
  FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), 'staff'));

INSERT INTO public.homepage_content (id, hero_title, hero_subtitle, hero_body, button_text, button_link)
VALUES ('hero',
  'SKYWAVE NEXUS — Integrated Solutions for Food Safety & Digital Connectivity',
  'Integrated Solutions for Food Safety, Value Addition and Digital Connectivity.',
  'Practical support in food safety, value addition, and digital connectivity for small businesses, farmers, processors, institutions, cyber cafés, and rural enterprises.',
  'Request a Service',
  '/request')
ON CONFLICT DO NOTHING;

-- =========================================================
-- homepage_slides + versions + active limit trigger
-- =========================================================
CREATE TABLE public.homepage_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  title text,
  subtitle text,
  button_text text,
  button_link text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read slides" ON public.homepage_slides FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.homepage_slides_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload jsonb NOT NULL,
  edited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_slides_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read slide versions" ON public.homepage_slides_versions
  FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), 'staff'));

CREATE OR REPLACE FUNCTION public.enforce_active_slide_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c int;
BEGIN
  IF NEW.is_active THEN
    SELECT count(*) INTO c FROM public.homepage_slides
      WHERE is_active = true AND id <> NEW.id;
    IF c >= 5 THEN
      RAISE EXCEPTION 'Cannot have more than 5 active slides';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_active_slide_limit
BEFORE INSERT OR UPDATE ON public.homepage_slides
FOR EACH ROW EXECUTE FUNCTION public.enforce_active_slide_limit();

-- =========================================================
-- service_lines
-- =========================================================
CREATE TABLE public.service_lines (
  slug text PRIMARY KEY,
  title text NOT NULL,
  short_desc text,
  full_desc text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  button_link text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.service_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_lines" ON public.service_lines FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.service_lines (slug, title, short_desc, full_desc, button_link, display_order) VALUES
('food-safety', 'Food Safety & Compliance Solutions',
  'Food safety, audits, SOPs & KEBS readiness.',
  'We help food businesses, processors, hotels, institutions, SMEs, and agribusinesses improve food safety, prepare for compliance, and set up professional quality systems.',
  '/divisions/food-safety', 1),
('value-addition', 'Value Addition Solutions',
  'Turn raw products into market-ready value-added products.',
  'We support farmers, processors, youth entrepreneurs, and SMEs in turning raw products into market-ready value-added products.',
  '/divisions/value-addition', 2),
('isp-connectivity', 'ISP & Connectivity Solutions',
  'WiFi, hotspots, MikroTik, CCTV & rural connectivity.',
  'Digital connectivity, networking, hotspot, and technical support services for homes, small businesses, cyber cafés, schools, farms, and rural communities.',
  '/divisions/isp-connectivity', 3)
ON CONFLICT DO NOTHING;

-- =========================================================
-- media_assets
-- =========================================================
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  title text,
  alt_text text,
  category text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff insert media" ON public.media_assets
  FOR INSERT TO authenticated WITH CHECK (public.has_min_role(auth.uid(), 'staff'));
CREATE POLICY "Staff update media" ON public.media_assets
  FOR UPDATE TO authenticated USING (public.has_min_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_min_role(auth.uid(), 'staff'));
CREATE POLICY "Admins delete media" ON public.media_assets
  FOR DELETE TO authenticated USING (public.has_min_role(auth.uid(), 'admin'));

-- =========================================================
-- password_reset_requests
-- =========================================================
CREATE TABLE public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  identifier text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read reset requests" ON public.password_reset_requests
  FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- =========================================================
-- service_requests new columns
-- =========================================================
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS priority text,
  ADD COLUMN IF NOT EXISTS assigned_staff uuid,
  ADD COLUMN IF NOT EXISTS quote_status text,
  ADD COLUMN IF NOT EXISTS follow_up_status text;

-- =========================================================
-- Stricter set_user_role: super_admin only, protect last super_admin
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_user_role(_target uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  super_count int;
  target_is_super boolean;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;
  IF _target IS NULL THEN
    RAISE EXCEPTION 'Target user is required';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _target AND role = 'super_admin')
    INTO target_is_super;

  IF target_is_super AND _role <> 'super_admin' THEN
    SELECT count(*) INTO super_count FROM public.user_roles WHERE role = 'super_admin';
    IF super_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last remaining super admin';
    END IF;
  END IF;

  -- Wipe other primary roles, then insert chosen
  DELETE FROM public.user_roles WHERE user_id = _target
    AND role IN ('super_admin','admin','staff','viewer','customer');
  INSERT INTO public.user_roles (user_id, role) VALUES (_target, _role)
  ON CONFLICT DO NOTHING;

  PERFORM public.log_admin_action('set_user_role', 'user', _target::text,
    NULL, jsonb_build_object('role', _role));
END $$;

-- =========================================================
-- CMS update RPCs (staff+)
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_site_settings(_payload jsonb)
RETURNS public.site_settings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  old_row public.site_settings;
  new_row public.site_settings;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.site_settings WHERE id = 'global';
  UPDATE public.site_settings SET
    phone = COALESCE(_payload->>'phone', phone),
    whatsapp = COALESCE(_payload->>'whatsapp', whatsapp),
    email = COALESCE(_payload->>'email', email),
    location = COALESCE(_payload->>'location', location),
    logo_url = COALESCE(_payload->>'logo_url', logo_url),
    social_links = COALESCE(_payload->'social_links', social_links),
    footer_text = COALESCE(_payload->>'footer_text', footer_text),
    footer_links = COALESCE(_payload->'footer_links', footer_links),
    updated_at = now(),
    updated_by = auth.uid()
  WHERE id = 'global'
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('update_site_settings','site_settings','global',
    to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.update_homepage_content(_payload jsonb)
RETURNS public.homepage_content LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  old_row public.homepage_content;
  new_row public.homepage_content;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.homepage_content WHERE id = 'hero';
  IF old_row IS NOT NULL THEN
    INSERT INTO public.homepage_content_versions (payload, edited_by)
    VALUES (to_jsonb(old_row), auth.uid());
  END IF;
  UPDATE public.homepage_content SET
    hero_title = COALESCE(_payload->>'hero_title', hero_title),
    hero_subtitle = COALESCE(_payload->>'hero_subtitle', hero_subtitle),
    hero_body = COALESCE(_payload->>'hero_body', hero_body),
    button_text = COALESCE(_payload->>'button_text', button_text),
    button_link = COALESCE(_payload->>'button_link', button_link),
    sections = COALESCE(_payload->'sections', sections),
    updated_at = now(),
    updated_by = auth.uid()
  WHERE id = 'hero'
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('update_homepage_content','homepage_content','hero',
    to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.upsert_slide(_payload jsonb)
RETURNS public.homepage_slides LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  new_row public.homepage_slides;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  v_id := NULLIF(_payload->>'id','')::uuid;
  -- snapshot all slides
  INSERT INTO public.homepage_slides_versions (payload, edited_by)
  SELECT jsonb_agg(to_jsonb(s) ORDER BY display_order), auth.uid() FROM public.homepage_slides s;
  IF v_id IS NULL THEN
    INSERT INTO public.homepage_slides (image_url, title, subtitle, button_text, button_link, display_order, is_active)
    VALUES (
      _payload->>'image_url',
      _payload->>'title',
      _payload->>'subtitle',
      _payload->>'button_text',
      _payload->>'button_link',
      COALESCE((_payload->>'display_order')::int, 0),
      COALESCE((_payload->>'is_active')::boolean, true)
    ) RETURNING * INTO new_row;
  ELSE
    UPDATE public.homepage_slides SET
      image_url = COALESCE(_payload->>'image_url', image_url),
      title = COALESCE(_payload->>'title', title),
      subtitle = COALESCE(_payload->>'subtitle', subtitle),
      button_text = COALESCE(_payload->>'button_text', button_text),
      button_link = COALESCE(_payload->>'button_link', button_link),
      display_order = COALESCE((_payload->>'display_order')::int, display_order),
      is_active = COALESCE((_payload->>'is_active')::boolean, is_active),
      updated_at = now()
    WHERE id = v_id RETURNING * INTO new_row;
  END IF;
  PERFORM public.log_admin_action('upsert_slide','homepage_slides', new_row.id::text, NULL, to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.delete_slide(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row public.homepage_slides;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.homepage_slides WHERE id = _id;
  DELETE FROM public.homepage_slides WHERE id = _id;
  PERFORM public.log_admin_action('delete_slide','homepage_slides', _id::text, to_jsonb(old_row), NULL);
END $$;

CREATE OR REPLACE FUNCTION public.upsert_service_line(_payload jsonb)
RETURNS public.service_lines LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.service_lines (slug, title, short_desc, full_desc, services, button_link, image_url, display_order, updated_by)
  VALUES (
    v_slug,
    COALESCE(_payload->>'title', ''),
    _payload->>'short_desc',
    _payload->>'full_desc',
    COALESCE(_payload->'services', '[]'::jsonb),
    _payload->>'button_link',
    _payload->>'image_url',
    COALESCE((_payload->>'display_order')::int, 0),
    auth.uid()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    full_desc = EXCLUDED.full_desc,
    services = EXCLUDED.services,
    button_link = EXCLUDED.button_link,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order,
    updated_at = now(),
    updated_by = auth.uid()
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('upsert_service_line','service_lines', v_slug, to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.register_media(_payload jsonb)
RETURNS public.media_assets LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_row public.media_assets;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  INSERT INTO public.media_assets (storage_path, public_url, title, alt_text, category, mime_type, size_bytes, uploaded_by)
  VALUES (
    _payload->>'storage_path',
    _payload->>'public_url',
    _payload->>'title',
    _payload->>'alt_text',
    _payload->>'category',
    _payload->>'mime_type',
    NULLIF(_payload->>'size_bytes','')::bigint,
    auth.uid()
  ) RETURNING * INTO new_row;
  PERFORM public.log_admin_action('register_media','media_assets', new_row.id::text, NULL, to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.delete_media(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row public.media_assets;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.media_assets WHERE id = _id;
  DELETE FROM public.media_assets WHERE id = _id;
  PERFORM public.log_admin_action('delete_media','media_assets', _id::text, to_jsonb(old_row), NULL);
END $$;

CREATE OR REPLACE FUNCTION public.update_request_meta(_id uuid, _payload jsonb)
RETURNS public.service_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row public.service_requests; new_row public.service_requests;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;
  SELECT * INTO old_row FROM public.service_requests WHERE id = _id;
  UPDATE public.service_requests SET
    status = COALESCE(_payload->>'status', status),
    priority = COALESCE(_payload->>'priority', priority),
    assigned_staff = COALESCE(NULLIF(_payload->>'assigned_staff','')::uuid, assigned_staff),
    quote_status = COALESCE(_payload->>'quote_status', quote_status),
    follow_up_status = COALESCE(_payload->>'follow_up_status', follow_up_status),
    admin_feedback = COALESCE(_payload->>'admin_feedback', admin_feedback),
    internal_notes = COALESCE(_payload->>'internal_notes', internal_notes),
    updated_at = now()
  WHERE id = _id RETURNING * INTO new_row;
  PERFORM public.log_admin_action('update_request_meta','service_requests', _id::text, to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;

-- =========================================================
-- Password reset RPCs
-- =========================================================
CREATE OR REPLACE FUNCTION public.request_password_reset(_identifier text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
  v_user_id uuid;
  v_id uuid;
BEGIN
  IF _identifier IS NULL OR length(trim(_identifier)) = 0 THEN
    RAISE EXCEPTION 'identifier required';
  END IF;
  v_email := public.resolve_login_email(_identifier);
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;
  END IF;
  INSERT INTO public.password_reset_requests (identifier, email, user_id)
  VALUES (lower(trim(_identifier)), v_email, v_user_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.request_password_reset(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_password_reset(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.approve_password_reset(_id uuid)
RETURNS public.password_reset_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.password_reset_requests;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can approve resets';
  END IF;
  UPDATE public.password_reset_requests
    SET status = 'approved', decided_by = auth.uid(), decided_at = now()
    WHERE id = _id AND status = 'pending'
  RETURNING * INTO r;
  IF r.user_id IS NOT NULL THEN
    UPDATE public.profiles SET reset_approved = true WHERE id = r.user_id;
  END IF;
  PERFORM public.log_admin_action('approve_password_reset','password_reset_requests', _id::text, NULL, to_jsonb(r));
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.reject_password_reset(_id uuid, _reason text)
RETURNS public.password_reset_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.password_reset_requests;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can reject resets';
  END IF;
  UPDATE public.password_reset_requests
    SET status = 'rejected', reason = _reason, decided_by = auth.uid(), decided_at = now()
    WHERE id = _id AND status = 'pending'
  RETURNING * INTO r;
  PERFORM public.log_admin_action('reject_password_reset','password_reset_requests', _id::text, NULL, to_jsonb(r));
  RETURN r;
END $$;

REVOKE EXECUTE ON FUNCTION public.update_site_settings(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_homepage_content(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_slide(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_slide(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_service_line(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.register_media(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_media(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_request_meta(uuid, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_password_reset(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_password_reset(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.update_site_settings(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_homepage_content(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_slide(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_slide(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_service_line(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_media(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_media(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_request_meta(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_password_reset(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_password_reset(uuid, text) TO authenticated;

-- =========================================================
-- Storage bucket: site-media
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('site-media','site-media', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read site-media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY "Staff upload site-media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_min_role(auth.uid(), 'staff'));
CREATE POLICY "Staff update site-media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND public.has_min_role(auth.uid(), 'staff'));
CREATE POLICY "Admins delete site-media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_min_role(auth.uid(), 'admin'));
