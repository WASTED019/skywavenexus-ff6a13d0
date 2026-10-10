import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  davisLogin,
  davisLogout,
  getDavisEditorState,
  publishDavisDraft,
  saveDavisDraft,
  uploadDavisImage,
  type PortfolioDoc,
} from "@/lib/davis.functions";
import "@/styles/davis.css";
import { defaultMetrics, defaultPillars, defaultOptions, dispatchSchema, type GalleryEntry } from "@/lib/davis-content";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SocialAccountsEditor } from "@/components/SocialAccountsEditor";
import { socialAccountSchema } from "@/lib/social-accounts";

export const Route = createFileRoute("/davis/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Davis Waithaka — Private Portfolio Editor" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private editor." },
      { property: "og:title", content: "Davis Waithaka — Private Portfolio Editor" },
      { property: "og:description", content: "Private editor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: DavisAdmin,
});

const EMPTY: PortfolioDoc = {
  preferred_name: "",
  social_accounts: [],
  hero_name: "",
  hero_line: "",
  hero_image: "",
  authority: "Cold Chain Systems / Field Infrastructure / Traceability ERPs",
  about: "",
  metrics: defaultMetrics,
  pillars: defaultPillars,
  work: [],
  background: [],
  gallery: [],
  consultation_heading: "Let's put the right systems in place.",
  consultation_note: "Tell me what you're working through. I'll respond directly.",
  consultation_options: defaultOptions,
  contact_phone: "",
  contact_email: "",
  contact_note: "",
};

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <label className="dvs-field">
      <span>{label}</span>
      {area ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function DavisAdmin() {
  const loadState = useServerFn(getDavisEditorState);
  const login = useServerFn(davisLogin);
  const logout = useServerFn(davisLogout);
  const save = useServerFn(saveDavisDraft);
  const publish = useServerFn(publishDavisDraft);
  const upload = useServerFn(uploadDavisImage);

  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [doc, setDoc] = useState<PortfolioDoc>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const s = await loadState({});
    setUnlocked(s.unlocked);
    if (s.unlocked && s.draft) setDoc({ ...EMPTY, ...(s.draft as PortfolioDoc) });
    setReady(true);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof PortfolioDoc>(key: K, value: PortfolioDoc[K]) =>
    setDoc((d) => ({ ...d, [key]: value }));

  const updateDispatch = (index: number, change: Partial<GalleryEntry>) =>
    setDoc((current) => ({ ...current, gallery: current.gallery.map((entry, i) => i === index ? { ...entry, ...change } : entry) }));

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await login({ data: { password } });
      if (!r.ok) setError("Incorrect password");
      else {
        setPassword("");
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    const socialValidation = socialAccountSchema.array().max(6).safeParse(doc.social_accounts);
    if (!socialValidation.success) { setStatus(socialValidation.error.issues[0]?.message ?? "Check social accounts"); return; }
    const validation = dispatchSchema.array().safeParse(doc.gallery);
    if (!validation.success) { setStatus(`Check Field Dispatches: ${validation.error.issues[0]?.message ?? "Invalid entry"}`); return; }
    setBusy(true);
    setStatus("");
    try {
      await save({ data: { doc } });
      setStatus("Draft saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function onPublish() {
    const socialValidation = socialAccountSchema.array().max(6).safeParse(doc.social_accounts);
    if (!socialValidation.success) { setStatus(socialValidation.error.issues[0]?.message ?? "Check social accounts"); return; }
    const validation = dispatchSchema.array().safeParse(doc.gallery);
    if (!validation.success) { setStatus(`Check Field Dispatches: ${validation.error.issues[0]?.message ?? "Invalid entry"}`); return; }
    setBusy(true);
    setStatus("");
    try {
      await save({ data: { doc } });
      await publish({});
      setStatus("Published — the page is live");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not publish");
    } finally {
      setBusy(false);
    }
  }

  async function pickImage(file: File): Promise<string> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("Could not read the file"));
      reader.readAsDataURL(file);
    });
    const r = await upload({ data: { name: file.name, mime: file.type, base64 } });
    return r.url;
  }

  function ImagePicker({ onDone }: { onDone: (url: string) => void }) {
    return (
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setStatus("Uploading…");
          try {
            onDone(await pickImage(file));
            setStatus("Photo uploaded — remember to save");
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    );
  }

  if (!ready) {
    return (
      <div className="dvs">
        <div className="dvs-wrap dvs-section">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="dvs">
        <div className="dvs-wrap dvs-section" style={{ maxWidth: "26rem" }}>
          <h1>Editor</h1>
          <form method="post" onSubmit={onLogin}>
            <label className="dvs-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="dvs-status">{error}</p>}
            <Button className="dvs-btn" disabled={busy || !password}>
              Enter
            </Button>
          </form>
          <p className="dvs-status" style={{ marginTop: "1.5rem" }}>Or use your account</p>
          <a className="dvs-btn" data-variant="ghost" href="/sign-in">
            Sign in with account
          </a>
          <p className="dvs-status">After signing in, come back to this page — it unlocks automatically for the owner account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dvs">
      <div className="dvs-wrap dvs-editor">
        <div className="dvs-row" style={{ justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.9rem" }}>Edit my page</h1>
          <div className="dvs-row">
            <a className="dvs-btn" data-variant="ghost" href="/davis" target="_blank" rel="noreferrer">
              Preview
            </a>
            <Button
              className="dvs-btn"
              data-variant="ghost"
              onClick={async () => {
                await logout({});
                await supabase.auth.signOut();
                setUnlocked(false);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        {status && <p className="dvs-status">{status}</p>}

        <div className="dvs-card">
          <h2>Header</h2>
          <Field label="Preferred display name" value={doc.preferred_name} onChange={(v) => set("preferred_name", v)} />
          <Field label="Name" value={doc.hero_name} onChange={(v) => set("hero_name", v)} />
          <Field label="Authority line" value={doc.authority} onChange={(v) => set("authority", v)} />
          <Field label="Intro line" value={doc.hero_line} onChange={(v) => set("hero_line", v)} area />
          <Field label="Header photo URL" value={doc.hero_image} onChange={(v) => set("hero_image", v)} />
          <ImagePicker onDone={(url) => set("hero_image", url)} />
        </div>

        <section className="dvs-social-settings">
          <h2>Social accounts</h2>
          <SocialAccountsEditor accounts={doc.social_accounts} onChange={(accounts) => set("social_accounts", accounts)} />
        </section>

        <div className="dvs-card">
          <h2>Impact metrics</h2>
          <p className="dvs-status">Only metrics with a value are shown. Leave unverified figures blank.</p>
          {doc.metrics.map((m, i) => <div className="dvs-card" key={i}>
            <Field label="Metric label" value={m.label} onChange={(v) => set("metrics", doc.metrics.map((x, j) => j === i ? {...x, label:v} : x))}/>
            <Field label="Verified value" value={m.value} onChange={(v) => set("metrics", doc.metrics.map((x, j) => j === i ? {...x, value:v} : x))}/>
            <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("metrics", doc.metrics.filter((_,j) => j !== i))}>Remove</Button>
          </div>)}
          <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("metrics", [...doc.metrics, {label:"", value:""}])}>Add metric</Button>
        </div>

        <div className="dvs-card">
          <h2>Capability pillars</h2>
          {doc.pillars.map((p, i) => <div className="dvs-card" key={i}>
            <Field label="Title" value={p.title} onChange={(v) => set("pillars", doc.pillars.map((x,j) => j === i ? {...x,title:v} : x))}/>
            <Field label="Description" area value={p.description} onChange={(v) => set("pillars", doc.pillars.map((x,j) => j === i ? {...x,description:v} : x))}/>
            <Field label="Specialties" value={p.specialties} onChange={(v) => set("pillars", doc.pillars.map((x,j) => j === i ? {...x,specialties:v} : x))}/>
            <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("pillars", doc.pillars.filter((_,j) => j !== i))}>Remove</Button>
          </div>)}
          <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("pillars", [...doc.pillars,{title:"",description:"",specialties:""}])}>Add pillar</Button>
        </div>

        <div className="dvs-card">
          <h2>About</h2>
          <Field label="About text" value={doc.about} onChange={(v) => set("about", v)} area />
        </div>

        <div className="dvs-card">
          <h2>Selected work</h2>
          {doc.work.map((w, i) => (
            <div className="dvs-card" key={i}>
              <Field
                label="Title"
                value={w.title}
                onChange={(v) =>
                  set("work", doc.work.map((x, j) => (j === i ? { ...x, title: v } : x)))
                }
              />
              <Field
                label="Role"
                value={w.role}
                onChange={(v) => set("work", doc.work.map((x, j) => (j === i ? { ...x, role: v } : x)))}
              />
              <Field
                label="Description"
                area
                value={w.body}
                onChange={(v) => set("work", doc.work.map((x, j) => (j === i ? { ...x, body: v } : x)))}
              />
              <Field
                label="Small note"
                value={w.note}
                onChange={(v) => set("work", doc.work.map((x, j) => (j === i ? { ...x, note: v } : x)))}
              />
              <Field label="Challenge" area value={w.problem ?? ""} onChange={(v) => set("work", doc.work.map((x,j) => j === i ? {...x,problem:v} : x))}/>
              <Field label="Approach / solution" area value={w.solution ?? ""} onChange={(v) => set("work", doc.work.map((x,j) => j === i ? {...x,solution:v} : x))}/>
              <Field label="Case photo URL" value={w.image ?? ""} onChange={(v) => set("work", doc.work.map((x,j) => j === i ? {...x,image:v} : x))}/>
              <ImagePicker onDone={(url) => set("work", doc.work.map((x,j) => j === i ? {...x,image:url} : x))}/>
              <Field label="Live verification link (https://)" value={w.verification_url ?? ""} onChange={(v) => set("work", doc.work.map((x,j) => j === i ? {...x,verification_url:v} : x))}/>
              <button
                className="dvs-btn"
                data-variant="ghost"
                onClick={() => set("work", doc.work.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="dvs-btn"
            data-variant="ghost"
            onClick={() => set("work", [...doc.work, { title: "", role: "", body: "", note: "" }])}
          >
            Add entry
          </button>
        </div>

        <div className="dvs-card">
          <h2>Background</h2>
          {doc.background.map((b, i) => (
            <div className="dvs-card" key={i}>
              <Field
                label="Label"
                value={b.label}
                onChange={(v) =>
                  set("background", doc.background.map((x, j) => (j === i ? { ...x, label: v } : x)))
                }
              />
              <Field
                label="Text"
                area
                value={b.body}
                onChange={(v) =>
                  set("background", doc.background.map((x, j) => (j === i ? { ...x, body: v } : x)))
                }
              />
              <button
                className="dvs-btn"
                data-variant="ghost"
                onClick={() => set("background", doc.background.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="dvs-btn"
            data-variant="ghost"
            onClick={() => set("background", [...doc.background, { label: "", body: "" }])}
          >
            Add item
          </button>
        </div>

        <div className="dvs-card">
          <h2>Field Dispatches</h2>
          {doc.gallery.map((g, i) => (
            <div className="dvs-card" key={i}>
              <p className="dvs-status">Dispatch {String(i + 1).padStart(2, "0")}</p>
              {g.url && <img src={g.url} alt={g.title || "Dispatch preview"} className="dvs-editor-photo" />}
              <Field
                label="Image URL"
                value={g.url}
                onChange={(v) => updateDispatch(i, { url: v })}
              />
              <ImagePicker onDone={(url) => updateDispatch(i, { url })} />
              <Field
                label="Location tag"
                value={g.location}
                onChange={(v) => updateDispatch(i, { location: v })}
              />
              <Field label="Headline" value={g.title} onChange={(v) => updateDispatch(i, { title: v })} />
              <Field label="Field story context" value={g.story} area onChange={(v) => updateDispatch(i, { story: v })} />
              <Field label="Operational takeaway" value={g.takeaway} area onChange={(v) => updateDispatch(i, { takeaway: v })} />
              <div className="dvs-row">
                <Button type="button"
                  className="dvs-btn"
                  data-variant="ghost"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...doc.gallery];
                    const previous = next[i - 1];
                    const current = next[i];
                    if (!previous || !current) return;
                    [next[i - 1], next[i]] = [current, previous];
                    set("gallery", next);
                  }}
                >
                  Move up
                </Button>
                <Button type="button"
                  className="dvs-btn"
                  data-variant="ghost"
                  disabled={i === doc.gallery.length - 1}
                  onClick={() => {
                    const next = [...doc.gallery];
                    const current = next[i];
                    const following = next[i + 1];
                    if (!current || !following) return;
                    [next[i], next[i + 1]] = [following, current];
                    set("gallery", next);
                  }}
                >Move down</Button>
                <Button type="button"
                  className="dvs-btn"
                  data-variant="ghost"
                  onClick={() => set("gallery", doc.gallery.filter((_, j) => j !== i))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("gallery", [...doc.gallery, { url: "", location: "", title: "", story: "", takeaway: "" }])}>Add dispatch</Button>
        </div>

        <div className="dvs-card">
          <h2>Consultation & contact</h2>
          <Field label="Call to action heading" value={doc.consultation_heading} onChange={(v) => set("consultation_heading", v)} />
          <Field label="Introduction" area value={doc.consultation_note} onChange={(v) => set("consultation_note", v)} />
          {doc.consultation_options.map((option, i) => <div className="dvs-row" key={i}>
            <div style={{flex:1}}><Field label={`Requirement ${i+1}`} value={option} onChange={(v) => set("consultation_options", doc.consultation_options.map((x,j) => j === i ? v : x))}/></div>
            <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("consultation_options", doc.consultation_options.filter((_,j) => j !== i))}>Remove</Button>
          </div>)}
          <Button type="button" className="dvs-btn" data-variant="ghost" onClick={() => set("consultation_options", [...doc.consultation_options, ""])}>Add requirement</Button>
          <Field label="Phone" value={doc.contact_phone} onChange={(v) => set("contact_phone", v)} />
          <Field label="Email" value={doc.contact_email} onChange={(v) => set("contact_email", v)} />
          <Field label="Note" area value={doc.contact_note} onChange={(v) => set("contact_note", v)} />
        </div>

        <div className="dvs-row">
          <button className="dvs-btn" data-variant="ghost" disabled={busy} onClick={onSave}>
            Save draft
          </button>
          <button className="dvs-btn" data-variant="accent" disabled={busy} onClick={onPublish}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
