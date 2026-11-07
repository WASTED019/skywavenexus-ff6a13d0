import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSitePage, useCareersPosts, useRecentMediaPhotos, usePreviewMode } from "@/lib/cms";
import { company } from "@/lib/company-profile";
import { whatsappLink } from "@/lib/whatsapp";
import { Mail, MessageCircle, MapPin, Briefcase } from "lucide-react";

const desc = "Open positions and general applications at SKYWAVE NEXUS Integrated Solutions, serving Nyeri County, Laikipia County and remote operations.";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — SKYWAVE NEXUS" },
      { name: "description", content: desc },
      { property: "og:title", content: "Careers — SKYWAVE NEXUS" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skywavenexus.lovable.app/careers" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skywavenexus.lovable.app/careers" }],
  }),
  component: CareersPage,
});

function CareersPage() {
  const preview = usePreviewMode();
  const page = useSitePage("careers");
  const posts = useCareersPosts(preview);
  const photos = useRecentMediaPhotos(6);
  const intro = (page?.body ?? "").split("\n\n");
  const lead = intro[0] ?? "";
  const rest = intro.slice(1);

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
          <h1 className="text-3xl font-bold sm:text-4xl">{page?.title || "Careers at SKYWAVE NEXUS"}</h1>
          {lead && <p className="mt-3 max-w-2xl text-white/85">{lead}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-bold">Open positions</h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            There are no open positions right now. You can still send a general application below and we will keep it on file.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {posts.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
                {p.image_url && (
                  <img src={p.image_url} alt={p.title} loading="lazy" className="aspect-video w-full rounded-xl object-cover" />
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {p.job_type && <span className="rounded-full bg-brand-blue/10 px-3 py-1 font-semibold text-brand-blue">{p.job_type}</span>}
                  {p.location && <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" />{p.location}</span>}
                </div>
                <h3 className="mt-2 flex items-center gap-2 text-lg font-bold"><Briefcase className="size-4 text-brand-blue" />{p.title}</h3>
                {p.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${company.email}?subject=${encodeURIComponent(`Application: ${p.title}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                  >
                    <Mail className="size-3.5" /> Apply by email
                  </a>
                  <a
                    href={whatsappLink(`Hello SKYWAVE NEXUS, I would like to apply for the ${p.title} position.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-xs font-semibold hover:bg-secondary"
                  >
                    <MessageCircle className="size-3.5" /> Apply via WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-8 max-w-3xl space-y-3 text-sm text-muted-foreground">
            {rest.map((para, i) => <p key={i}>{para}</p>)}
          </div>
        )}

        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">General application</h3>
          <p className="mt-1 text-sm text-muted-foreground">Send your CV and a short note about the work you do.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${company.email}?subject=${encodeURIComponent("General application")}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
            >
              <Mail className="size-3.5" /> Email your CV
            </a>
            <a
              href={whatsappLink("Hello SKYWAVE NEXUS, I would like to send a general job application.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-xs font-semibold hover:bg-secondary"
            >
              <MessageCircle className="size-3.5" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-2xl font-bold">Our work on the ground</h2>
            <p className="mt-2 text-sm text-muted-foreground">A glimpse of the field environments our team works in.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {photos.map((m) => (
                <img
                  key={m.id}
                  src={m.public_url}
                  alt={m.alt_text || m.title || "SKYWAVE NEXUS field work"}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl border object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
