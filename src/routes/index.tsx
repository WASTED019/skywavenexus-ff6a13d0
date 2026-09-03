import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { divisions } from "@/data/divisions";
import { whatsappLink } from "@/lib/whatsapp";
import { useHomepageContent, useHomepageSlides, useMediaSlides, useServiceLines, useSiteSettings, useShowcaseItems, useBlogPosts } from "@/lib/cms";
import logo from "@/assets/logo.png";
import { Shield, Sprout, Wifi, ArrowRight, MessageCircle, CheckCircle2, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

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
  const hc = useHomepageContent();
  const sls = useServiceLines();
  const settings = useSiteSettings();
  const slides = useHomepageSlides();
  const mediaSlides = useMediaSlides();
  // Explicit slides win; otherwise every picture in the media library is used.
  const heroSlides = slides.length > 0 ? slides : mediaSlides;
  const showcase = useShowcaseItems();
  const blogPosts = useBlogPosts();

  const heroTitle = hc?.hero_title || "SKYWAVE NEXUS — Integrated Solutions for Food Safety & Digital Connectivity";
  const heroSubtitle = hc?.hero_subtitle || "Integrated Solutions for Food Safety, Value Addition and Digital Connectivity.";
  const heroBody = hc?.hero_body || "Practical support in food safety, value addition, and digital connectivity for small businesses, farmers, processors, institutions, cyber cafés, and rural enterprises.";
  const primaryBtn = hc?.button_text || "Request a Service";
  const primaryBtnLink = hc?.button_link || "/request";

  const serviceCards = sls.length > 0
    ? sls.map(s => ({ id: s.slug, title: s.title, short: s.short_desc || "", link: s.button_link || `/divisions/${s.slug}`, image: s.image_url }))
    : divisions.map(d => ({ id: d.id, title: d.title, short: d.short, link: `/divisions/${d.id}`, image: null as string | null }));

  const intervalMs = Number((hc?.sections as any)?.slide_interval_ms) || 6000;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero with slideshow background */}
      <section className="bg-hero-gradient relative overflow-hidden text-white">
        <HeroSlideshow slides={heroSlides} intervalMs={intervalMs} />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <img src={settings.logo_url || logo} alt="SKYWAVE NEXUS Integrated Solutions" className="mb-6 h-24 w-24 rounded-xl bg-white/95 p-2 shadow-elegant" />
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">{heroTitle}</h1>
            <p className="mt-4 text-lg font-medium text-white/90">{heroSubtitle}</p>
            <p className="mt-3 max-w-xl text-white/85">{heroBody}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={primaryBtnLink} className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-soft hover:bg-white/90">
                {primaryBtn}
              </a>
              <Link to="/divisions" className="rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                View Service Lines
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy hover:opacity-95">
                <MessageCircle className="size-4" /> Contact on WhatsApp
              </a>
            </div>
          </div>
          <div className="hidden md:block" />
        </div>
      </section>






      {/* Service Lines */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Our Service Lines</p>
          <h2 className="mt-2 text-3xl font-bold">Three service lines, one trusted partner.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {serviceCards.map((d) => {
            const Icon = iconFor(d.id);
            return (
              <div key={d.id} className="bg-card-gradient group rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant">
                {d.image ? (
                  <img src={d.image} alt="" className="mb-4 h-32 w-full rounded-xl object-cover" />
                ) : (
                  <div className="inline-flex rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
                    <Icon className="size-6" />
                  </div>
                )}
                <h3 className="mt-4 text-xl font-bold text-brand-navy">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d.short}</p>
                <a href={d.link} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline">
                  View Services <ArrowRight className="size-4" />
                </a>
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
          {showcase.slice(0, 6).map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
              {s.image_url && <img src={s.image_url} alt={s.title} className="h-40 w-full object-cover" />}
              <div className="p-6">
                <div className="mb-3 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {s.division_name}
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                {s.location && <p className="mt-1 text-xs text-muted-foreground">{s.location}</p>}
                {s.description && <p className="mt-3 text-sm">{s.description}</p>}
              </div>
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
              <div className="flex items-center gap-2"><Phone className="size-4" /> {settings.phone}</div>
              <div className="flex items-center gap-2"><Mail className="size-4" /> {settings.email}</div>
              <div className="flex items-center gap-2"><MapPin className="size-4" /> {settings.location}</div>
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

function HeroSlideshow({ slides, intervalMs }: { slides: ReturnType<typeof useHomepageSlides>; intervalMs: number }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), Math.max(1500, intervalMs));
    return () => clearInterval(t);
  }, [n, intervalMs]);
  if (n === 0) return null;
  const s = slides[i];
  return (
    <div className="absolute inset-0 z-0">
      {slides.map((sl, k) => (
        sl.image_url ? (
          <img
            key={sl.id}
            src={sl.image_url}
            alt={sl.title || ""}
            aria-hidden={k !== i}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${k === i ? "opacity-100" : "opacity-0"}`}
          />
        ) : null
      ))}
      <div className="absolute inset-0 bg-brand-navy/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-transparent" />

      {s?.title && (
        <div className="absolute bottom-14 right-4 z-20 hidden max-w-sm rounded-xl bg-black/40 p-4 text-right text-white backdrop-blur-sm md:block">
          <h2 className="text-xl font-bold">{s.title}</h2>
          {s.subtitle && <p className="mt-1 text-sm text-white/85">{s.subtitle}</p>}
          {s.button_text && s.button_link && (
            <a href={s.button_link} className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-white/90">
              {s.button_text} <ArrowRight className="size-3" />
            </a>
          )}
        </div>
      )}

      {n > 1 && (
        <>
          <button aria-label="Previous slide" onClick={() => setI((x) => (x - 1 + n) % n)} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/70 p-2 text-brand-navy hover:bg-white">
            <ChevronLeft className="size-5" />
          </button>
          <button aria-label="Next slide" onClick={() => setI((x) => (x + 1) % n)} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/70 p-2 text-brand-navy hover:bg-white">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, k) => (
              <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

