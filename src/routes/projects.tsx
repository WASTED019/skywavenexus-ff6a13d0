import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useShowcaseItems, usePreviewMode } from "@/lib/cms";

const desc = "Selected projects by SKYWAVE NEXUS: food safety systems, value addition support and rural ISP and connectivity work across Kenya.";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — SKYWAVE NEXUS" },
      { name: "description", content: desc },
      { property: "og:title", content: "Projects — SKYWAVE NEXUS" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skywavenexus.lovable.app/projects" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skywavenexus.lovable.app/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const preview = usePreviewMode();
  const items = useShowcaseItems(preview);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {preview && (
        <div className="bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-black">
          Preview mode — drafts are visible to you only.
        </div>
      )}
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Projects</h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Selected work from our field engagements across food safety, value addition and connectivity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Projects are being prepared and will appear here shortly.
          </p>
        ) : (
          <div className="space-y-8">
            {items.map((item, i) => (
              <article
                key={item.id}
                className={`grid overflow-hidden rounded-2xl border bg-card shadow-soft md:grid-cols-2 ${i % 2 === 1 ? "md:[&>figure]:order-2" : ""}`}
              >
                <figure className="min-h-56 bg-gradient-to-br from-brand-blue/10 to-brand-bright/20">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-56 items-center justify-center p-8 text-4xl opacity-30">🏗️</div>
                  )}
                </figure>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand-blue/10 px-3 py-1 font-semibold text-brand-blue">{item.division_name}</span>
                    {item.location && <span className="text-muted-foreground">{item.location}</span>}
                  </div>
                  <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
                  {item.description && <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>}
                  {item.outcome && (
                    <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm">
                      <span className="font-semibold">Outcome: </span>
                      {item.outcome}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Have similar work you need support with?</p>
          <a href="/request" className="mt-3 inline-flex rounded-md bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95">
            Request a service
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
