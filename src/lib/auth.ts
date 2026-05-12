import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type Role = "admin" | "customer";

export type AuthState = {
  session: Session | null;
  userId: string | null;
  role: Role | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRole = async (uid: string | undefined) => {
      if (!uid) { if (active) setRole(null); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!active) return;
      const roles = (data ?? []).map((r: { role: string }) => r.role);
      setRole(roles.includes("admin") ? "admin" : roles.includes("customer") ? "customer" : null);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // defer to avoid deadlocks
      setTimeout(() => loadRole(s?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!active) return;
      setSession(s);
      loadRole(s?.user?.id).finally(() => active && setLoading(false));
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return { session, userId: session?.user?.id ?? null, role, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
