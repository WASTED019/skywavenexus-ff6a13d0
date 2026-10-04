import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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
  phone: string | null;
  whatsapp: string | null;
  delete_requested: boolean;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SKYWAVE NEXUS" }] }),
  component: CustomerDashboard,
});

const phoneRe = /^\+?[0-9 ]{9,15}$/;
const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
  phone: z.string().trim().refine((v) => v === "" || phoneRe.test(v), "Enter a valid phone number, e.g. 0712345678"),
  whatsapp: z.string().trim().refine((v) => v === "" || phoneRe.test(v), "Enter a valid WhatsApp number, e.g. 0712345678"),
});

function ProfileCard({ profile, onSaved }: { profile: Profile; onSaved: (p: Partial<Profile>) => void }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); setStatus({ kind: "err", text: "Your session expired. Please sign in again." }); return; }
    const payload = {
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", session.user.id);
    setSaving(false);
    if (error) { setStatus({ kind: "err", text: "Could not save your changes. Please try again." }); return; }
    onSaved(payload);
    setStatus({ kind: "ok", text: "Saved ✓" });
    setTimeout(() => setStatus(null), 3000);
  };

  const field = (key: keyof typeof form, label: string, type = "text", auto?: string) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      <input
        type={type}
        autoComplete={auto}
        value={form[key]}
        maxLength={key === "full_name" ? 100 : 16}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      {errors[key] && <span className="mt-1 block text-xs text-destructive">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-2xl border bg-card p-5 shadow-soft">
      <h2 className="text-lg font-semibold">Profile & Settings</h2>
      <p className="mt-1 text-xs text-muted-foreground">Email: {profile.email || "—"} (cannot be changed here)</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {field("full_name", "Full name", "text", "name")}
        {field("phone", "Phone number", "tel", "tel")}
        {field("whatsapp", "WhatsApp number", "tel")}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={saving} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status && <span className={`text-xs font-semibold ${status.kind === "ok" ? "text-brand-blue" : "text-destructive"}`}>{status.text}</span>}
      </div>
    </form>
  );
}

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
      if ((roles ?? []).some((r) => ["admin","super_admin","staff","viewer"].includes(r.role))) { navigate({ to: "/admin" }); return; }

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

        {profile && <ProfileCard profile={profile} onSaved={(p) => setProfile((cur) => cur ? { ...cur, ...p } : cur)} />}

        <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">Account removal</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            You will be logged out immediately.
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
