# SKYWAVE NEXUS — Admin Setup

The site no longer auto-promotes the first registered user to admin. Public sign-up
always creates a **customer** account. To seed the first admin (e.g. `davis`),
follow the steps below.

> ⚠️ **Never commit the admin password to this file or any other file in the
> repo.** Use a strong, unique password and store it only in your password
> manager. Rotate it from Authentication → Users at any time.

## Steps

1. In Lovable Cloud → Backend → Authentication → Users, click **Add user →
   Create new user**:
   - Email: `skywavenexus@gmail.com`
   - Password: `<choose-a-strong-password>` (do NOT paste it back here)
   - Auto Confirm: yes
2. Copy the new user's UUID.
3. In Backend → SQL editor, run the following with `<USER_ID>` replaced:

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

After this, sign in at `/sign-in` with username `davis` (or the email) and
the password you set. You'll be routed to `/admin`.

## Notes
- The signup trigger creates a `profiles` row and a `customer` role
  automatically for every new auth user. The SQL above simply upgrades that
  profile and adds the admin role.
- If the previous initial password (`davi!@#`) was ever used, **rotate it
  immediately** from Authentication → Users — it was exposed in the repo
  history and must be considered compromised.
- To create additional admins later, do it from the admin Users tab.
