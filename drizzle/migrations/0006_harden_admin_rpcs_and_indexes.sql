DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'approve_password_reset(uuid)','reject_password_reset(uuid,text)','clear_reset_flag()','consume_password_reset_approval()',
    'delete_blog_post(uuid)','delete_career_post(uuid)','delete_media(uuid)','delete_service_line(text)',
    'delete_showcase_item(uuid)','delete_site_page(text)','delete_slide(uuid)','register_media(jsonb)',
    'rename_service_line(text,text)','set_user_role(uuid,app_role)','update_homepage_content(jsonb)',
    'update_request_meta(uuid,jsonb)','update_site_settings(jsonb)','upsert_blog_post(jsonb)',
    'upsert_career_post(jsonb)','upsert_service_line(jsonb)','upsert_showcase_item(jsonb)',
    'upsert_site_page(jsonb)','upsert_slide(jsonb)','log_admin_action(text,text,text,jsonb,jsonb)']
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', f);
  END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_division ON public.service_requests(division_id);