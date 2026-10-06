import { createFileRoute } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { getDavisPage } from "@/lib/davis.functions";
import "@/styles/davis.css";

export const Route = createFileRoute("/davis/profile")({
  loader: () => getDavisPage({ data: { draft: false } }),
  head: () => ({
    meta: [
      { title: "Davis Waithaka — Executive Profile" },
      { name: "description", content: "One-page executive summary: disciplines, impact, selected work and contact details for Davis Waithaka." },
      { property: "og:type", content: "profile" },
      { property: "og:title", content: "Davis Waithaka — Executive Profile" },
      { property: "og:description", content: "One-page executive summary of Davis Waithaka's cold chain, infrastructure and traceability work." },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  errorComponent: () => <div className="dvs-sheet-page"><p>This profile didn't load. Please refresh.</p></div>,
  notFoundComponent: () => <div className="dvs-sheet-page"><p>Not found.</p></div>,
  component: ExecutiveProfile,
});

function ExecutiveProfile() {
  const { doc } = Route.useLoaderData();
  if (!doc) return <div className="dvs-sheet-page"><p>Profile coming soon.</p></div>;
  const metrics = doc.metrics.filter((m) => m.label.trim() && m.value.trim());
  const work = (doc.work ?? []).filter((w) => w.title.trim()).slice(0, 4);

  return (
    <div className="dvs-sheet-page">
      <div className="dvs-sheet-tools">
        <a href="/davis"><ArrowLeft size={15} /> Back to portfolio</a>
        <button type="button" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button>
      </div>
      <article className="dvs-sheet">
        <header className="dvs-sheet-head">
          <div>
            <p className="dvs-sheet-kicker">Executive Profile</p>
            <h1>{doc.hero_name}</h1>
            <p className="dvs-sheet-authority">{doc.authority}</p>
          </div>
          <div className="dvs-sheet-contact">
            {doc.contact_phone && <div>{doc.contact_phone}</div>}
            {doc.contact_email && <div>{doc.contact_email}</div>}
            <div>Kenya</div>
          </div>
        </header>

        {(doc.hero_line || doc.about) && (
          <section><h2>Summary</h2><p>{doc.hero_line}</p>{doc.about && doc.about.split("\n").filter(Boolean).slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}</section>
        )}

        {metrics.length > 0 && (
          <section><h2>Key metrics</h2><div className="dvs-sheet-metrics">{metrics.map((m, i) => <div key={i}><strong>{m.value}</strong><span>{m.label}</span></div>)}</div></section>
        )}

        {doc.pillars.length > 0 && (
          <section><h2>Disciplines</h2><div className="dvs-sheet-cols">{doc.pillars.map((p, i) => <div key={i}><h3>{p.title}</h3><p>{p.description}</p>{p.specialties && <p className="dvs-sheet-muted">{p.specialties}</p>}</div>)}</div></section>
        )}

        {work.length > 0 && (
          <section><h2>Selected work</h2>{work.map((w, i) => <div className="dvs-sheet-work" key={i}><h3>{w.title}{w.role && <span> — {w.role}</span>}</h3><p>{w.body || w.solution}</p></div>)}</section>
        )}

        {doc.background.length > 0 && (
          <section><h2>Background</h2><ul>{doc.background.map((b, i) => <li key={i}><strong>{b.label}</strong>{b.body && ` — ${b.body}`}</li>)}</ul></section>
        )}

        <footer className="dvs-sheet-foot">{doc.hero_name} · Executive Profile · {new Date().getFullYear()}</footer>
      </article>
    </div>
  );
}
