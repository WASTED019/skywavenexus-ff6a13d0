## Scope

Turn `/admin` into a content management system. Layout, routes, schema-of-public-tables, and RLS stay locked. New content lives in **new tables** so existing data flows are untouched. The website reads from these tables via public server functions; admins write through admin-gated server functions / RPCs.

Super Admin = `skywavenexus@gmail.com` only. All destructive/role/security operations are Super Admin-only.

---

## 1. Roles & RBAC

Extend `app_role` enum: add `super_admin`, `staff`, `viewer` (keep existing `admin`, `customer`, `user`).

New helpers:
- `is_super_admin(uid)` — convenience wrapper around `has_role`.
- `has_min_role(uid, role)` — orders roles: super_admin > admin > staff > viewer > customer.

Permission matrix:

| Capability | super | admin | staff | viewer |
|---|---|---|---|---|
| View admin panel | ✅ | ✅ | ✅ | ✅ |
| Edit homepage / slides / service lines / settings / media | ✅ | ✅ | ✅ | ❌ |
| Delete media / slides | ✅ | ✅ | ❌ | ❌ |
| Manage requests (status, notes, assign) | ✅ | ✅ | ✅ | ❌ |
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| Approve/reject password resets | ✅ | ❌ | ❌ | ❌ |
| View activity log | ✅ | ✅ | ❌ | ❌ |

Update `set_user_role` to require **super_admin** caller (was `admin`). Add safety: cannot demote the last super_admin. Seed: existing migration step grants `super_admin` to skywavenexus@gmail.com (documented in `ADMIN_SETUP.md`, run once via SQL).

`useAuth` returns the highest role; UI sections gate on it.

---

## 2. New tables (all RLS-on)

All content tables: public **SELECT** (so the site reads them anonymously), admin/staff **INSERT/UPDATE**, super-admin/admin **DELETE**.

- `site_settings` — single row keyed by `id='global'`. Columns: phone, whatsapp, email, location, logo_url, social_links jsonb, footer_text, footer_links jsonb.
- `homepage_content` — single row `id='hero'`. Columns: hero_title, hero_subtitle, button_text, button_link, plus jsonb `sections` for other homepage section copy.
- `homepage_slides` — id, image_url, title, subtitle, button_text, button_link, display_order, is_active. Trigger enforces ≤5 active slides.
- `homepage_content_versions` / `homepage_slides_versions` — snapshot rows (jsonb payload, edited_by, created_at) for the "restore previous version" feature.
- `service_lines` — slug PK matching the 3 service lines (`food-safety`, `value-addition`, `isp-connectivity`). Columns: title, short_desc, full_desc, services jsonb (string array), button_link, image_url.
- `media_assets` — id, storage_path, public_url, title, alt_text, category, mime_type, size_bytes, uploaded_by, created_at.
- `password_reset_requests` — id, user_id, identifier, status (`pending|approved|rejected|expired`), requested_at, decided_at, decided_by, reason, expires_at (default `now()+24h`).
- `admin_activity_log` — id, actor_id, action (text), entity_type, entity_id, old_value jsonb, new_value jsonb, created_at. Insert-only via `log_admin_action(...)` SECURITY DEFINER helper called from every admin RPC.
- `service_requests`: ALTER ADD `priority`, `assigned_staff` (uuid), `quote_status`, `follow_up_status` (all text/uuid, nullable). Existing RLS already lets admins update — no policy change.

Storage bucket `site-media` (public), with policies: public SELECT, admin/staff INSERT/UPDATE/DELETE. Image compression done client-side before upload (browser `canvas` resize to max 1920px, JPEG q=0.85).

---

## 3. Password-reset approval flow

Replace the current "instant `resetPasswordForEmail`" path:

1. `/forgot-password` calls new RPC `request_password_reset(_identifier)` → inserts a `pending` row, **no email sent**. UI shows "Submitted, awaiting approval".
2. Super Admin sees pending list in `/admin → Password Resets`. Approve calls `approve_password_reset(_id)`:
   - sets status=approved, records decider/time
   - sets `profiles.reset_approved=true` (existing flag the rest of the flow already uses)
   - sends the actual reset email via a `createServerFn` (`sendPasswordResetEmail`) using `supabaseAdmin.auth.admin.generateLink('recovery', email)` and the existing transactional email pipeline (or, if email infra not set up, uses the standard `resetPasswordForEmail` redirect).
