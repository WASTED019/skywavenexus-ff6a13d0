import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { blogPosts } from "@/data/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Updates — SKYWAVE NEXUS" },
      { name: "description", content: "Tips and updates on food safety, value addition, networking and business compliance from SKYWAVE NEXUS." },
      { property: "og:title", content: "Blog & Updates — SKYWAVE NEXUS" },
      { property: "og:description", content: "Tips and updates on food safety, value addition, networking and business compliance from SKYWAVE NEXUS." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/blog" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/blog" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "SKYWAVE NEXUS — Blog & Updates",
        url: "https://skywavenexus.lovable.app/blog",
      }),
    }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Blog / Updates</h1>
          <p className="mt-3 max-w-2xl text-white/85">Practical tips and company updates.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-brand-blue/15 to-brand-bright/25" />
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-blue">{p.category}</div>
              <h2 className="mt-2 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</p>
              <p className="mt-3 text-sm">{p.summary}</p>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-semibold text-brand-blue">Read more</summary>
                <p className="mt-2 text-muted-foreground">{p.body}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
