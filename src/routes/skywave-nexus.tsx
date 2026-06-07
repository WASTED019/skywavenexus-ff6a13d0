import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useShowcaseItems } from "@/lib/cms";

export const Route = createFileRoute("/skywave-nexus")({
  head: () => ({
    meta: [
      { title: "Selected Work & Outcomes — SKYWAVE NEXUS" },
      { name: "description", content: "A showcase of selected work and outcomes by SKYWAVE NEXUS Integrated Solutions across food safety, value addition and connectivity." },
      { property: "og:title", content: "Selected Work & Outcomes — SKYWAVE NEXUS" },
      { property: "og:description", content: "A showcase of selected work and outcomes by SKYWAVE NEXUS across food safety, value addition and connectivity." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/skywave-nexus" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/skywave-nexus" },
    ],
  }),
  component: ShowcasePage,
});

function ShowcasePage() {
  const items = useShowcaseItems();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">SKYWAVE NEXUS — Selected Work and Outcomes</h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Selected work, examples and outcomes from across our service lines. Client identities are kept private.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No showcase items yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <article key={s.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="aspect-video w-full rounded-xl object-cover" />
                ) : (
                  <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-brand-blue/15 to-brand-bright/25" />
                )}
                <div className="mt-4 inline-block w-max rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {s.division_name}
                </div>
                <h2 className="mt-2 text-lg font-bold text-brand-navy">{s.title}</h2>
                {s.location && <p className="mt-1 text-xs text-muted-foreground">{s.location}</p>}
                {s.description && <p className="mt-3 text-sm">{s.description}</p>}
                {s.outcome && <p className="mt-3 text-sm"><strong className="text-brand-blue">Outcome:</strong> {s.outcome}</p>}
                <Link
                  to="/request"
                  search={{ division: s.division_id, service: undefined }}
                  className="mt-5 inline-flex justify-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
                >
                  Request Similar Service
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
