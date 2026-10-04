import { Shield, Sprout, Wifi, Leaf, Cpu, Wrench, Zap, Truck, FlaskConical, Globe, Building2, GraduationCap, type LucideIcon } from "lucide-react";
import { divisions, type Service } from "@/data/divisions";
import type { ServiceLine } from "@/lib/cms";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  shield: Shield, sprout: Sprout, wifi: Wifi, leaf: Leaf, cpu: Cpu, wrench: Wrench,
  zap: Zap, truck: Truck, flask: FlaskConical, globe: Globe, building: Building2, education: GraduationCap,
};
export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

const staticIcon = (slug: string) => divisions.find((d) => d.id === slug)?.icon;

export function iconFor(slug: string, icon?: string | null): LucideIcon {
  return SERVICE_ICONS[icon || ""] || SERVICE_ICONS[staticIcon(slug) || ""] || Wifi;
}

export const slugify = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type LineView = { id: string; title: string; short: string; description: string; image: string | null; icon?: string | null; link: string; services: Service[] };

/** Turn a stored line into display data, filling gaps from the built-in list. */
export function toLineView(cms: ServiceLine | null, slug: string): LineView | null {
  const fb = divisions.find((d) => d.id === slug);
  if (!cms && !fb) return null;
  const services: Service[] = cms?.services?.length
    ? cms.services.map((s, i) => {
        const m = fb?.services.find((f) => f.name.trim().toLowerCase() === (s.name || "").trim().toLowerCase());
        return {
          id: s.id || m?.id || slugify(s.name || "") || `svc-${i}`,
          name: s.name,
          explanation: s.explanation || m?.explanation || "",
          audience: s.audience || m?.audience || "",
          outcome: s.outcome || m?.outcome || "",
        };
      })
    : fb?.services ?? [];
  return {
    id: slug,
    title: cms?.title || fb?.title || slug,
    short: cms?.short_desc || fb?.short || cms?.full_desc || "",
    description: cms?.full_desc || cms?.short_desc || fb?.description || "",
    image: cms?.image_url || null,
    icon: cms?.icon,
    link: cms?.button_link || `/divisions/${slug}`,
    services,
  };
}

/** Live lines when loaded, otherwise the built-in list. */
export function lineViews(live: ServiceLine[] | null): LineView[] {
  if (live) return live.map((l) => toLineView(l, l.slug)!).filter(Boolean);
  return divisions.map((d) => toLineView(null, d.id)!);
}
