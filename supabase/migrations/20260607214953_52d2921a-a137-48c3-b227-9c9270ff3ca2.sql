
-- Showcase items
CREATE TABLE public.showcase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  division_id text NOT NULL,
  division_name text NOT NULL,
  description text,
  location text,
  outcome text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.showcase_items TO anon, authenticated;
GRANT ALL ON public.showcase_items TO service_role;
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read showcase" ON public.showcase_items FOR SELECT TO anon, authenticated USING (true);

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text,
  summary text,
  body text,
  image_url text,
  published_at date NOT NULL DEFAULT (now()::date),
  is_published boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Staff read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'staff'::app_role));

-- Upsert / delete RPCs
CREATE OR REPLACE FUNCTION public.upsert_showcase_item(_payload jsonb)
RETURNS public.showcase_items LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; new_row public.showcase_items;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  v_id := NULLIF(_payload->>'id','')::uuid;
  IF v_id IS NULL THEN
    INSERT INTO public.showcase_items (title, division_id, division_name, description, location, outcome, image_url, display_order, is_active, updated_by)
    VALUES (
      COALESCE(_payload->>'title',''),
      COALESCE(_payload->>'division_id',''),
      COALESCE(_payload->>'division_name',''),
      _payload->>'description', _payload->>'location', _payload->>'outcome', _payload->>'image_url',
      COALESCE((_payload->>'display_order')::int, 0),
      COALESCE((_payload->>'is_active')::boolean, true),
      auth.uid()
    ) RETURNING * INTO new_row;
  ELSE
    UPDATE public.showcase_items SET
      title = COALESCE(_payload->>'title', title),
      division_id = COALESCE(_payload->>'division_id', division_id),
      division_name = COALESCE(_payload->>'division_name', division_name),
      description = COALESCE(_payload->>'description', description),
      location = COALESCE(_payload->>'location', location),
      outcome = COALESCE(_payload->>'outcome', outcome),
      image_url = COALESCE(_payload->>'image_url', image_url),
      display_order = COALESCE((_payload->>'display_order')::int, display_order),
      is_active = COALESCE((_payload->>'is_active')::boolean, is_active),
      updated_at = now(), updated_by = auth.uid()
    WHERE id = v_id RETURNING * INTO new_row;
  END IF;
  PERFORM public.log_admin_action('upsert_showcase_item','showcase_items', new_row.id::text, NULL, to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.delete_showcase_item(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row public.showcase_items;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  SELECT * INTO old_row FROM public.showcase_items WHERE id = _id;
  DELETE FROM public.showcase_items WHERE id = _id;
  PERFORM public.log_admin_action('delete_showcase_item','showcase_items', _id::text, to_jsonb(old_row), NULL);
END $$;

CREATE OR REPLACE FUNCTION public.upsert_blog_post(_payload jsonb)
RETURNS public.blog_posts LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; new_row public.blog_posts;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'staff') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  v_id := NULLIF(_payload->>'id','')::uuid;
  IF v_id IS NULL THEN
    INSERT INTO public.blog_posts (slug, title, category, summary, body, image_url, published_at, is_published, display_order, updated_by)
    VALUES (
      COALESCE(NULLIF(_payload->>'slug',''), 'post-' || substr(md5(random()::text),1,8)),
      COALESCE(_payload->>'title',''),
      _payload->>'category', _payload->>'summary', _payload->>'body', _payload->>'image_url',
      COALESCE(NULLIF(_payload->>'published_at','')::date, now()::date),
      COALESCE((_payload->>'is_published')::boolean, true),
      COALESCE((_payload->>'display_order')::int, 0),
      auth.uid()
    ) RETURNING * INTO new_row;
  ELSE
    UPDATE public.blog_posts SET
      slug = COALESCE(NULLIF(_payload->>'slug',''), slug),
      title = COALESCE(_payload->>'title', title),
      category = COALESCE(_payload->>'category', category),
      summary = COALESCE(_payload->>'summary', summary),
      body = COALESCE(_payload->>'body', body),
      image_url = COALESCE(_payload->>'image_url', image_url),
      published_at = COALESCE(NULLIF(_payload->>'published_at','')::date, published_at),
      is_published = COALESCE((_payload->>'is_published')::boolean, is_published),
      display_order = COALESCE((_payload->>'display_order')::int, display_order),
      updated_at = now(), updated_by = auth.uid()
    WHERE id = v_id RETURNING * INTO new_row;
  END IF;
  PERFORM public.log_admin_action('upsert_blog_post','blog_posts', new_row.id::text, NULL, to_jsonb(new_row));
  RETURN new_row;
END $$;

CREATE OR REPLACE FUNCTION public.delete_blog_post(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row public.blog_posts;
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Insufficient role'; END IF;
  SELECT * INTO old_row FROM public.blog_posts WHERE id = _id;
  DELETE FROM public.blog_posts WHERE id = _id;
  PERFORM public.log_admin_action('delete_blog_post','blog_posts', _id::text, to_jsonb(old_row), NULL);
END $$;

-- Seed from existing hardcoded data
INSERT INTO public.showcase_items (title, division_id, division_name, description, location, outcome, display_order) VALUES
('Food Safety System Setup','food-safety','Food Safety & Compliance Solutions','Support for a small food processor to organize SOPs, hygiene checks, and production records.','Nyeri County','Better documentation, improved hygiene monitoring, and stronger compliance readiness.',1),
('Value Addition Product Support','value-addition','Value Addition Solutions','Support for product formulation, packaging guidance, and market-readiness improvement.','Central Kenya','Improved product presentation, clearer costing, and better customer appeal.',2),
('Rural Connectivity Setup','isp-connectivity','ISP & Connectivity Solutions','WiFi and network planning support for a rural business location.','Nyange, Nyeri','Improved internet access, stronger coverage, and better service reliability.',3);

INSERT INTO public.blog_posts (slug, title, category, summary, body, published_at, display_order) VALUES
('sops-small-food','Why Small Food Businesses Need Basic SOPs','Food Safety Tips','Simple SOPs prevent costly mistakes, protect customers and make your business audit-ready.','Standard Operating Procedures (SOPs) describe how key tasks should be done every time. For a small food business, even one or two pages of SOPs around cleaning, receiving, and packaging can dramatically reduce risk and customer complaints.','2026-04-12',1),
('farmers-value-addition','How Farmers Can Start Simple Value Addition','Value Addition Tips','From drying to packaging, small steps can transform raw produce into market-ready products.','Start with what you already grow. Identify one product that suffers post-harvest losses and explore drying, milling or basic packaging to add value with minimal investment.','2026-03-30',2),
('rural-wifi-checklist','What to Check Before Installing WiFi in a Rural Area','Internet & Networking Guides','Power, line of sight and device count should guide every rural WiFi plan.','Reliable rural WiFi starts with a site survey. Check available power, distance to upstream signal, line of sight, and the number of devices that need coverage.','2026-03-18',3),
('labels-matter','Why Product Labels Matter Before Selling Food Products','Business Compliance Tips','A clear, compliant label builds trust and unlocks formal markets.','Labels must communicate ingredients, allergens, weight, batch and expiry information. Beyond compliance, a clear label is your silent salesperson on the shelf.','2026-02-22',4),
('skywave-supports-sme','How SKYWAVE NEXUS Supports Small Businesses','Company Updates','Practical, field-based support across food safety, value addition and connectivity.','We work directly with small businesses, farmers and rural enterprises to solve real problems on the ground — from compliance documentation to connectivity.','2026-02-05',5);
