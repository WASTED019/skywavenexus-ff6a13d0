import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { divisions } from "@/data/divisions";
import { Shield, Sprout, Wifi, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/divisions/")({
  head: () => ({
    meta: [
      { title: "Our Service Lines — SKYWAVE NEXUS" },
      { name: "description", content: "Food Safety & Compliance, Value Addition, and ISP & Connectivity service lines of SKYWAVE NEXUS Integrated Solutions." },
      { property: "og:title", content: "Our Service Lines — SKYWAVE NEXUS" },
      { property: "og:description", content: "Food Safety & Compliance, Value Addition, and ISP & Connectivity service lines of SKYWAVE NEXUS." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/divisions" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/divisions" },
    ],
  }),
  component: DivisionsIndex,
});

const iconFor = (id: string) =>
  id === "food-safety" ? Shield : id === "value-addition" ? Sprout : Wifi;

function DivisionsIndex() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Our Service Lines</h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Choose a service line to explore the services we offer and request a quotation.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {divisions.map((d) => {
            const Icon = iconFor(d.id);
            return (
              <Link
                key={d.id}
                to="/divisions/$divisionId"
                params={{ divisionId: d.id }}
                className="bg-card-gradient group rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="inline-flex rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-brand-navy">{d.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                  View Services <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}
