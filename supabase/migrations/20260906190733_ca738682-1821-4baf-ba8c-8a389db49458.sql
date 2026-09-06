CREATE TABLE public.davis_portfolio (
  id text PRIMARY KEY DEFAULT 'main',
  draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  published jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Deliberately NO grants to anon/authenticated: this content is reachable only
-- through the page's own server-side editor (service role), so neither the
-- SKYWAVE admin login nor any browser client can read or write it.
GRANT ALL ON public.davis_portfolio TO service_role;

ALTER TABLE public.davis_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to davis portfolio"
  ON public.davis_portfolio FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE TRIGGER trg_davis_portfolio_updated_at
  BEFORE UPDATE ON public.davis_portfolio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.davis_portfolio (id, draft, published, published_at)
SELECT 'main', c.doc, c.doc, now()
FROM (
  SELECT '{
    "hero_name": "Davis Waithaka",
    "hero_line": "I plan and run cold-chain and produce aggregation on the ground in the Nanyuki\u2013Laikipia\u2013Narumoru corridor, and lead technical operations and connectivity work across food safety, value addition and ISP service lines.",
    "about": "My training is in food science, and most of my working days are spent between chilled stores, aggregation points and rural network sites. Alongside that I have spent several years on connectivity and networking \u2014 planning links, installing radios and keeping rural sites online. I am also working through ethical hacking and defensive security material as an ongoing learning journey, not a credential I hold.",
    "work": [
      {
        "title": "Ustawi Afrika (Ustawi Fresh)",
        "role": "Founder",
        "body": "Cold chain and produce aggregation with smallholder farmers in the Nanyuki, Laikipia and Narumoru corridor \u2014 collection points, chilled handling and route planning that keep harvested produce in good condition from farm to buyer.",
        "note": "Detailed case study coming soon."
      },
      {
        "title": "SKYWAVE NEXUS",
        "role": "Technical & Operations Lead",
        "body": "Leads technical operations, systems and connectivity strategy across the company\u0027s food safety, value addition and ISP service lines.",
        "note": ""
      }
    ],
    "background": [
      { "label": "Food science", "body": "Degree-level food science training, applied daily to cold-chain handling, hygiene and post-harvest quality." },
      { "label": "Technical and networking", "body": "Wireless link planning, radio and antenna installation, router and switch configuration, and site troubleshooting for rural connectivity." },
      { "label": "Food safety systems", "body": "Working knowledge of HACCP and ISO 22000 principles. Formal lead auditor certification is in progress, not yet completed." },
      { "label": "Ethical hacking", "body": "In progress. Currently studying network and web application security fundamentals through structured self-study and lab practice." }
    ],
    "gallery": [],
    "contact_phone": "+254703169662",
    "contact_email": "daviwaithaks22@gmail.com",
    "contact_note": "These are my personal contacts and are separate from SKYWAVE NEXUS\u0027s published contact details."
  }'::jsonb AS doc
) c
ON CONFLICT (id) DO NOTHING;