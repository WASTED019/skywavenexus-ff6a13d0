import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { findDivision, type Service as _S } from "@/data/divisions";
import { useServiceLine } from "@/lib/cms";
import { toLineView } from "@/lib/service-lines";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/divisions/$divisionId")({
  loader: ({ params }) => {
    if (!/^[a-z0-9-]{1,80}$/.test(params.divisionId)) throw notFound();
    // Built-in lines give instant SEO text; lines added in admin load in the page.
    const fb = findDivision(params.divisionId);
    return { id: params.divisionId, division: fb ? { title: fb.title, description: fb.description } : null };
  },
  head: ({ loaderData, params }) => {
    const title = `${loaderData?.division?.title ?? "Division"} — SKYWAVE NEXUS`;
    const desc = loaderData?.division?.description ?? "Service line at SKYWAVE NEXUS Integrated Solutions.";
    const url = `https://skywavenexus.lovable.app/divisions/${params.divisionId}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: loaderData?.division?.title,
          description: desc,
          provider: { "@type": "Organization", name: "SKYWAVE NEXUS Integrated Solutions" },
          url,
        }),
      }],
    };
  },
  component: DivisionPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Service line not found</h1>
        <Link to="/divisions" className="mt-4 inline-block text-brand-blue hover:underline">Back to Service Lines</Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">{error instanceof Error ? error.message : "This service line didn't load."}</div>
  ),
});

function DivisionPage() {
  const { id } = Route.useLoaderData();
  const { row: cms, loaded } = useServiceLine(id);
  const hidden = loaded && cms?.is_active === false;
  const view = hidden ? null : toLineView(cms, id);

  if (!view) {
    if (!loaded) return <div className="flex min-h-screen flex-col"><Header /><div className="flex-1" /><Footer /></div>;
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Service line not available</h1>
          <Link to="/divisions" className="mt-4 inline-block text-brand-blue hover:underline">Back to Service Lines</Link>
        </div>
        <Footer />
      </div>
    );
  }
  const { title, description, services } = view;
  const division = { id };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Link to="/divisions" className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="size-4" /> Back to Service Lines
          </Link>
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-white/85">{description}</p>
          {view.image && <img src={view.image} alt={title} className="mt-6 h-48 w-full max-w-3xl rounded-2xl object-cover" />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Services</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-elegant">
              <h3 className="text-lg font-bold text-brand-navy">{s.name}</h3>
              <p className="mt-2 text-sm">{s.explanation}</p>
              <dl className="mt-4 space-y-2 text-xs">
                <div><dt className="font-semibold text-brand-blue">For</dt><dd className="text-muted-foreground">{s.audience || "—"}</dd></div>
                <div><dt className="font-semibold text-brand-blue">Outcome</dt><dd className="text-muted-foreground">{s.outcome || "—"}</dd></div>
              </dl>
              <Link
                to="/request"
                search={{ division: division.id, service: s.id }}
                className="mt-5 inline-flex justify-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Request Quotation
              </Link>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
