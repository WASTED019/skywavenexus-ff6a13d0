
-- =========================
-- 1. Roles enum: add customer
-- =========================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'customer'
      AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'customer';
  END IF;
END $$;

-- =========================
-- 2. Profiles table
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  county TEXT,
  town TEXT,
  reset_approved BOOLEAN NOT NULL DEFAULT false,
  delete_requested BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- 3. Signup trigger: create profile + customer role
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone, whatsapp, email, county, town)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.email,
    NEW.raw_user_meta_data->>'county',
    NEW.raw_user_meta_data->>'town'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- 4. Remove unsafe auto-admin
-- =========================
DROP FUNCTION IF EXISTS public.claim_admin_if_none();

-- =========================
-- 5. Login by username or email
-- =========================
CREATE OR REPLACE FUNCTION public.resolve_login_email(identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  IF identifier IS NULL OR length(trim(identifier)) = 0 THEN
    RETURN NULL;
  END IF;
  IF position('@' in identifier) > 0 THEN
    RETURN lower(trim(identifier));
  END IF;
  SELECT u.email INTO result
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = lower(trim(identifier))
  LIMIT 1;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated;

-- =========================
-- 6. user_roles: only admins can mutate (insert/update/delete via policies)
-- =========================
DROP POLICY IF EXISTS "Admins manage roles insert" ON public.user_roles;
CREATE POLICY "Admins manage roles insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles update" ON public.user_roles;
CREATE POLICY "Admins manage roles update" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles delete" ON public.user_roles;
CREATE POLICY "Admins manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- 7. Service requests
-- =========================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  client_type TEXT,
  division_id TEXT NOT NULL,
  division_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'Medium',
  follow_up_method TEXT,
  follow_up_date DATE,
  division_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'New',
  admin_feedback TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_user ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_email ON public.service_requests(lower(email));
CREATE INDEX IF NOT EXISTS idx_service_requests_phone ON public.service_requests(phone);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON public.service_requests(created_at DESC);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER trg_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anyone (guest or authed) can create a request
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.service_requests;
CREATE POLICY "Anyone can submit a request" ON public.service_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    -- guests must not pre-assign user_id; authed users may only assign to themselves
    (user_id IS NULL) OR (user_id = auth.uid())
  );

-- Customers read only own
DROP POLICY IF EXISTS "Customers read own requests" ON public.service_requests;
CREATE POLICY "Customers read own requests" ON public.service_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins read all
DROP POLICY IF EXISTS "Admins read all requests" ON public.service_requests;
CREATE POLICY "Admins read all requests" ON public.service_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins update / delete all
DROP POLICY IF EXISTS "Admins update requests" ON public.service_requests;
CREATE POLICY "Admins update requests" ON public.service_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete requests" ON public.service_requests;
CREATE POLICY "Admins delete requests" ON public.service_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Customer-facing view that hides internal_notes
CREATE OR REPLACE VIEW public.my_requests AS
SELECT id, ref, full_name, phone, whatsapp, email, county, town, client_type,
       division_id, division_name, service_id, service_name, description, urgency,
       follow_up_method, follow_up_date, division_details, status, admin_feedback,
       created_at, updated_at, user_id
FROM public.service_requests;

GRANT SELECT ON public.my_requests TO authenticated;

-- Public track function: lookup by ref + email/phone, returns minimal fields
CREATE OR REPLACE FUNCTION public.track_request(
  _ref TEXT,
  _contact TEXT
)
RETURNS TABLE (
  ref TEXT,
  status TEXT,
  division_name TEXT,
  service_name TEXT,
  created_at TIMESTAMPTZ,
  admin_feedback TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.ref, s.status, s.division_name, s.service_name, s.created_at, s.admin_feedback
  FROM public.service_requests s
  WHERE s.ref = _ref
    AND (
      lower(s.email) = lower(coalesce(_contact, ''))
      OR s.phone = coalesce(_contact, '')
      OR s.whatsapp = coalesce(_contact, '')
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.track_request(TEXT, TEXT) TO anon, authenticated;

-- =========================
-- 8. Request files
-- =========================
CREATE TABLE IF NOT EXISTS public.request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.request_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can attach files" ON public.request_files;
CREATE POLICY "Anyone can attach files" ON public.request_files
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Customers read files for own requests" ON public.request_files;
CREATE POLICY "Customers read files for own requests" ON public.request_files
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.service_requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins read all files" ON public.request_files;
CREATE POLICY "Admins read all files" ON public.request_files
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- 9. Storage bucket for request uploads (private)
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-uploads', 'request-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload to request-uploads (form is public)
DROP POLICY IF EXISTS "Anyone can upload request files" ON storage.objects;
CREATE POLICY "Anyone can upload request files" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'request-uploads');

-- Admins can read files in the bucket
DROP POLICY IF EXISTS "Admins read request files" ON storage.objects;
CREATE POLICY "Admins read request files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'request-uploads' AND public.has_role(auth.uid(), 'admin'));

-- =========================
-- 10. Customer password reset (gated by admin approval)
-- =========================
CREATE OR REPLACE FUNCTION public.customer_can_reset(_identifier TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE (lower(p.username) = lower(_identifier) OR lower(u.email) = lower(_identifier))
      AND p.reset_approved = true
      AND p.is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.customer_can_reset(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.clear_reset_flag()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET reset_approved = false WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.clear_reset_flag() TO authenticated;
