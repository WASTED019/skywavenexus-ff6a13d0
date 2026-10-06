import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Mail, MessageCircle, Phone } from "lucide-react";
import { getDavisPage } from "@/lib/davis.functions";
import "@/styles/davis.css";

export const Route = createFileRoute("/davis/")({
  loader: () => getDavisPage({ data: { draft: true } }),
  head: () => ({
    meta: [
      { title: "Davis Waithaka — Cold Chain, Infrastructure & Traceability" },
      { name: "description", content: "Davis Waithaka works across cold-chain systems, field infrastructure and traceability software in Kenya." },
      { property: "og:type", content: "profile" },
      { property: "og:title", content: "Davis Waithaka — Cold Chain, Infrastructure & Traceability" },
      { property: "og:description", content: "Field-led cold chain, connectivity and traceability systems across the Nanyuki–Laikipia–Narumoru corridor." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  errorComponent: () => <div className="dvs"><div className="dvs-wrap dvs-section"><h1>This page didn't load</h1><p>Please refresh in a moment.</p></div></div>,
  notFoundComponent: () => <div className="dvs"><div className="dvs-wrap dvs-section"><h1>Not found</h1></div></div>,
  component: DavisPage,
});

function DavisPage() {
  const { doc, isDraft } = Route.useLoaderData();
  const [requirement, setRequirement] = useState("");
  if (!doc) return <div className="dvs"><div className="dvs-wrap dvs-section"><h1>Coming soon</h1></div></div>;

  const gallery = doc.gallery ?? [];
  const phone = doc.contact_phone.replace(/[^\d]/g, "");
  const message = `Hello Davis, I'd like to discuss ${requirement || "a consultation"}.`;
  const whatsapp = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : "";
  const email = doc.contact_email ? `mailto:${doc.contact_email}?subject=${encodeURIComponent(`Consultation: ${requirement || "New enquiry"}`)}&body=${encodeURIComponent(message)}` : "";
  const cases = [...(doc.work ?? [])].sort((a, b) => {
    const priority = (title: string) => title.toLowerCase().includes("ustawi") ? 0 : title.toLowerCase().includes("operationsmanagement") ? 1 : title.toLowerCase().includes("skywave") ? 2 : 3;
    return priority(a.title) - priority(b.title);
  });

  return <div className="dvs">
    {isDraft && <div className="dvs-wrap dvs-draft"><p className="dvs-status">Draft preview — visible only to you.</p></div>}
    <header className="dvs-topbar dvs-wrap"><a href="#top" className="dvs-mark">DW<span>.</span></a><span>INDEPENDENT PRACTICE / KENYA</span><span style={{display:"inline-flex",gap:20}}><a href="/davis/profile" className="dvs-top-link">EXECUTIVE PROFILE <Download size={14}/></a><a href="#consultation" className="dvs-top-link">LET'S TALK <ArrowUpRight size={15}/></a></span></header>
    <section className="dvs-hero" id="top">
      <div className="dvs-wrap dvs-hero-layout">
        <div className="dvs-hero-copy dvs-rise">
          <div className="dvs-eyebrow"><span className="dvs-line"/> FOOD SYSTEMS × TECHNOLOGY × OPERATIONS</div>
          <h1>{doc.hero_name}</h1>
          <p className="dvs-authority">{doc.authority}</p>
          <p className="dvs-hero-intro">{doc.hero_line}</p>
          <div className="dvs-hero-actions"><a className="dvs-primary-action" href="#consultation">Work with me <ArrowUpRight size={18}/></a><a className="dvs-download" href="/davis/profile">Download Executive Profile <Download size={16}/></a><a className="dvs-text-action" href="#work">Explore selected work <ArrowDownRight size={18}/></a></div>
        </div>
        {doc.hero_image && <div className="dvs-portrait dvs-rise dvs-rise-2"><img src={doc.hero_image} alt={`${doc.hero_name} portrait`} /><span className="dvs-photo-label">FIELD / SYSTEMS / IMPACT</span></div>}
      </div>
    </section>

    <section className="dvs-impact dvs-wrap" aria-label="Impact and scope">
      {doc.metrics.filter((m) => m.label.trim()).map((m, i) => <div className="dvs-metric" key={i}><strong>{m.value.trim() || "—"}</strong><span>{m.label}</span></div>)}
    </section>

    <section className="dvs-section dvs-capabilities" id="capabilities"><div className="dvs-wrap">
      <div className="dvs-section-heading"><div><p className="dvs-kicker">01 / EXPERTISE</p><h2>Three disciplines.<br/>One operating lens.</h2></div><p>From production floor to network edge to the systems that connect them.</p></div>
      <div className="dvs-pillar-grid">{doc.pillars.map((p, i) => <article className="dvs-pillar" key={i}><span className="dvs-index">0{i + 1} / 0{doc.pillars.length}</span><h3>{p.title}</h3><p>{p.description}</p><div className="dvs-specialties">{p.specialties}</div></article>)}</div>
    </div></section>

    {cases.length > 0 && <section className="dvs-work" id="work"><div className="dvs-wrap">
      <div className="dvs-section-heading"><div><p className="dvs-kicker">02 / SELECTED WORK</p><h2>Problems met on the ground.</h2></div><p>Selected engagements across food systems, digital operations and connectivity.</p></div>
      <div className="dvs-case-grid">{cases.map((w, i) => <article className={`dvs-case ${i === 0 ? "dvs-case-feature" : ""}`} key={i}>
        {w.image && <div className="dvs-case-image"><img src={w.image} alt={`${w.title} project`} /></div>}
        <div className="dvs-case-content"><div className="dvs-case-top"><span>{String(i + 1).padStart(2, "0")} / {w.role || "CASE STUDY"}</span><ArrowUpRight size={20}/></div><h3>{w.title}</h3><p className="dvs-case-body">{w.body}</p>
          {(w.problem || w.solution) && <div className="dvs-problem-solution">{w.problem && <div><span>THE CHALLENGE</span><p>{w.problem}</p></div>}{w.solution && <div><span>THE APPROACH</span><p>{w.solution}</p></div>}</div>}
          {w.verification_url && /^https:\/\//i.test(w.verification_url) && <a href={w.verification_url} target="_blank" rel="noopener noreferrer" className="dvs-verify">Live verification <ArrowUpRight size={16}/></a>}
          {w.note && <p className="dvs-case-note">{w.note}</p>}</div>
      </article>)}</div>
    </div></section>}

    {doc.about && <section className="dvs-section dvs-about"><div className="dvs-wrap dvs-about-grid"><div><p className="dvs-kicker">03 / PERSPECTIVE</p><h2>Built for the realities of the field.</h2></div><div className="dvs-about-copy">{doc.about.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div></div></section>}

    {doc.background.length > 0 && <section className="dvs-section dvs-background"><div className="dvs-wrap"><p className="dvs-kicker">FOUNDATIONS</p><div className="dvs-bg-grid">{doc.background.map((b, i) => <div key={i}><span className="dvs-index">0{i + 1}</span><h3>{b.label}</h3><p>{b.body}</p></div>)}</div></div></section>}

    {gallery.some((g) => g.url) && <section className="dvs-section dvs-gallery" id="dispatches"><div className="dvs-wrap">
      <div className="dvs-section-heading"><div><p className="dvs-kicker">FIELD DISPATCHES / ON THE GROUND</p><h2>From the field.</h2></div><p>Observations from the systems, sites and people behind the work.</p></div>
      <div className="dvs-dispatch-list">{gallery.filter((g) => g.url).map((g, i) => <article className="dvs-dispatch" key={i}>
        <div className="dvs-dispatch-photo"><img src={g.url} alt={g.title || g.location || `Field dispatch ${i + 1}`} loading="lazy" /></div>
        <div className="dvs-dispatch-copy"><div className="dvs-dispatch-meta"><span>FIELD DISPATCH / {String(i + 1).padStart(2, "0")}</span>{g.location && <span>{g.location}</span>}</div>
          <h3>{g.title || `Field dispatch ${String(i + 1).padStart(2, "0")}`}</h3>
          {g.story && <p className="dvs-dispatch-story">{g.story}</p>}
          {g.takeaway && <div className="dvs-dispatch-takeaway"><span>OPERATIONAL TAKEAWAY</span><p>{g.takeaway}</p></div>}
        </div>
      </article>)}</div>
    </div></section>}

    <section className="dvs-consultation" id="consultation"><div className="dvs-wrap dvs-consult-grid"><div><p className="dvs-kicker">04 / WORK WITH ME</p><h2>{doc.consultation_heading}</h2><p>{doc.consultation_note}</p></div><div className="dvs-consult-form"><label htmlFor="dvs-requirement">WHAT DO YOU NEED HELP WITH?</label><select id="dvs-requirement" value={requirement} onChange={(e) => setRequirement(e.target.value)}><option value="">Select a requirement</option>{doc.consultation_options.filter(Boolean).map((option, i) => <option key={i} value={option}>{option}</option>)}</select><div className="dvs-contact-actions">{whatsapp && <a className="dvs-primary-action" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> WhatsApp <ArrowUpRight size={18}/></a>}{email && <a className="dvs-outline-action" href={email}><Mail size={18}/> Email me <ArrowUpRight size={18}/></a>}</div>{doc.contact_phone && <a className="dvs-phone" href={`tel:${phone}`}><Phone size={15}/> {doc.contact_phone}</a>}{doc.contact_note && <p className="dvs-contact-note">{doc.contact_note}</p>}</div></div></section>
    <footer className="dvs-foot"><div className="dvs-wrap"><span>{doc.hero_name}</span><span>© {new Date().getFullYear()} / PERSONAL PORTFOLIO</span><a href="#top">BACK TO TOP ↑</a></div></footer>
  </div>;
}
