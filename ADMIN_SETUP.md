# SKYWAVE NEXUS — Admin Setup

Roles: **Super Admin → Admin → Staff → Viewer → Customer**.
Only Super Admin can manage users, password reset approvals, and critical site settings.

## Seed the first Super Admin (skywavenexus@gmail.com)

1. Lovable Cloud → **Authentication → Users → Add user**:
   - Email: `skywavenexus@gmail.com`
   - Password: choose a strong one (don't paste it back here)
   - Auto Confirm: yes
2. Cloud → **SQL editor**, replace `<USER_ID>`:

   ```sql
   UPDATE public.profiles
   SET username = 'davis', full_name = 'Davis (Super Admin)',
       email = 'skywavenexus@gmail.com', is_active = true
   WHERE id = '<USER_ID>';

   DELETE FROM public.user_roles WHERE user_id = '<USER_ID>';
   INSERT INTO public.user_roles (user_id, role) VALUES ('<USER_ID>', 'super_admin');
   ```

3. Sign in at `/sign-in`. You'll land on `/admin`.

## Day-to-day admin

- `/admin → Users & Roles` — Super Admin promotes/demotes users (super_admin / admin / staff / viewer / customer). The system refuses to demote the last super admin.
- `/admin → Password Resets` — Super Admin approves or rejects pending reset requests. After approval, the user returns to `/forgot-password` and submits again to receive the reset link. Pending requests expire after 24 hours.
- `/admin → Homepage / Service Lines / Media / Settings` — content management. Staff and above can edit; only Admin and above can delete.
- `/admin → Activity Log` — audit trail of admin actions.
