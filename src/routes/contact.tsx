import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { whatsappLink } from "@/lib/whatsapp";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SKYWAVE NEXUS" },
      { name: "description", content: "Phone, WhatsApp and email for SKYWAVE NEXUS Integrated Solutions in Nyange, Nyeri, Kenya." },
      { property: "og:title", content: "Contact — SKYWAVE NEXUS" },
      { property: "og:description", content: "Phone, WhatsApp and email for SKYWAVE NEXUS Integrated Solutions in Nyange, Nyeri, Kenya." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/contact" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/contact" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact SKYWAVE NEXUS",
        url: "https://skywavenexus.lovable.app/contact",
        mainEntity: {
          "@type": "Organization",
          name: "SKYWAVE NEXUS Integrated Solutions",
          telephone: "+254753366995",
          email: "skywavenexus@gmail.com",
          address: { "@type": "PostalAddress", streetAddress: "Nyange", addressLocality: "Nyeri", addressCountry: "KE" },
        },
      }),
    }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Contact us</h1>
          <p className="mt-3 max-w-2xl text-white/85">We respond to every request — by phone, WhatsApp or email.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-2">
        <ContactCard icon={<Phone className="size-5" />} label="Phone" value="0753366995" href="tel:0753366995" />
        <ContactCard icon={<MessageCircle className="size-5" />} label="WhatsApp" value="0753366995" href={whatsappLink()} external />
        <ContactCard icon={<Mail className="size-5" />} label="Email" value="skywavenexus@gmail.com" href="mailto:skywavenexus@gmail.com" />
        <ContactCard icon={<MapPin className="size-5" />} label="Location" value="Nyange, Nyeri, Kenya" />
      </section>
      <Footer />
    </div>
  );
}

function ContactCard({ icon, label, value, href, external }: { icon: React.ReactNode; label: string; value: string; href?: string; external?: boolean }) {
  const inner = (
    <div className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-elegant">
      <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-base font-semibold">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{inner}</a> : inner;
}
