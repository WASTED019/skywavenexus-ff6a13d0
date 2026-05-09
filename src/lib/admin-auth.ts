// DEMO admin auth — NOT production secure.
// Replace with Lovable Cloud / Supabase Auth or Firebase Auth before going live.
const KEY = "skywave_admin_session_v1";
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "ChangeMe@123";

export function login(user: string, pass: string) {
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    if (typeof window !== "undefined") localStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
export function isAuthed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}
