import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { divisions } from "@/data/divisions";

const STATUSES = ["New","Reviewed","Contacted","Quotation Sent","In Progress","Completed","Rejected / Not suitable"] as const;
type Status = typeof STATUSES[number];

type Req = {
  id: string;
  ref: string;
  created_at: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  county: string;
  town: string;
  client_type: string | null;
  division_id: string;
  division_name: string;
  service_id: string;
  service_name: string;
  description: string;
  urgency: string;
  follow_up_method: string | null;
  follow_up_date: string | null;
  status: string;
  admin_feedback: string | null;
  internal_notes: string | null;
  division_details: Record<string, string> | null;
  user_id: string | null;
};

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SKYWAVE NEXUS" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [list, setList] = useState<Req[]>([]);
  const [active, setActive] = useState<Req | null>(null);
  const [q, setQ] = useState("");
  const [fDiv, setFDiv] = useState("");
  const [fUrg, setFUrg] = useState("");
  const [fStatus, setFStatus] = useState("");

  const refresh = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Req[]);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) navigate({ to: "/sign-in" }); return; }
      const { data: roles, error } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const isAdmin = !error && (roles ?? []).some((r) => r.role === "admin");
      if (cancelled) return;
      if (!isAdmin) { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); return; }
      setAuthed(true);
      await refresh();
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const filtered = useMemo(() => list.filter((r) => {
    if (fDiv && r.division_id !== fDiv) return false;
    if (fUrg && r.urgency !== fUrg) return false;
    if (fStatus && r.status !== fStatus) return false;
    if (q) {
      const t = q.toLowerCase();
      const blob = `${r.ref} ${r.full_name} ${r.phone} ${r.email} ${r.town} ${r.service_name}`.toLowerCase();
      if (!blob.includes(t)) return false;
    }
    return true;
  }), [list, q, fDiv, fUrg, fStatus]);

  const stats = useMemo(() => ({
    total: list.length,
    new: list.filter((r) => r.status === "New").length,
    pending: list.filter((r) => r.status === "Reviewed").length,
    contacted: list.filter((r) => r.status === "Contacted").length,
    completed: list.filter((r) => r.status === "Completed").length,
  }), [list]);

  const byDivision = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of list) map[r.division_name] = (map[r.division_name] || 0) + 1;
    return map;
  }, [list]);

  const updateField = async (id: string, patch: Partial<Req>) => {
    await supabase.from("service_requests").update(patch).eq("id", id);
    setList((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
    setActive((a) => (a && a.id === id ? { ...a, ...patch } : a));
  };

  if (authed === null) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); }} className="rounded-md border px-3 py-2 text-sm">Sign out</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Total" value={stats.total} />
          <Stat label="New" value={stats.new} />
          <Stat label="Reviewed" value={stats.pending} />
          <Stat label="Contacted" value={stats.contacted} />
          <Stat label="Completed" value={stats.completed} />
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-4 shadow-soft">
          <h2 className="text-sm font-semibold">Requests by division</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {Object.entries(byDivision).length === 0 && <span className="text-muted-foreground">No requests yet.</span>}
            {Object.entries(byDivision).map(([k, v]) => (
              <span key={k} className="rounded-full bg-secondary px-3 py-1 font-semibold">{k}: {v}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, name, phone…" className="rounded-md border px-3 py-2 text-sm" />
          <select value={fDiv} onChange={(e) => setFDiv(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All divisions</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <select value={fUrg} onChange={(e) => setFUrg(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All urgency</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
              <tr>
                {["Ref","Date","Client","Phone","Location","Division","Service","Urgency","Status","Action"].map((h) => (
                  <th key={h} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (<tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No requests match.</td></tr>)}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{r.ref}</td>
                  <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.full_name}</td>
                  <td className="px-3 py-2">{r.phone}</td>
                  <td className="px-3 py-2">{r.town}, {r.county}</td>
                  <td className="px-3 py-2">{r.division_name}</td>
                  <td className="px-3 py-2">{r.service_name}</td>
                  <td className="px-3 py-2">{r.urgency}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => setActive(r)} className="rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold text-white">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActive(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-elegant">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{active.ref}</div>
                <h3 className="text-lg font-bold">{active.full_name}</h3>
                <div className="text-xs text-muted-foreground">{new Date(active.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setActive(null)} className="rounded-md border px-2 py-1 text-xs">Close</button>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info k="Phone" v={active.phone} />
              <Info k="WhatsApp" v={active.whatsapp || "—"} />
              <Info k="Email" v={active.email} />
              <Info k="Location" v={`${active.town}, ${active.county}`} />
              <Info k="Client type" v={active.client_type || "—"} />
              <Info k="Division" v={active.division_name} />
              <Info k="Service" v={active.service_name} />
              <Info k="Urgency" v={active.urgency} />
              <Info k="Follow-up" v={`${active.follow_up_method || "—"}${active.follow_up_date ? ` on ${active.follow_up_date}` : ""}`} />
            </dl>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{active.description}</p>
            </div>
            {active.division_details && Object.keys(active.division_details).length > 0 && (
              <div className="mt-4 rounded-xl bg-secondary p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Division-specific</div>
                <ul className="mt-1 space-y-1">
                  {Object.entries(active.division_details).map(([k, v]) => (<li key={k}><strong>{k}:</strong> {String(v)}</li>))}
                </ul>
              </div>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Status</span>
                <select value={active.status} onChange={(e) => updateField(active.id, { status: e.target.value as Status })} className="w-full rounded-md border px-3 py-2 text-sm">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Admin feedback (visible to customer)</span>
                <textarea defaultValue={active.admin_feedback || ""} onBlur={(e) => updateField(active.id, { admin_feedback: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold">Internal notes (admin only)</span>
                <textarea defaultValue={active.internal_notes || ""} onBlur={(e) => updateField(active.id, { internal_notes: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
              </label>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-navy">{value}</div>
    </div>
  );
}
function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
