export type WorkEntry = { title: string; role: string; body: string; note: string; problem?: string; solution?: string; image?: string; verification_url?: string };
export type BackgroundEntry = { label: string; body: string };
export type GalleryEntry = { url: string; caption: string };
export type MetricEntry = { label: string; value: string };
export type PillarEntry = { title: string; description: string; specialties: string };
export type PortfolioDoc = {
  hero_name: string; hero_line: string; hero_image: string; authority: string; about: string;
  metrics: MetricEntry[]; pillars: PillarEntry[]; work: WorkEntry[];
  background: BackgroundEntry[]; gallery: GalleryEntry[];
  consultation_heading: string; consultation_note: string; consultation_options: string[];
  contact_phone: string; contact_email: string; contact_note: string;
};

export const defaultMetrics: MetricEntry[] = [
  { label: "Corridor scope", value: "Nanyuki / Laikipia / Narumoru" },
  { label: "Audit pass rate", value: "" },
  { label: "Hubs connected", value: "" },
  { label: "Systems deployed", value: "" },
];
export const defaultPillars: PillarEntry[] = [
  { title: "Food Science & Quality Compliance", description: "Practical food-safety systems from handling and hygiene to quality documentation and product development.", specialties: "HACCP · KEBS · GMP/GHP · Formulations" },
  { title: "Network Engineering & Field Telecommunications", description: "Connectivity planning and on-site infrastructure for locations where reliable access matters.", specialties: "MikroTik RouterOS · PtP/PtMP links · Captive portals · CCTV" },
  { title: "Software Systems & Security", description: "Operational software and access controls that make field activity visible and accountable.", specialties: "TanStack / Postgres ERPs · RBAC · Traceability · Infrastructure hardening" },
];
const defaultOperations: WorkEntry = {
  title: "OPERATIONSMANAGEMENT", role: "Traceability ERP", body: "A traceability ERP focused on connecting field records with operational oversight.",
  problem: "Fragmented operational records make it difficult to follow a product or verify its history.",
  solution: "A structured ERP approach for traceability, role-based access and live verification workflows.",
  note: "Live verification details can be added when available.",
};
export const defaultOptions = ["KEBS audit", "Network link planning", "Cold chain advisory", "Software systems"];

export function normalizePortfolio(input: PortfolioDoc): PortfolioDoc {
  const work = Array.isArray(input.work) ? input.work : [];
  const hasOperations = work.some((entry) => entry.title.toLowerCase().includes("operationsmanagement"));
  return {
    ...input,
    authority: input.authority ?? "Cold Chain Systems / Field Infrastructure / Traceability ERPs",
    metrics: Array.isArray(input.metrics) ? input.metrics : defaultMetrics,
    pillars: Array.isArray(input.pillars) ? input.pillars : defaultPillars,
    work: hasOperations ? work : [...work, defaultOperations],
    background: Array.isArray(input.background) ? input.background : [],
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    consultation_heading: input.consultation_heading ?? "Let's put the right systems in place.",
    consultation_note: input.consultation_note ?? "Tell me what you're working through. I'll respond directly.",
    consultation_options: Array.isArray(input.consultation_options) ? input.consultation_options : defaultOptions,
  };
}
