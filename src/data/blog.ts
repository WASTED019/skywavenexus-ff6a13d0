export type BlogPost = {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  body: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: "sops-small-food",
    title: "Why Small Food Businesses Need Basic SOPs",
    category: "Food Safety Tips",
    summary: "Simple SOPs prevent costly mistakes, protect customers and make your business audit-ready.",
    date: "2026-04-12",
    body: "Standard Operating Procedures (SOPs) describe how key tasks should be done every time. For a small food business, even one or two pages of SOPs around cleaning, receiving, and packaging can dramatically reduce risk and customer complaints.",
  },
  {
    id: "farmers-value-addition",
    title: "How Farmers Can Start Simple Value Addition",
    category: "Value Addition Tips",
    summary: "From drying to packaging, small steps can transform raw produce into market-ready products.",
    date: "2026-03-30",
    body: "Start with what you already grow. Identify one product that suffers post-harvest losses and explore drying, milling or basic packaging to add value with minimal investment.",
  },
  {
    id: "rural-wifi-checklist",
    title: "What to Check Before Installing WiFi in a Rural Area",
    category: "Internet & Networking Guides",
    summary: "Power, line of sight and device count should guide every rural WiFi plan.",
    date: "2026-03-18",
    body: "Reliable rural WiFi starts with a site survey. Check available power, distance to upstream signal, line of sight, and the number of devices that need coverage.",
  },
  {
    id: "labels-matter",
    title: "Why Product Labels Matter Before Selling Food Products",
    category: "Business Compliance Tips",
    summary: "A clear, compliant label builds trust and unlocks formal markets.",
    date: "2026-02-22",
    body: "Labels must communicate ingredients, allergens, weight, batch and expiry information. Beyond compliance, a clear label is your silent salesperson on the shelf.",
  },
  {
    id: "skywave-supports-sme",
    title: "How SKYWAVE NEXUS Supports Small Businesses",
    category: "Company Updates",
    summary: "Practical, field-based support across food safety, value addition and connectivity.",
    date: "2026-02-05",
    body: "We work directly with small businesses, farmers and rural enterprises to solve real problems on the ground — from compliance documentation to connectivity.",
  },
];
