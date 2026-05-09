import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { findDivision, type Service } from "@/data/divisions";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/divisions/$divisionId")({
  loader: ({ params }) => {
    const division = findDivision(params.divisionId);
    if (!division) throw notFound();
    return { division };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.division.title ?? "Division"} — SKYWAVE NEXUS` },
      { name: "description", content: loaderData?.division.description ?? "" },
    ],
  }),
  component: DivisionPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Division not found</h1>
        <Link to="/divisions" className="mt-4 inline-block text-brand-blue hover:underline">Back to Divisions</Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">{error.message}</div>
  ),
});

function DivisionPage() {
  const { division } = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Link to="/divisions" className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="size-4" /> Back to Divisions
          </Link>
          <h1 className="text-3xl font-bold sm:text-4xl">{division.title}</h1>
          <p className="mt-3 max-w-3xl text-white/85">{division.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Services</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {division.services.map((s) => (
            <article key={s.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-elegant">
              <h3 className="text-lg font-bold text-brand-navy">{s.name}</h3>
              <p className="mt-2 text-sm">{s.explanation}</p>
              <dl className="mt-4 space-y-2 text-xs">
                <div><dt className="font-semibold text-brand-blue">For</dt><dd className="text-muted-foreground">{s.audience}</dd></div>
                <div><dt className="font-semibold text-brand-blue">Outcome</dt><dd className="text-muted-foreground">{s.outcome}</dd></div>
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
