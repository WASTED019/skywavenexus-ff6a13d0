CREATE TABLE public.chatbot_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  email text,
  division_of_interest text,
  description text,
  scale_context text,
  location text,
  timeline text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chatbot_leads TO authenticated;
GRANT ALL ON public.chatbot_leads TO service_role;

ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and above can view chatbot leads"
ON public.chatbot_leads FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'staff')
  OR public.has_role(auth.uid(), 'viewer')
);

CREATE POLICY "Admins can delete chatbot leads"
ON public.chatbot_leads FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin')
);