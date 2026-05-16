import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { divisions } from "@/data/divisions";
import { compressImage } from "@/lib/image-compress";
import { hasMin, can, roleLabel, type Role, rank } from "@/lib/permissions";

const STATUSES = ["New","Reviewed","Contacted","Quotation Sent","In Progress","Completed","Rejected / Not suitable"] as const;
const PRIORITIES = ["Low","Medium","High","Urgent"] as const;
const QUOTE_STATUSES = ["Not sent","Drafted","Sent","Accepted","Declined"] as const;
const FOLLOWUP_STATUSES = ["None","Scheduled","Done","Overdue"] as const;
const ASSIGNABLE_ROLES = ["super_admin","admin","staff","viewer","customer"] as const;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SKYWAVE NEXUS" }] }),
  component: AdminPage,
});

type Req = Record<string, unknown> & {
  id: string; ref: string; created_at: string; full_name: string; phone: string;
  whatsapp: string | null; email: string; county: string; town: string;
  client_type: string | null; division_id: string; division_name: string;
  service_id: string; service_name: string; description: string; urgency: string;
  follow_up_method: string | null; follow_up_date: string | null;
  status: string; admin_feedback: string | null; internal_notes: string | null;
  division_details: Record<string, string> | null; user_id: string | null;
  priority: string | null; assigned_staff: string | null;
  quote_status: string | null; follow_up_status: string | null;
};

type UserRow = {
  id: string; username: string | null; full_name: string | null;
  email: string | null; is_active: boolean; delete_requested: boolean; roles: string[];
};

