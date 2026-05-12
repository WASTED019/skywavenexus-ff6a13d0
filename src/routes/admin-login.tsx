import { createFileRoute, redirect } from "@tanstack/react-router";

// Public admin login was removed. Users sign in with their own account and are
// routed to /admin only if their profile role is admin.
export const Route = createFileRoute("/admin-login")({
  beforeLoad: () => {
    throw redirect({ to: "/sign-in" });
  },
  component: () => null,
});
