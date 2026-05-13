import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { divisions } from "@/data/divisions";
import { showcase } from "@/data/showcase";
import { blogPosts } from "@/data/blog";
import { whatsappLink } from "@/lib/whatsapp";
import logo from "@/assets/logo.png";
import { Shield, Sprout, Wifi, ArrowRight, MessageCircle, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SKYWAVE NEXUS — Food Safety & Digital Connectivity" },
      { name: "description", content: "Food safety, value addition and digital connectivity solutions for SMEs, farmers and rural enterprises in Kenya." },
      { property: "og:title", content: "SKYWAVE NEXUS — Food Safety & Digital Connectivity" },
      { property: "og:description", content: "Food safety, value addition and digital connectivity solutions for SMEs, farmers and rural enterprises in Kenya." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/" },
    ],
  }),
  component: HomePage,
});

const iconFor = (id: string) =>
  id === "food-safety" ? Shield : id === "value-addition" ? Sprout : Wifi;

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-hero-gradient relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <img src={logo} alt="SKYWAVE NEXUS Integrated Solutions" className="mb-6 h-24 w-24 rounded-xl bg-white/95 p-2 shadow-elegant" />
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              SKYWAVE NEXUS — Integrated Solutions for <span className="text-brand-bright bg-white/10 px-2 rounded">Food Safety & Digital Connectivity</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-white/90">
              Integrated Solutions for Food Safety, Value Addition and Digital Connectivity.
            </p>
            <p className="mt-3 max-w-xl text-white/85">
              Practical support in food safety, value addition, and digital connectivity for small businesses,
              farmers, processors, institutions, cyber cafés, and rural enterprises.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/request" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-soft hover:bg-white/90">
                Request a Service
              </Link>
              <Link to="/divisions" className="rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                View Divisions
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy hover:opacity-95">
                <MessageCircle className="size-4" /> Contact on WhatsApp
              </a>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-10 rounded-full bg-white/10 blur-3xl" />
            <img src={logo} alt="" className="relative mx-auto h-80 w-80 rounded-2xl bg-white p-6 shadow-elegant" />
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Our Divisions</p>
          <h2 className="mt-2 text-3xl font-bold">Three divisions, one trusted partner.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {divisions.map((d) => {
            const Icon = iconFor(d.id);
            return (
              <div key={d.id} className="bg-card-gradient group rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="inline-flex rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-brand-navy">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d.short}</p>
                <Link to="/divisions/$divisionId" params={{ divisionId: d.id }} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline">
                  View Services <ArrowRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold">Why Choose Us</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Practical field-based support",
              "Food safety and technical knowledge",
              "Rural and SME-friendly solutions",
              "Clear service request and follow-up process",
              "Support for farmers, processors, schools, cyber cafés, and small businesses",
              "Trusted by Kenyan SMEs and institutions",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-xl border bg-card p-5 shadow-soft">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-green" />
                <span className="text-sm font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">SKYWAVE NEXUS</p>
            <h2 className="mt-2 text-3xl font-bold">Selected work</h2>
          </div>
          <Link to="/skywave-nexus" className="text-sm font-semibold text-brand-blue hover:underline">View all →</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {showcase.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="mb-3 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                {s.divisionName}
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.location}</p>
              <p className="mt-3 text-sm">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold">Latest Updates</h2>
            <Link to="/blog" className="text-sm font-semibold text-brand-blue hover:underline">All posts →</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((p) => (
              <article key={p.id} className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue">{p.category}</div>
                <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact preview */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="bg-hero-gradient grid gap-8 rounded-3xl p-10 text-white md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Let's solve it together.</h2>
            <p className="mt-3 text-white/85">Reach us directly — we follow up on every request.</p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="size-4" /> 0753366995</div>
              <div className="flex items-center gap-2"><Mail className="size-4" /> skywavenexus@gmail.com</div>
              <div className="flex items-center gap-2"><MapPin className="size-4" /> Nyange, Nyeri, Kenya</div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 md:items-end">
            <Link to="/request" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-navy">Request a Service</Link>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="rounded-md bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Chat on WhatsApp</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
