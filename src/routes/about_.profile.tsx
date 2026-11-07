import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLiveServiceLines } from "@/lib/cms";
import { publicServiceLineViews } from "@/lib/service-lines";
import { company } from "@/lib/company-profile";
import { Printer, ArrowLeft } from "lucide-react";

const desc = "Printable company profile for SKYWAVE NEXUS Integrated Solutions: mission, service lines, delivery model and contacts.";

export const Route = createFileRoute("/about_/profile")({
  head: () => ({
    meta: [
      { title: "Company Profile — SKYWAVE NEXUS" },
      { name: "description", content: desc },
      { property: "og:title", content: "Company Profile — SKYWAVE NEXUS" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skywavenexus.lovable.app/about/profile" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://skywavenexus.lovable.app/about/profile" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const divisions = publicServiceLineViews(useLiveServiceLines());
  return (
    <main className="mx-auto max-w-3xl bg-background px-6 py-8 text-foreground print:p-0">
      <div className="mb-6 flex flex-wrap gap-3 print:hidden">
        <Button asChild variant="outline"><Link to="/about"><ArrowLeft className="size-4" /> Back</Link></Button>
        <Button onClick={() => window.print()}><Printer className="size-4" /> Print / Save as PDF</Button>
      </div>
      <header className="border-b-2 border-primary pb-4">
        <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted-foreground">Company Profile · {company.location}</p>
      </header>
      <section className="mt-5">
        <h2 className="text-lg font-semibold">Mission</h2>
        <p className="mt-1 text-sm">{company.mission}</p>
      </section>
      <section className="mt-5">
        <h2 className="text-lg font-semibold">Vision and Purpose</h2>
        <p className="mt-1 text-sm"><strong>Vision:</strong> {company.vision}</p>
        <p className="mt-1 text-sm"><strong>Purpose:</strong> {company.purpose}</p>
      </section>
      <section className="mt-5">
        <h2 className="text-lg font-semibold">Service Lines</h2>
        {divisions.map((d) => (
          <div key={d.id} className="mt-3 break-inside-avoid">
            <h3 className="font-semibold">{d.title}</h3>
            <p className="text-sm">{d.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">{d.services.map((s) => s.name).join(" · ")}</p>
          </div>
        ))}
      </section>
      <section className="mt-5 break-inside-avoid">
        <h2 className="text-lg font-semibold">Operating Principles</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {company.values.map((v) => <li key={v.title}><strong>{v.title}:</strong> {v.text}</li>)}
        </ul>
      </section>
      <section className="mt-5 break-inside-avoid">
        <h2 className="text-lg font-semibold">Delivery Model</h2>
        <ol className="mt-1 list-decimal pl-5 text-sm">
          {company.delivery.map((s) => <li key={s.step}><strong>{s.step}:</strong> {s.text}</li>)}
        </ol>
      </section>
      <section className="mt-5 break-inside-avoid border-t pt-4 text-sm">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p>Phone / WhatsApp: {company.phone}</p>
        <p>Email: {company.email}</p>
        <p>Web: skywavenexus.lovable.app</p>
      </section>
    </main>
  );
}
