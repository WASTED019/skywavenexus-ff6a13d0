export type ShowcaseItem = {
  id: string;
  title: string;
  divisionId: "food-safety" | "value-addition" | "isp-connectivity";
  divisionName: string;
  description: string;
  location: string;
  outcome: string;
};

export const showcase: ShowcaseItem[] = [
  {
    id: "fs-1",
    title: "Food Safety System Setup",
    divisionId: "food-safety",
    divisionName: "Food Safety & Compliance Solutions",
    description: "Support for a small food processor to organize SOPs, hygiene checks, and production records.",
    location: "Nyeri County",
    outcome: "Better documentation, improved hygiene monitoring, and stronger compliance readiness.",
  },
  {
    id: "va-1",
    title: "Value Addition Product Support",
    divisionId: "value-addition",
    divisionName: "Value Addition Solutions",
    description: "Support for product formulation, packaging guidance, and market-readiness improvement.",
    location: "Central Kenya",
    outcome: "Improved product presentation, clearer costing, and better customer appeal.",
  },
  {
    id: "isp-1",
    title: "Rural Connectivity Setup",
    divisionId: "isp-connectivity",
    divisionName: "ISP & Connectivity Solutions",
    description: "WiFi and network planning support for a rural business location.",
    location: "Nyange, Nyeri",
    outcome: "Improved internet access, stronger coverage, and better service reliability.",
  },
];
