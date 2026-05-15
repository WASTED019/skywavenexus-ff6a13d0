import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { rank, type Role } from "@/lib/permissions";

export type AuthState = {
  session: Session | null;
  userId: string | null;
  role: Role;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRole = async (uid: string | undefined) => {
      if (!uid) { if (active) setRole(null); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!active) return;
      const roles = (data ?? []).map((r: { role: string }) => r.role as Role);
      // pick highest-ranked role
      const best = roles.reduce<Role>((acc, r) => (rank(r) > rank(acc) ? r : acc), null);
      setRole(best);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
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
