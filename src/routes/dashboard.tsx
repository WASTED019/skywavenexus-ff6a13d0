import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Req = {
  id: string;
  ref: string;
  status: string;
  division_name: string;
  service_name: string;
  admin_feedback: string | null;
  created_at: string;
};

type Profile = {
  username: string | null;
  full_name: string | null;
  email: string | null;
  delete_requested: boolean;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SKYWAVE NEXUS" }] }),
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/sign-in" }); return; }

      // If admin, send to admin dashboard
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if ((roles ?? []).some((r) => r.role === "admin")) { navigate({ to: "/admin" }); return; }

      const [{ data: prof }, { data: reqs }] = await Promise.all([
        supabase.from("profiles").select("username, full_name, email, delete_requested").eq("id", session.user.id).maybeSingle(),
        supabase.from("my_requests").select("id, ref, status, division_name, service_name, admin_feedback, created_at").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setProfile(prof as Profile | null);
      setRequests((reqs ?? []) as Req[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  const onRequestRemoval = async () => {
    if (!confirm("Request account removal? Your username and email will be anonymized. Service request records will be kept for office records.")) return;
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); navigate({ to: "/sign-in" }); return; }
    const anonUser = `deleted_${session.user.id.slice(0, 8)}`;
    const anonEmail = `${anonUser}@removed.local`;
    await supabase.from("profiles").update({
      username: anonUser,
      email: anonEmail,
      full_name: "Removed user",
      phone: null,
      whatsapp: null,
      delete_requested: true,
      is_active: false,
    }).eq("id", session.user.id);
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.username && <>Username: <strong>{profile.username}</strong> · </>}
              {profile?.email}
            </p>
          </div>
          <Link to="/request" className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">New Request</Link>
        </div>

        <h2 className="mt-10 text-lg font-semibold">My Requests</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
              <tr>
                {["Ref","Date","Service Line","Service","Status","Admin Feedback"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No requests yet. <Link to="/request" className="text-brand-blue underline">Submit one</Link>.</td></tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{r.ref}</td>
                  <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.division_name}</td>
                  <td className="px-3 py-2">{r.service_name}</td>
                  <td className="px-3 py-2"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">{r.status}</span></td>
                  <td className="px-3 py-2 text-xs">{r.admin_feedback || <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">Account removal</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This anonymizes your username and email. Service request records remain for office follow-up and audit. You will be logged out immediately.
          </p>
          <button onClick={onRequestRemoval} disabled={busy} className="mt-3 rounded-md border border-destructive bg-card px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-60">
            {busy ? "Processing…" : "Request Account Removal"}
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
