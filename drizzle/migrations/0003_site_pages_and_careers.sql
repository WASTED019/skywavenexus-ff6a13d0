CREATE TABLE public.site_pages (
  slug text PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  body text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_pages TO anon, authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active site pages" ON public.site_pages FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Staff read all site pages" ON public.site_pages FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), 'staff'::app_role));

CREATE TABLE public.careers_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT ''::text,
  location text,
  job_type text,
  description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.careers_posts TO anon, authenticated;
GRANT ALL ON public.careers_posts TO service_role;
ALTER TABLE public.careers_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active careers" ON public.careers_posts FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Staff read all careers" ON public.careers_posts FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), 'staff'::app_role));

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
    NULLIF(_payload->>'image_url',''),
    COALESCE((_payload->>'is_active')::boolean, true),
    auth.uid()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = COALESCE(NULLIF(_payload->>'title',''), site_pages.title),
    body = COALESCE(_payload->>'body', site_pages.body),
    image_url = COALESCE(NULLIF(_payload->>'image_url',''), site_pages.image_url),
    is_active = COALESCE((_payload->>'is_active')::boolean, site_pages.is_active),
    updated_at = now(),
    updated_by = auth.uid()
  RETURNING * INTO new_row;
  PERFORM public.log_admin_action('upsert_site_page','site_pages', new_row.slug, NULL, to_jsonb(new_row));
  RETURN new_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_site_page(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  DELETE FROM public.site_pages WHERE slug = _slug;
  PERFORM public.log_admin_action('delete_site_page','site_pages', _slug, NULL, NULL);
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
      NULLIF(_payload->>'image_url',''),
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
      image_url = COALESCE(NULLIF(_payload->>'image_url',''), image_url),
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

CREATE OR REPLACE FUNCTION public.delete_career_post(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  DELETE FROM public.careers_posts WHERE id = _id;
  PERFORM public.log_admin_action('delete_career_post','careers_posts', _id::text, NULL, NULL);
END;
$$;

INSERT INTO public.site_pages (slug, title, body, is_active)
VALUES (
  'privacy',
  'Privacy Policy',
  'SKYWAVE NEXUS Integrated Solutions (“we”, “our”) respects your privacy. This policy explains what information this website collects, how we use it, and the choices you have.

Information we collect
When you submit a service request we collect your name, phone number, email address, county and town, and the details you give us about the work you need. If you attach files to a request, we store those files so our team can review them. If you create an account, we store your sign-in details and the profile information you choose to add (full name, phone, WhatsApp). If you chat with our website assistant and leave your contact details, we store that conversation summary as a lead.

How we use it
We use this information only to respond to your request, prepare quotations, deliver and follow up on services, and keep internal records of the work. We do not sell your information, and we do not share it with third parties except where needed to deliver a service you asked for or where the law requires it.

Storage and access
Information is stored in our secured database. Only authorised SKYWAVE NEXUS staff can view service requests, attached files and chat leads, and access is limited by role. Passwords are stored only as secure hashes and are never visible to our team.

Retention
We keep service request records for as long as they are useful for follow-up and our own record-keeping. You may ask us to correct or remove your personal information at any time using the contact details below; account removal requests are reviewed by our team before they are actioned.

Cookies and sign-in
We use essential browser storage only to keep you signed in and to remember your preferences. We do not run advertising trackers on this website.

Your choices
You can browse the website without giving us any personal information. You can also submit a service request without an account, though creating one makes follow-up and quote acceptance easier.

Contact
For any privacy question or request, reach us at skywavenexus@gmail.com or call/WhatsApp 0753366995. We are based in Nyange, Nyeri, Kenya.

Changes to this policy
If we change this policy, we will post the updated version on this page with a new effective date.',
  true
),
(
  'careers',
  'Careers at SKYWAVE NEXUS',
  'We are a small, hands-on team delivering food safety and compliance support, value addition advisory, and ISP and connectivity solutions across Kenya.

Working here means practical field work, clear documentation, and systems that have to keep running in real conditions — from cold rooms and processing lines to rural network links.

We do not always have open positions. When we do, they are listed below. You can also send a general application with your CV and the kind of work you do, and we will keep it on file for future openings.',
  true
)
ON CONFLICT (slug) DO NOTHING;