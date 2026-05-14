## Scope

Three tracks. UI text only for the rename — URLs and route filenames stay `/divisions/*`. Admin seeding handled in Lovable Cloud by you. New in-app tool to promote any user to admin.

## 1. Rename "Divisions" → "Service Lines" (UI text only)

Search-and-replace user-visible copy in these files:
- `src/components/Header.tsx` — nav label
- `src/components/Footer.tsx` — column heading + links
- `src/routes/index.tsx` — homepage section heading + CTA copy
- `src/routes/divisions.index.tsx` — H1 "Our Divisions" → "Our Service Lines", meta title/description, intro copy
- `src/routes/divisions.$divisionId.tsx` — "Back to Divisions" link, meta strings
- `src/routes/request.tsx` — "Division" form label → "Service Line", page copy
- `src/routes/dashboard.tsx`, `src/routes/track.tsx`, `src/routes/admin.tsx` — column headings ("Division" → "Service Line")
- `src/routes/skywave-nexus.tsx` — showcase labels
- `public/llms.txt` — `Divisions` entry → `Service Lines`
- `src/lib/requests.ts` — any user-facing labels (not field keys)

Internal identifiers untouched: `divisionId`, `division_id`, `divisions` array, route filenames, DB columns, the `data-lovable` div ids, sitemap paths. URLs continue to be `/divisions` and `/divisions/:id`.

## 2. Admin credentials

Update `ADMIN_SETUP.md` with the simplified flow you confirmed:
1. In Cloud → Authentication → Users → **Add user** for `skywavenexus@gmail.com` with a password you choose, Auto Confirm on.
2. Run a one-line SQL snippet (provided in the doc) to upgrade that profile to admin.

No password is committed. No new migration needed for seeding — the existing `handle_new_user` trigger creates the profile/customer row, and the SQL snippet flips it to admin.

## 3. In-app "Promote to Admin" tool

Add a Users management panel on `/admin` (admins only):
- Lists all profiles (username, full name, email, current roles, active/delete-requested flags).
- Per-row actions: **Promote to Admin** / **Demote to Customer**.
- Disables demote on the last remaining admin (safety check both client-side and via a DB function).

Backed by a new `SECURITY DEFINER` SQL function `set_user_role(_target uuid, _role app_role)` that:
- Verifies caller is admin via `has_role(auth.uid(), 'admin')`.
- For demotes, refuses if it would leave zero admins.
- Inserts/deletes rows in `public.user_roles` accordingly.
- `EXECUTE` granted to `authenticated` only; revoked from `anon` and `PUBLIC`.

Existing RLS already lets admins read all profiles, so the listing query is just `supabase.from('profiles').select(...)` joined with a roles fetch.

## Technical notes

- Migration file adds the `set_user_role` function plus an index on `user_roles(role)` for the admin-count check.
- Promotion UI uses `supabase.rpc('set_user_role', { _target, _role })` with toast feedback and a TanStack Query refetch.
- No URL changes → no sitemap, robots, or canonical updates needed.
- No changes to the security memory; the new RPC is admin-gated.

## Out of scope

- Changing route paths or DB column names.
- Bulk user import or invite-by-email flows.
- Password reset UX changes (already covered by existing `customer_can_reset` flow).