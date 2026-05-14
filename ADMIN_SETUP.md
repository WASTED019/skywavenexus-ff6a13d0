# SKYWAVE NEXUS — Admin Setup

Public sign-up always creates a **customer** account. Use the steps below to
seed the first admin. After that, any existing admin can promote other users
from inside the app at **/admin → Users → Promote to Admin**.

> **Never commit passwords to this file or any other file in the repo.**
> Use a strong, unique password and store it only in your password manager.
> You can rotate it any time from Cloud → Authentication → Users.

## Seed the first admin

1. Open Lovable Cloud → **Authentication → Users → Add user → Create new user**:
   - Email: `skywavenexus@gmail.com`
   - Password: choose a strong password (do NOT paste it back here)
   - Auto Confirm: yes
2. Copy the new user's UUID.
3. Open Cloud → **SQL editor** and run, replacing `<USER_ID>`:

   ```sql
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

4. Sign in at `/sign-in` with username `davis` (or the email) and the password
   you set. You'll be routed to `/admin`.

## Promote / demote other users

After the first admin exists, additional admins are created in-app:

1. Sign in as an admin and go to `/admin`.
2. Scroll to the **Users** table.
3. Click **Promote to Admin** next to any user, or **Demote to Customer** to
   revert. The system refuses to demote the last remaining admin.

The promotion button calls a `set_user_role` database function that verifies
the caller is an admin before changing roles.

## Notes

- The signup trigger creates a `profiles` row and a `customer` role
  automatically for every new auth user. The SQL above simply upgrades the
  seeded profile to admin.
- If the previous initial password (`davi!@#`) was ever used, **rotate it
  immediately** from Authentication → Users — it was exposed in the repo
  history and must be considered compromised.
