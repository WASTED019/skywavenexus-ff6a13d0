export type Role = "super_admin" | "admin" | "staff" | "viewer" | "customer" | "user" | null;

const RANK: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  staff: 60,
  viewer: 40,
  customer: 20,
  user: 10,
};

export function rank(role: Role | string | null | undefined): number {
  if (!role) return 0;
  return RANK[role] ?? 0;
}

export function hasMin(role: Role, min: Exclude<Role, null>): boolean {
  return rank(role) >= rank(min);
}

export type Capability =
  | "view_admin"
  | "edit_content"
  | "delete_content"
  | "manage_requests"
  | "manage_users"
  | "manage_resets"
  | "view_activity";

export function can(role: Role, cap: Capability): boolean {
  switch (cap) {
    case "view_admin": return hasMin(role, "viewer");
    case "edit_content": return hasMin(role, "staff");
    case "delete_content": return hasMin(role, "admin");
    case "manage_requests": return hasMin(role, "staff");
    case "manage_users": return hasMin(role, "super_admin");
    case "manage_resets": return hasMin(role, "super_admin");
    case "view_activity": return hasMin(role, "admin");
  }
}

export function roleLabel(role: Role): string {
  if (!role) return "—";
  return ({
    super_admin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
    viewer: "Viewer",
    customer: "Customer",
    user: "User",
  } as Record<string, string>)[role] ?? role;
}
