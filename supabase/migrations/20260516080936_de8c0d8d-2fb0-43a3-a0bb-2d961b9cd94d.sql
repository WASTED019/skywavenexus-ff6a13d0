
-- Prevent any client (anon or authenticated) from calling log_admin_action directly.
-- Legitimate callers are SECURITY DEFINER admin RPCs which run as the function owner
-- and can still invoke it internally.
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb, jsonb) FROM authenticated;