3. Reject calls `reject_password_reset(_id, _reason)` → status=rejected.
4. Cron-less expiry: `customer_can_reset` already gates by `reset_approved`; we additionally check `expires_at > now()` and status='approved'. A nightly note in code: a follow-up SQL view marks expired rows on read.

All three RPCs log to `admin_activity_log`.

---

## 4. Server functions / RPCs (new)

Content writes go through SECURITY DEFINER SQL functions that check `has_min_role(auth.uid(),'staff')` (or higher where required) and call `log_admin_action`. Examples: `update_site_settings(jsonb)`, `update_homepage_content(jsonb)`, `upsert_slide(jsonb)`, `delete_slide(id)`, `upsert_service_line(jsonb)`, `register_media(jsonb)`, `delete_media(id)`, `update_request_meta(id, jsonb)`, `assign_request(id, staff_uuid)`.

Public read: site components query the new tables directly via `supabase.from(...).select()` (anon SELECT allowed).

---

## 5. UI — `/admin` rebuild

Tabbed shell (shadcn `Tabs`), mobile-friendly (collapses to a select on small screens). Tabs visible per role.

Tabs:
1. **Dashboard** — counts (pending requests, pending resets, slides, media).
2. **Requests** — current table + new columns: priority select, assigned staff dropdown (lists staff/admin profiles), quote status, follow-up status, internal notes textarea. Saves via `update_request_meta`.
3. **Homepage** — form for hero fields + slideshow CRUD (drag-handle reorder via display_order, active toggle, max-5 active warning), live "Preview" toggle that renders the homepage hero/slides component with draft state before save. "Restore previous version" picker reads from `*_versions`.
4. **Service Lines** — 3 cards, each with edit form (title, short/full desc, services list editor, button link, image picker from Media Manager).
5. **Media** — grid of `media_assets` with upload, replace, delete, edit metadata. Reusable `<MediaPicker/>` component used by Homepage / Service Lines for image_url fields.
6. **Settings** — single form bound to `site_settings` row. Header/Footer/Contact pages read from this table at runtime so changes are immediate.
7. **Users & Roles** (super_admin only) — existing list + role dropdown (super_admin/admin/staff/viewer/customer). Demote-last-super_admin guard.
8. **Password Resets** (super_admin only) — pending queue with Approve/Reject + reason modal.
9. **Activity Log** (admin+) — paginated table.

Existing layout, header, footer, and routes are untouched. Site components (`Header`, `Footer`, `index.tsx`, `divisions.*`, `contact`) get a small refactor to read from the new tables with sane fallbacks to the current hardcoded data so the site never goes blank if a row is missing.

---

## 6. Files

**Migrations (one file, single transaction):**
- Add enum values, helpers, new tables + RLS, content versioning triggers, slide-limit trigger, all RPCs, `log_admin_action`, storage bucket + policies, ALTER on `service_requests`.

**New code:**
- `src/lib/cms.ts` — typed read helpers (settings, homepage, slides, service lines).
- `src/lib/cms.functions.ts` — thin server fns for image uploads / signed actions if needed.
- `src/lib/permissions.ts` — `Role` order, `can(role, capability)`.
- `src/components/admin/*` — `Tabs.tsx`, `RequestsPanel.tsx`, `HomepagePanel.tsx`, `SlidesEditor.tsx`, `ServiceLinesPanel.tsx`, `MediaPanel.tsx`, `MediaPicker.tsx`, `SettingsPanel.tsx`, `UsersPanel.tsx` (extracted from current admin page), `PasswordResetsPanel.tsx`, `ActivityLogPanel.tsx`, `RolePill.tsx`.
- `src/lib/image-compress.ts` — canvas-based resize/compress.

**Edited:**
- `src/routes/admin.tsx` — replaced with tab shell.
- `src/lib/auth.ts` — return new roles.
- `src/routes/forgot-password.tsx` — call `request_password_reset` instead of sending immediately.
- `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/routes/index.tsx`, `src/routes/divisions.*`, `src/routes/contact.tsx` — pull text/contact from CMS tables (with hardcoded fallbacks).
- `ADMIN_SETUP.md` — note new roles + super_admin seed snippet.

---

## Out of scope

- Visual/layout changes to the public site.
- Changing existing route paths or DB column names.
- Editing schema of existing `profiles`/`user_roles`/`service_requests` beyond the listed `service_requests` ADD COLUMNs.
- Real email-template customization (uses existing recovery email pipeline).
- Bulk media import, video uploads, full-text search across content.
