import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getDavisPage } from "@/lib/davis.functions";
import "@/styles/davis.css";

export const Route = createFileRoute("/davis/")({
  loader: () => getDavisPage({ data: { draft: true } }),
  head: () => ({
    meta: [
      { title: "Davis Waithaka — Food Science, Cold Chain and Connectivity" },
      {
        name: "description",
        content:
          "Personal page of Davis Waithaka: cold-chain and produce aggregation in the Nanyuki–Laikipia–Narumoru corridor, plus technical operations and rural connectivity work.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:title", content: "Davis Waithaka — Food Science, Cold Chain and Connectivity" },
      {
        property: "og:description",
        content:
          "Cold-chain and produce aggregation on the ground, and technical operations and connectivity across food safety, value addition and ISP work.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500&display=swap",
      },
    ],
  }),
  errorComponent: () => (
    <div className="dvs">
      <div className="dvs-wrap dvs-section">
        <h1>This page didn't load</h1>
        <p>Please refresh in a moment.</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="dvs">
      <div className="dvs-wrap dvs-section">
        <h1>Not found</h1>
      </div>
    </div>
  ),
  component: DavisPage,
});

function DavisPage() {
  const { doc, isDraft } = Route.useLoaderData();
  const [active, setActive] = useState(0);

  if (!doc) {
    return (
      <div className="dvs">
        <div className="dvs-wrap dvs-section">
          <h1>Coming soon</h1>
        </div>
      </div>
    );
  }

  const gallery = doc.gallery ?? [];
  const shown = gallery[Math.min(active, Math.max(gallery.length - 1, 0))];

  return (
    <div className="dvs">
      {isDraft && (
        <div className="dvs-wrap" style={{ paddingTop: "0.75rem" }}>
          <p className="dvs-status">Draft preview — visible only to you.</p>
        </div>
      )}

      <header className="dvs-hero">
        <div className="dvs-wrap dvs-hero-grid">
          <div className="dvs-rise">
            <h1>{doc.hero_name}</h1>
            <p className="dvs-measure">{doc.hero_line}</p>
          </div>
          {doc.hero_image && (
            <div className="dvs-rise dvs-rise-2">
              <img src={doc.hero_image} alt={`${doc.hero_name} at work`} />
            </div>
          )}
        </div>
      </header>

      {doc.about && (
        <section className="dvs-section">
          <div className="dvs-wrap">
            <p className="dvs-kicker">About</p>
            <div className="dvs-measure">
              {doc.about.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {doc.work.length > 0 && (
        <section className="dvs-section">
          <div className="dvs-wrap">
            <p className="dvs-kicker">Selected work</p>
            {doc.work.map((w, i) => (
              <article className="dvs-entry" key={i}>
                {w.role && <p className="dvs-role">{w.role}</p>}
                <h2>{w.title}</h2>
                <p className="dvs-measure">{w.body}</p>
                {w.note && <p className="dvs-note">{w.note}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {doc.background.length > 0 && (
        <section className="dvs-section">
          <div className="dvs-wrap">
            <p className="dvs-kicker">Background</p>
            <div className="dvs-bg-list">
              {doc.background.map((b, i) => (
                <div key={i}>
                  <h3>{b.label}</h3>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && shown && (
        <section className="dvs-section">
          <div className="dvs-wrap">
            <p className="dvs-kicker">Gallery</p>
            <div className="dvs-gallery-main">
              <img src={shown.url} alt={shown.caption || "Gallery photograph"} />
            </div>
            {shown.caption && <p className="dvs-caption">{shown.caption}</p>}
            {gallery.length > 1 && (
              <div className="dvs-thumbs">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    data-active={i === active}
                    aria-label={g.caption || `Photo ${i + 1}`}
                    onClick={() => setActive(i)}
                  >
                    <img src={g.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="dvs-section">
        <div className="dvs-wrap">
          <p className="dvs-kicker">Contact</p>
          <dl className="dvs-contact dvs-measure">
            {doc.contact_phone && (
              <>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${doc.contact_phone.replace(/\s/g, "")}`}>{doc.contact_phone}</a>
                </dd>
              </>
            )}
            {doc.contact_email && (
              <>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${doc.contact_email}`}>{doc.contact_email}</a>
                </dd>
              </>
            )}
          </dl>
          {doc.contact_note && <p className="dvs-note dvs-measure">{doc.contact_note}</p>}
        </div>
      </section>

      <footer className="dvs-foot">
        <div className="dvs-wrap">
          <p>
            © {new Date().getFullYear()} {doc.hero_name}. Personal page.
          </p>
        </div>
      </footer>
    </div>
  );
}
