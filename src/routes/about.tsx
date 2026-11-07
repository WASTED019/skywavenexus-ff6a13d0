import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { divisions } from "@/data/divisions";
import { company } from "@/lib/company-profile";
import { whatsappLink } from "@/lib/whatsapp";
import { Download, MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";

const desc = "Learn about SKYWAVE NEXUS Integrated Solutions, our three service lines, and our operating coverage across Nyeri County, Laikipia County and remote engagements.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SKYWAVE NEXUS" },
      { name: "description", content: desc },
      { property: "og:title", content: "About — SKYWAVE NEXUS" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skywavenexus.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skywavenexus.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-hero-gradient text-white">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <p className="text-sm font-semibold uppercase text-white/80">{company.positioning}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">About {company.name}</h1>
            <p className="mt-3 max-w-3xl text-white/85">{company.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary"><Link to="/about/profile"><Download className="size-4" /> Download Company Profile</Link></Button>
              <Button asChild variant="outline" className="bg-transparent text-white"><Link to="/request">Request a service</Link></Button>
              <Button asChild variant="outline" className="bg-transparent text-white"><Link to="/projects">Projects</Link></Button>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
          <div><h2 className="text-sm font-semibold uppercase text-primary">Our vision</h2><p className="mt-2 text-sm text-muted-foreground">{company.vision}</p></div>
          <div><h2 className="text-sm font-semibold uppercase text-primary">Our mission</h2><p className="mt-2 text-sm text-muted-foreground">{company.mission}</p></div>
          <div><h2 className="text-sm font-semibold uppercase text-primary">Our purpose</h2><p className="mt-2 text-sm text-muted-foreground">{company.purpose}</p></div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold">How we work</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((v) => (
              <div key={v.title} className="rounded-lg border bg-card p-5">
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-2xl font-bold">Service Lines</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {divisions.map((d) => (
                <Link key={d.id} to="/divisions/$divisionId" params={{ divisionId: d.id }} className="group rounded-lg border bg-card p-5 hover:border-primary">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.short}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">Explore <ArrowRight className="size-4" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold">Delivery model</h2>
          <p className="mt-2 text-muted-foreground">{company.location}.</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {company.delivery.map((s, i) => (
              <li key={s.step} className="rounded-lg border bg-card p-4">
                <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold">{s.step}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h2 className="text-2xl font-bold">Explore SKYWAVE NEXUS</h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-primary">
              <Link to="/projects" className="inline-flex items-center gap-1">Projects &amp; Technical Portfolio <ArrowRight className="size-4" /></Link>
              <Link to="/careers" className="inline-flex items-center gap-1">Careers <ArrowRight className="size-4" /></Link>
              <Link to="/privacy" className="inline-flex items-center gap-1">Privacy Policy <ArrowRight className="size-4" /></Link>
              <Link to="/blog" className="inline-flex items-center gap-1">Knowledge &amp; Insights <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </section>

        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-2xl font-bold">Engage with us</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><a href={whatsappLink()} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>
              <Button asChild variant="outline"><a href={`tel:${company.phone}`}><Phone className="size-4" /> {company.phone}</a></Button>
              <Button asChild variant="outline"><a href={`mailto:${company.email}`}><Mail className="size-4" /> {company.email}</a></Button>
              <Button asChild variant="outline"><Link to="/about/profile"><Download className="size-4" /> Company Profile</Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
