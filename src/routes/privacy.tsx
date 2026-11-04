import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSitePage } from "@/lib/cms";
import { company } from "@/lib/company-profile";
import { Mail } from "lucide-react";

const desc = "How SKYWAVE NEXUS Integrated Solutions collects, uses and protects your information.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SKYWAVE NEXUS" },
      { name: "description", content: desc },
      { property: "og:title", content: "Privacy Policy — SKYWAVE NEXUS" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skywavenexus.lovable.app/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skywavenexus.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const page = useSitePage("privacy");
  const paragraphs = (page?.body ?? "").split("\n\n");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">{page?.title || "Privacy Policy"}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        {paragraphs.length > 1 ? (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {paragraphs.map((para, i) => {
              const [heading, ...lines] = para.split("\n");
              const isHeading = lines.length > 0 && heading.length < 60;
              return (
                <div key={i}>
                  {isHeading ? (
                    <>
                      <h2 className="text-base font-bold text-foreground">{heading}</h2>
                      {lines.map((l, j) => <p key={j} className="mt-2">{l}</p>)}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{para}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Our privacy policy is being finalised and will appear here shortly.</p>
        )}

        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-base font-bold">Questions about your data?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Reach us any time at {company.location}.</p>
          <a
            href={`mailto:${company.email}?subject=${encodeURIComponent("Privacy enquiry")}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
          >
            <Mail className="size-3.5" /> Email us
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
