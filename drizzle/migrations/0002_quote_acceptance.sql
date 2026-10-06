ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS quote_amount numeric(12,2);
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS quote_currency text NOT NULL DEFAULT 'KES';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS quote_accepted_at timestamptz;

CREATE OR REPLACE VIEW public.my_requests WITH (security_invoker=on) AS
SELECT id, ref, full_name, phone, whatsapp, email, county, town, client_type, division_id, division_name,
  service_id, service_name, description, urgency, follow_up_method, follow_up_date, division_details,
  status, admin_feedback, created_at, updated_at, user_id,
  quote_amount, quote_currency, quote_status, quote_accepted_at
FROM public.service_requests;

CREATE OR REPLACE FUNCTION public.update_request_meta(_id uuid, _payload jsonb) RETURNS public.service_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    quote_amount = CASE WHEN _payload ? 'quote_amount' THEN NULLIF(_payload->>'quote_amount','')::numeric ELSE quote_amount END,
    quote_currency = COALESCE(NULLIF(left(_payload->>'quote_currency',8),''), quote_currency),
    quote_accepted_at = CASE WHEN _payload ? 'quote_amount' AND NULLIF(_payload->>'quote_amount','')::numeric IS DISTINCT FROM quote_amount THEN NULL ELSE quote_accepted_at END,
    follow_up_status = COALESCE(_payload->>'follow_up_status', follow_up_status),
    admin_feedback = COALESCE(_payload->>'admin_feedback', admin_feedback),
    internal_notes = COALESCE(_payload->>'internal_notes', internal_notes),
    updated_at = now()
  WHERE id = _id RETURNING * INTO new_row;
  PERFORM public.log_admin_action('update_request_meta','service_requests', _id::text, to_jsonb(old_row), to_jsonb(new_row));
  RETURN new_row;
END $$;

DROP FUNCTION IF EXISTS public.track_request(text, text);
CREATE FUNCTION public.track_request(_ref text, _contact text)
RETURNS TABLE(ref text, status text, division_name text, service_name text, created_at timestamptz, admin_feedback text,
  quote_amount numeric, quote_currency text, quote_status text, quote_accepted_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.ref, s.status, s.division_name, s.service_name, s.created_at, s.admin_feedback,
    s.quote_amount, s.quote_currency, s.quote_status, s.quote_accepted_at
  FROM public.service_requests s
  WHERE length(trim(coalesce(_ref,''))) >= 6
    AND length(trim(coalesce(_contact,''))) >= 5
    AND s.ref = trim(_ref)
    AND (
      (coalesce(s.email,'') <> '' AND lower(s.email) = lower(trim(_contact)))
      OR (coalesce(s.phone,'') <> '' AND s.phone = trim(_contact))
      OR (coalesce(s.whatsapp,'') <> '' AND s.whatsapp = trim(_contact))
    )
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_request(text, text) TO anon, authenticated;

-- Client accepts a quote: owner (signed in) or matching ref + contact.
CREATE OR REPLACE FUNCTION public.accept_quote(_ref text, _contact text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.service_requests;
BEGIN
  SELECT * INTO r FROM public.service_requests s
  WHERE s.ref = trim(coalesce(_ref,''))
    AND (
      (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
      OR (length(trim(coalesce(_contact,''))) >= 5 AND (
        (coalesce(s.email,'') <> '' AND lower(s.email) = lower(trim(_contact)))
        OR (coalesce(s.phone,'') <> '' AND s.phone = trim(_contact))
        OR (coalesce(s.whatsapp,'') <> '' AND s.whatsapp = trim(_contact))))
    )
  LIMIT 1;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF r.quote_amount IS NULL THEN RAISE EXCEPTION 'No quote to accept yet'; END IF;
  IF r.quote_accepted_at IS NOT NULL THEN RETURN 'already_accepted'; END IF;
  UPDATE public.service_requests
     SET quote_status = 'Accepted', quote_accepted_at = now(), status = 'Quote Accepted', updated_at = now()
   WHERE id = r.id;
  RETURN 'accepted';
END $$;
REVOKE ALL ON FUNCTION public.accept_quote(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_quote(text, text) TO anon, authenticated;