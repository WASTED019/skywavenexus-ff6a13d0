This work is large. I'll split it into phases so you can approve and we ship in working increments instead of one giant unstable change. I'll keep the current logo, colors, homepage, divisions, blog and showcase content.

## Phase 1 — Auth, roles & navigation (foundation)

Database (single migration):
- `profiles` table: `id` (PK = auth user id), `username` (unique), `full_name`, `phone`, `whatsapp`, `email`, `county`, `town`, `reset_approved` (bool, default false), `delete_requested` (bool, default false), `is_active` (bool, default true), timestamps.
- Keep existing `user_roles` (`admin` | `customer`). Add `customer` enum value.
- Trigger on `auth.users` insert → create `profiles` row + default `customer` role from signup metadata.
- Drop `claim_admin_if_none()` (no auto-admin).
- RLS: users read/update own profile; admins read/update all. `has_role()` stays.
- Helper RPC `login_identifier_to_email(identifier text)` (SECURITY DEFINER) so login supports username OR email.

Navigation:
- Public header/footer: Home, Divisions, Request Service, SKYWAVE NEXUS, Blog/Updates, Contact, Track Request, **Sign In**, **Sign Up**. Remove "Admin Login" everywhere.
- Logged-in: replace Sign In/Sign Up with **Dashboard** + **Logout**. Dashboard routes to `/admin` if role=admin, else `/dashboard`.

Auth pages:
- `/sign-in` — label "Username or Email" + "Password". Forgot-password notice with phone/WhatsApp. After login, role-based redirect.
- `/sign-up` — fields: username, full name, phone, whatsapp, email, county, town, password, confirm. Always creates **customer**. Redirects to `/dashboard`.
- Delete the old `/admin-login` route and `claim_admin_if_none` UI message.

Admin seeding:
- I will NOT hardcode davis's password. Instead I'll provide a one-time SQL snippet you run in the Cloud SQL editor to create the auth user + profile + admin role for `skywavenexus@gmail.com` / username `davis`. Documented in a new `ADMIN_SETUP.md`.

## Phase 2 — Request capture in Supabase

Tables:
- `service_requests` — all current fields from the form + `user_id` (nullable, for guests), `ref` (unique), `status`, `admin_feedback`, `internal_notes`, `division_details` jsonb, timestamps.
- `request_files` — `request_id` FK, storage path, name, size, mime.
- Storage bucket `request-uploads` (private). RLS: guests can insert (no select); customers select own files via request join; admins all.
- RLS on requests: insert public allowed; customers select own (`user_id = auth.uid()`); admins all; customers cannot see `internal_notes` (handled by view `customer_requests` or column-filtered select in client).

Migrate `/request`:
- Replace `localStorage` writes with Supabase insert.
- Upload file to storage, insert `request_files` row.
- Show real DB-stored ref number on success.
- Fix Food Safety / Value Addition / ISP dynamic field grid spacing (each field on its own row with proper label, gap-4).

## Phase 3 — Dashboards

`/dashboard` (customer):
- List of own requests with status, division, service, date, admin feedback.
- "Request Account Removal" button → sets `delete_requested=true`, anonymizes username/email, signs out.
- Link to /request.

`/admin` (admin only via RLS + route guard):
- Requests tab (existing, now Supabase-backed) with status, admin_feedback, internal_notes editors.
- Users tab: list, search, create customer/admin, deactivate, approve reset (set `reset_approved=true`), view delete-requested users.
- Blog Manager, Showcase Manager, Slideshow Manager, Website Images Manager (Phase 4).

## Phase 4 — Content managers (blog, showcase, slideshow, site images)

Tables: `blog_posts`, `showcase_items`, `slides`, `site_images` (key/url pairs: logo, hero, blog_placeholder, showcase_placeholder, contact). Storage bucket `site-assets` (public).
Migrate the static `src/data/blog.ts` / `showcase.ts` content into seed inserts so existing content persists. Public pages read from Supabase with the static content as fallback.

## Phase 5 — Password reset & track request

- `/track` page: ref + email/phone lookup; returns status, division, service, date, admin_feedback only.
- Password reset: customer-initiated reset only succeeds if their profile's `reset_approved=true`; flag is cleared after success. Admin toggles it in Users tab.

---

## Scope question before I start

This is roughly 4–6 implementation rounds of work. I recommend we do it in this order and you approve phase-by-phase so each one lands working:

1. **Phase 1 (auth/roles/nav) + Phase 2 (request capture)** — biggest user-visible fixes from your list (items 1–9, 11 partially, 15). Ship together.
2. **Phase 3 (dashboards) + Phase 5 (track + reset + account removal)** — items 8, 10, 11, 12.
3. **Phase 4 (content managers + storage-backed images)** — items 13, 14.

Reply "approve phase 1+2" (or tell me to bundle differently) and I'll start with the migration + code changes. The davis admin will be seedable via a SQL snippet I'll include — I won't put the password in the repo.