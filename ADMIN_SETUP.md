# SKYWAVE NEXUS — Admin Setup

The site no longer auto-promotes the first registered user to admin. Public sign-up
always creates a **customer** account. To seed the first admin (e.g. `davis`),
run the SQL below in Lovable Cloud → Backend → SQL editor.

> ⚠️ Replace `davi!@#` below with a strong password if you wish, but the example
> matches the value the company provided. The Auth API hashes it before storing.

```sql
-- 1) Create the auth user (only run once)
-- Uses Supabase's helper to insert into auth.users with a hashed password.
-- If a user with this email already exists, skip this block.

SELECT
  extensions.uuid_generate_v4();  -- ensure uuid-ossp is loaded (no-op if already)

-- Use the dashboard "Add user" UI (Authentication → Users → Add user → "Create new user"):
--   Email:    skywavenexus@gmail.com
--   Password: davi!@#
--   Auto Confirm: yes
-- Then copy the new user id and paste it below.

-- 2) Set username + admin role for that user
-- Replace <USER_ID> with the UUID you got above.

UPDATE public.profiles
SET username = 'davis',
    full_name = 'Davis (Admin)',
    email = 'skywavenexus@gmail.com',
    is_active = true
WHERE id = '<USER_ID>';

INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_ID>', 'admin')
ON CONFLICT DO NOTHING;
```

After this, sign in at `/sign-in` with username `davis` (or the email) and the
password above. You'll be routed to `/admin`.

## Notes
- The signup trigger creates a `profiles` row and a `customer` role
  automatically for every new auth user. Step 2 simply upgrades that profile
  and adds the admin role.
- Never put the admin password in committed code or env files. Rotate it from
  Authentication → Users.
- To create additional admins later, do it from the admin Users tab (Phase 3).