type Tab = "dashboard"|"requests"|"homepage"|"service_lines"|"media"|"settings"|"users"|"resets"|"activity";

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) navigate({ to: "/sign-in" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const list = (roles ?? []).map((r) => r.role as Role);
      const best = list.reduce<Role>((acc, r) => (rank(r) > rank(acc) ? r : acc), null);
      if (cancelled) return;
      if (!can(best, "view_admin")) { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); return; }
      setRole(best);
      setAuthed(true);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  if (authed === null) return null;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "dashboard", label: "Dashboard", show: true },
    { id: "requests", label: "Requests", show: can(role, "manage_requests") },
    { id: "homepage", label: "Homepage", show: can(role, "edit_content") },
    { id: "service_lines", label: "Service Lines", show: can(role, "edit_content") },
    { id: "media", label: "Media", show: can(role, "edit_content") },
    { id: "settings", label: "Settings", show: can(role, "edit_content") },
    { id: "users", label: "Users & Roles", show: can(role, "manage_users") },
    { id: "resets", label: "Password Resets", show: can(role, "manage_resets") },
    { id: "activity", label: "Activity Log", show: can(role, "view_activity") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Signed in as {roleLabel(role)}</p>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); }} className="rounded-md border px-3 py-2 text-sm">Sign out</button>
        </div>

        {/* Tabs */}
        <div className="mt-5 border-b">
          <div className="flex flex-wrap gap-1">
            {tabs.filter(t => t.show).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`rounded-t-md px-3 py-2 text-sm font-medium ${tab===t.id ? "bg-brand-blue text-white" : "text-muted-foreground hover:bg-secondary"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {tab === "dashboard" && <DashboardPanel />}
          {tab === "requests" && <RequestsPanel role={role} />}
          {tab === "homepage" && <HomepagePanel role={role} />}
          {tab === "service_lines" && <ServiceLinesPanel />}
          {tab === "media" && <MediaPanel role={role} />}
          {tab === "settings" && <SettingsPanel />}
          {tab === "users" && <UsersPanel />}
          {tab === "resets" && <ResetsPanel />}
          {tab === "activity" && <ActivityPanel />}
        </div>
      </section>
      <Footer />
    </div>
  );
}

/* ===================== DASHBOARD ===================== */
function DashboardPanel() {
  const [stats, setStats] = useState({ requests: 0, pendingResets: 0, slides: 0, media: 0 });
  useEffect(() => {
    (async () => {
      const [r, pr, sl, md] = await Promise.all([
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("password_reset_requests").select("id", { count: "exact", head: true }).eq("status","pending"),
        supabase.from("homepage_slides").select("id", { count: "exact", head: true }),
        supabase.from("media_assets").select("id", { count: "exact", head: true }),
      ]);
      setStats({ requests: r.count ?? 0, pendingResets: pr.count ?? 0, slides: sl.count ?? 0, media: md.count ?? 0 });
    })();
  }, []);
  const Card = ({ k, v }: { k: string; v: number }) => (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-1 text-2xl font-bold text-brand-navy">{v}</div>
    </div>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card k="Total Requests" v={stats.requests} />
      <Card k="Pending Resets" v={stats.pendingResets} />
      <Card k="Slides" v={stats.slides} />
      <Card k="Media Assets" v={stats.media} />
    </div>
  );
}

/* ===================== REQUESTS ===================== */
function RequestsPanel({ role }: { role: Role }) {
  const [list, setList] = useState<Req[]>([]);
  const [active, setActive] = useState<Req | null>(null);
  const [staff, setStaff] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fDiv, setFDiv] = useState("");

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Req[]);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    (async () => {
      const [{ data: profs }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name, email, is_active, delete_requested"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const map = new Map<string, string[]>();
      for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
        const a = map.get(r.user_id) ?? []; a.push(r.role); map.set(r.user_id, a);
      }
      const all = ((profs ?? []) as Omit<UserRow,"roles">[]).map((p) => ({ ...p, roles: map.get(p.id) ?? [] }));
      setStaff(all.filter(u => u.roles.some(r => ["staff","admin","super_admin"].includes(r))));
    })();
  }, []);

  const filtered = useMemo(() => list.filter((r) => {
    if (fStatus && r.status !== fStatus) return false;
    if (fDiv && r.division_id !== fDiv) return false;
    if (q && !`${r.ref} ${r.full_name} ${r.phone} ${r.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [list, q, fStatus, fDiv]);

  const update = async (id: string, payload: Record<string, unknown>) => {
    const { error } = await supabase.rpc("update_request_meta", { _id: id, _payload: payload as any });
    if (error) { alert(error.message); return; }
    await refresh();
    if (active && active.id === id) setActive((a) => a ? { ...a, ...payload } as Req : a);
  };

  return (
    <>
      <div className="grid gap-3 md:grid-cols-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-md border px-3 py-2 text-sm" />
        <select value={fDiv} onChange={(e) => setFDiv(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All service lines</option>
          {divisions.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
            <tr>{["Ref","Date","Client","Service","Priority","Status","Quote","Action"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (<tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">No requests.</td></tr>)}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{r.ref}</td>
                <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2">{r.full_name}</td>
                <td className="px-3 py-2 text-xs">{r.service_name}</td>
                <td className="px-3 py-2 text-xs">{r.priority || "—"}</td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
                <td className="px-3 py-2 text-xs">{r.quote_status || "—"}</td>
                <td className="px-3 py-2"><button onClick={() => setActive(r)} className="rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold text-white">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActive(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-elegant">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{active.ref}</div>
                <h3 className="text-lg font-bold">{active.full_name}</h3>
                <div className="text-xs">{active.email} · {active.phone}</div>
              </div>
              <button onClick={() => setActive(null)} className="rounded-md border px-2 py-1 text-xs">Close</button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm">{active.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Status">
                <select defaultValue={active.status} onBlur={(e) => update(active.id, { status: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select defaultValue={active.priority || ""} onBlur={(e) => update(active.id, { priority: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">—</option>
                  {PRIORITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Quote Status">
                <select defaultValue={active.quote_status || ""} onBlur={(e) => update(active.id, { quote_status: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">—</option>
                  {QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Follow-up Status">
                <select defaultValue={active.follow_up_status || ""} onBlur={(e) => update(active.id, { follow_up_status: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">—</option>
                  {FOLLOWUP_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Assigned Staff">
                <select defaultValue={active.assigned_staff || ""} onBlur={(e) => update(active.id, { assigned_staff: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">— Unassigned —</option>
                  {staff.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.username || u.email}</option>)}
                </select>
              </Field>
              <Field label="Admin feedback (visible to customer)" full>
                <textarea defaultValue={active.admin_feedback || ""} onBlur={(e) => update(active.id, { admin_feedback: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
              </Field>
              <Field label="Internal notes (admin only)" full>
                <textarea defaultValue={active.internal_notes || ""} onBlur={(e) => update(active.id, { internal_notes: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
              </Field>
            </div>
            {!can(role, "manage_requests") && <p className="mt-3 text-xs text-destructive">You do not have permission to edit.</p>}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}

/* ===================== HOMEPAGE ===================== */
type Slide = { id: string; image_url: string|null; title: string|null; subtitle: string|null; button_text: string|null; button_link: string|null; display_order: number; is_active: boolean };
type HC = { id: string; hero_title: string|null; hero_subtitle: string|null; hero_body: string|null; button_text: string|null; button_link: string|null };

function HomepagePanel({ role }: { role: Role }) {
  const [hc, setHc] = useState<HC | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [versions, setVersions] = useState<Array<{ id: string; created_at: string; payload: HC }>>([]);
  const [msg, setMsg] = useState("");

  const reload = useCallback(async () => {
    const { data: c } = await supabase.from("homepage_content").select("*").eq("id","hero").maybeSingle();
    setHc(c as HC);
    const { data: s } = await supabase.from("homepage_slides").select("*").order("display_order");
    setSlides((s ?? []) as Slide[]);
    const { data: v } = await supabase.from("homepage_content_versions").select("id, created_at, payload").order("created_at", { ascending: false }).limit(10);
    setVersions((v ?? []) as Array<{ id: string; created_at: string; payload: HC }>);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const saveContent = async () => {
    if (!hc) return;
    const { error } = await supabase.rpc("update_homepage_content", { _payload: hc as any });
    setMsg(error ? error.message : "Saved.");
    if (!error) await reload();
  };

  const upsertSlide = async (s: Partial<Slide>) => {
    const { error } = await supabase.rpc("upsert_slide", { _payload: s as any });
    setMsg(error ? error.message : "Slide saved.");
    if (!error) await reload();
  };
  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const { error } = await supabase.rpc("delete_slide", { _id: id });
    setMsg(error ? error.message : "Deleted.");
    if (!error) await reload();
  };
  const restore = async (payload: HC) => {
    setHc(payload);
    setMsg("Restored — click Save to apply.");
  };

  if (!hc) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const activeCount = slides.filter(s => s.is_active).length;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-bold">Hero</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Hero title"><input value={hc.hero_title || ""} onChange={(e) => setHc({ ...hc, hero_title: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
          <Field label="Subtitle"><input value={hc.hero_subtitle || ""} onChange={(e) => setHc({ ...hc, hero_subtitle: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
          <Field label="Body" full><textarea value={hc.hero_body || ""} onChange={(e) => setHc({ ...hc, hero_body: e.target.value })} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
          <Field label="Button text"><input value={hc.button_text || ""} onChange={(e) => setHc({ ...hc, button_text: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
          <Field label="Button link"><input value={hc.button_link || ""} onChange={(e) => setHc({ ...hc, button_link: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveContent} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save</button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
        {versions.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">Restore previous version</summary>
            <ul className="mt-2 space-y-1 text-xs">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between border-t py-2">
                  <span>{new Date(v.created_at).toLocaleString()} · {v.payload.hero_title?.slice(0,40)}</span>
                  <button onClick={() => restore(v.payload)} className="rounded-md border px-2 py-1">Restore</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Slideshow</h2>
          <span className="text-xs text-muted-foreground">{activeCount}/5 active</span>
        </div>
        <div className="mt-4 space-y-4">
          {slides.map((s) => (
            <SlideEditor key={s.id} slide={s} onSave={upsertSlide} onDelete={() => deleteSlide(s.id)} canDelete={can(role, "delete_content")} />
          ))}
          <SlideEditor key="new" slide={{ id: "", image_url: "", title: "", subtitle: "", button_text: "", button_link: "", display_order: slides.length, is_active: true }} onSave={(s) => upsertSlide({ ...s, id: undefined })} canDelete={false} isNew />
        </div>
      </section>
    </div>
  );
}

function SlideEditor({ slide, onSave, onDelete, canDelete, isNew }: { slide: Slide; onSave: (s: Partial<Slide>) => void; onDelete?: () => void; canDelete: boolean; isNew?: boolean }) {
  const [s, setS] = useState(slide);
  return (
    <div className="rounded-xl border p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Image URL"><input value={s.image_url || ""} onChange={(e) => setS({ ...s, image_url: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Title"><input value={s.title || ""} onChange={(e) => setS({ ...s, title: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Subtitle"><input value={s.subtitle || ""} onChange={(e) => setS({ ...s, subtitle: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Button text"><input value={s.button_text || ""} onChange={(e) => setS({ ...s, button_text: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Button link"><input value={s.button_link || ""} onChange={(e) => setS({ ...s, button_link: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Order"><input type="number" value={s.display_order} onChange={(e) => setS({ ...s, display_order: parseInt(e.target.value) || 0 })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.is_active} onChange={(e) => setS({ ...s, is_active: e.target.checked })} /> Active</label>
        <button onClick={() => onSave(s)} className="rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold text-white">{isNew ? "Add slide" : "Save"}</button>
        {canDelete && onDelete && <button onClick={onDelete} className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive">Delete</button>}
      </div>
    </div>
  );
}

/* ===================== SERVICE LINES ===================== */
type SL = { slug: string; title: string; short_desc: string|null; full_desc: string|null; services: Array<{ name: string; explanation?: string }>; button_link: string|null; image_url: string|null; display_order: number };
function ServiceLinesPanel() {
  const [list, setList] = useState<SL[]>([]);
  const [msg, setMsg] = useState("");
  const reload = async () => {
    const { data } = await supabase.from("service_lines").select("*").order("display_order");
    setList(((data ?? []) as unknown) as SL[]);
  };
  useEffect(() => { reload(); }, []);
  const save = async (sl: SL) => {
    const { error } = await supabase.rpc("upsert_service_line", { _payload: sl as any });
    setMsg(error ? error.message : "Saved.");
    if (!error) reload();
  };
  return (
    <div className="space-y-4">
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      {list.map((sl, i) => (
        <SLEditor key={sl.slug} sl={sl} onChange={(next) => setList(list.map((x, j) => i === j ? next : x))} onSave={() => save(list[i])} />
      ))}
    </div>
  );
}

function SLEditor({ sl, onChange, onSave }: { sl: SL; onChange: (s: SL) => void; onSave: () => void }) {
  const [servicesText, setServicesText] = useState((sl.services || []).map(s => s.name).join("\n"));
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-bold">{sl.title}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="Title"><input value={sl.title} onChange={(e) => onChange({ ...sl, title: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Button link"><input value={sl.button_link || ""} onChange={(e) => onChange({ ...sl, button_link: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Image URL" full><input value={sl.image_url || ""} onChange={(e) => onChange({ ...sl, image_url: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Short description" full><textarea value={sl.short_desc || ""} onChange={(e) => onChange({ ...sl, short_desc: e.target.value })} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Full description" full><textarea value={sl.full_desc || ""} onChange={(e) => onChange({ ...sl, full_desc: e.target.value })} rows={4} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Services (one per line)" full>
          <textarea value={servicesText} onChange={(e) => { setServicesText(e.target.value); onChange({ ...sl, services: e.target.value.split("\n").filter(Boolean).map(name => ({ name })) }); }} rows={6} className="w-full rounded-md border px-3 py-2 text-sm font-mono" />
        </Field>
      </div>
      <button onClick={onSave} className="mt-3 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save</button>
    </section>
  );
}

/* ===================== MEDIA ===================== */
type Media = { id: string; storage_path: string; public_url: string; title: string|null; alt_text: string|null; category: string|null; created_at: string; size_bytes: number|null };
function MediaPanel({ role }: { role: Role }) {
  const [list, setList] = useState<Media[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const reload = async () => {
    const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Media[]);
  };
  useEffect(() => { reload(); }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setMsg("");
    try {
      const compressed = await compressImage(file);
      const path = `${Date.now()}-${compressed.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("site-media").upload(path, compressed, { contentType: compressed.type, upsert: false });
      if (upErr) { setMsg(upErr.message); return; }
      const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(path);
      const { error } = await supabase.rpc("register_media", { _payload: {
        storage_path: path, public_url: urlData.publicUrl, title: file.name, alt_text: file.name,
        mime_type: compressed.type, size_bytes: String(compressed.size),
      } as any });
      if (error) { setMsg(error.message); return; }
      setMsg("Uploaded."); reload();
    } finally {
      setBusy(false); e.target.value = "";
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete media?")) return;
    const { error } = await supabase.rpc("delete_media", { _id: id });
    setMsg(error ? error.message : "Deleted."); if (!error) reload();
  };

  return (
    <div>
      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
          <input type="file" accept="image/*" onChange={onUpload} disabled={busy} className="hidden" />
          {busy ? "Uploading…" : "Upload image"}
        </label>
        {msg && <span className="ml-3 text-xs text-muted-foreground">{msg}</span>}
        <p className="mt-2 text-xs text-muted-foreground">Images are auto-compressed to max 1920px JPEG.</p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => (
          <div key={m.id} className="rounded-xl border bg-card p-3 shadow-soft">
            <img src={m.public_url} alt={m.alt_text || ""} className="aspect-square w-full rounded-md object-cover" />
            <div className="mt-2 truncate text-xs font-semibold">{m.title || m.storage_path}</div>
            <div className="text-[10px] text-muted-foreground">{m.size_bytes ? Math.round(m.size_bytes/1024) + "KB" : ""}</div>
            <div className="mt-2 flex gap-1">
              <button onClick={() => navigator.clipboard.writeText(m.public_url)} className="flex-1 rounded-md border px-2 py-1 text-xs">Copy URL</button>
              {can(role, "delete_content") && <button onClick={() => del(m.id)} className="rounded-md border border-destructive px-2 py-1 text-xs text-destructive">Delete</button>}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No media yet.</p>}
      </div>
    </div>
  );
}

/* ===================== SETTINGS ===================== */
type Settings = { id: string; phone: string|null; whatsapp: string|null; email: string|null; location: string|null; logo_url: string|null; footer_text: string|null; social_links: Record<string,string>; footer_links: Array<{label:string;href:string}> };
function SettingsPanel() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [socialText, setSocialText] = useState("");

  useEffect(() => { (async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id","global").maybeSingle();
    const d = (data ?? null) as unknown as Settings | null;
    setS(d);
    if (d?.social_links) setSocialText(Object.entries(d.social_links).map(([k,v]) => `${k}: ${v}`).join("\n"));
  })(); }, []);

  if (!s) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const save = async () => {
    const social: Record<string,string> = {};
    socialText.split("\n").forEach(line => {
      const [k, ...rest] = line.split(":"); const v = rest.join(":").trim();
      if (k && v) social[k.trim()] = v;
    });
    const { error } = await supabase.rpc("update_site_settings", { _payload: { ...s, social_links: social } as any });
    setMsg(error ? error.message : "Saved.");
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-bold">Website Settings</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Phone"><input value={s.phone || ""} onChange={(e) => setS({ ...s, phone: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="WhatsApp"><input value={s.whatsapp || ""} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Email"><input value={s.email || ""} onChange={(e) => setS({ ...s, email: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Location"><input value={s.location || ""} onChange={(e) => setS({ ...s, location: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Logo URL" full><input value={s.logo_url || ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Paste a URL from Media Manager" /></Field>
        <Field label="Footer text" full><textarea value={s.footer_text || ""} onChange={(e) => setS({ ...s, footer_text: e.target.value })} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" /></Field>
        <Field label="Social links (one per line, e.g. facebook: https://…)" full>
          <textarea value={socialText} onChange={(e) => setSocialText(e.target.value)} rows={4} className="w-full rounded-md border px-3 py-2 text-sm font-mono" />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Save</button>
        {msg && <span className="text-xs">{msg}</span>}
      </div>
    </section>
  );
}

/* ===================== USERS ===================== */
function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string|null>(null);
  const [msg, setMsg] = useState("");

  const reload = async () => {
    const [{ data: profs }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("id, username, full_name, email, is_active, delete_requested").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const map = new Map<string,string[]>();
    for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
      const a = map.get(r.user_id) ?? []; a.push(r.role); map.set(r.user_id, a);
    }
    setUsers(((profs ?? []) as Omit<UserRow,"roles">[]).map((p) => ({ ...p, roles: map.get(p.id) ?? [] })));
  };
  useEffect(() => { reload(); }, []);

  const setRoleFor = async (target: UserRow, role: string) => {
    setMsg(""); setBusy(target.id);
    const { error } = await supabase.rpc("set_user_role", { _target: target.id, _role: role as any });
    setBusy(null);
    setMsg(error ? error.message : `${target.username || target.email} → ${role}`);
    if (!error) reload();
  };

  const filtered = users.filter(u => !q || `${u.username||""} ${u.full_name||""} ${u.email||""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-md border px-3 py-2 text-sm" />
        {msg && <span className="text-xs">{msg}</span>}
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
            <tr>{["User","Email","Current role","Change role"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const best = u.roles.reduce<Role>((acc, r) => (rank(r) > rank(acc) ? (r as Role) : acc), null);
              return (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.username || u.full_name || "—"}</td>
                  <td className="px-3 py-2 text-xs">{u.email || "—"}</td>
                  <td className="px-3 py-2 text-xs"><span className="rounded-full bg-secondary px-2 py-0.5">{roleLabel(best)}</span></td>
                  <td className="px-3 py-2">
                    <select defaultValue={best || ""} onChange={(e) => setRoleFor(u, e.target.value)} disabled={busy === u.id} className="rounded-md border px-2 py-1 text-xs">
                      <option value="" disabled>—</option>
                      {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{roleLabel(r as Role)}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">The system refuses to demote the last super admin.</p>
    </div>
  );
}

/* ===================== PASSWORD RESETS ===================== */
type Reset = { id: string; identifier: string; email: string|null; status: string; reason: string|null; requested_at: string; expires_at: string };
function ResetsPanel() {
  const [list, setList] = useState<Reset[]>([]);
  const [msg, setMsg] = useState("");

  const reload = async () => {
    const { data } = await supabase.from("password_reset_requests").select("*").order("requested_at", { ascending: false });
    setList((data ?? []) as Reset[]);
  };
  useEffect(() => { reload(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.rpc("approve_password_reset", { _id: id });
    setMsg(error ? error.message : "Approved. The user can now request the reset email.");
    if (!error) reload();
  };
  const reject = async (id: string) => {
    const reason = prompt("Reason (optional):") || "";
    const { error } = await supabase.rpc("reject_password_reset", { _id: id, _reason: reason });
    setMsg(error ? error.message : "Rejected.");
    if (!error) reload();
  };

  return (
    <div>
      {msg && <p className="text-xs">{msg}</p>}
      <div className="mt-3 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
            <tr>{["Requested","Identifier","Status","Expires","Action"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.length === 0 && (<tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No reset requests.</td></tr>)}
            {list.map((r) => {
              const expired = new Date(r.expires_at) < new Date();
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 text-xs">{new Date(r.requested_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.identifier}</td>
                  <td className="px-3 py-2 text-xs">{r.status}{expired && r.status === "pending" ? " (expired)" : ""}</td>
                  <td className="px-3 py-2 text-xs">{new Date(r.expires_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {r.status === "pending" && !expired ? (
                      <div className="flex gap-1">
                        <button onClick={() => approve(r.id)} className="rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold text-white">Approve</button>
                        <button onClick={() => reject(r.id)} className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive">Reject</button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== ACTIVITY LOG ===================== */
type Log = { id: string; actor_id: string|null; action: string; entity_type: string|null; entity_id: string|null; created_at: string; old_value: unknown; new_value: unknown };
function ActivityPanel() {
  const [list, setList] = useState<Log[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
    setList((data ?? []) as Log[]);
  })(); }, []);
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase tracking-wider">
          <tr>{["When","Action","Entity","Actor"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>
          {list.length === 0 && (<tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No activity yet.</td></tr>)}
          {list.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-3 py-2 text-xs">{new Date(l.created_at).toLocaleString()}</td>
              <td className="px-3 py-2 text-xs">{l.action}</td>
              <td className="px-3 py-2 text-xs">{l.entity_type}{l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ""}</td>
              <td className="px-3 py-2 text-xs font-mono">{l.actor_id?.slice(0, 8) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
