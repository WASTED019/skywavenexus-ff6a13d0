export type Service = {
  id: string;
  name: string;
  explanation: string;
  audience: string;
  outcome: string;
};

export type Division = {
  id: "food-safety" | "value-addition" | "isp-connectivity" | "digital-systems";
  title: string;
  short: string;
  description: string;
  icon: "shield" | "sprout" | "wifi" | "cpu";
  services: Service[];
};

export const divisions: Division[] = [
  {
    id: "food-safety",
    title: "Food Industry & Value Addition Solutions",
    short: "Food safety, quality systems, processing and value addition support.",
    icon: "shield",
    description:
      "Practical food industry support across food safety, quality assurance, processing, product development and value addition.",
    services: [
      { id: "haccp", name: "HACCP system setup", explanation: "Develop a HACCP system suited to your operation.", audience: "Processors, hotels and institutions", outcome: "A documented system for your team to use and review." },
      { id: "audits", name: "Food safety review", explanation: "Review current practices and identify improvement areas.", audience: "Food businesses and SMEs", outcome: "A practical review with findings and suggested actions." },
      { id: "gmp-ghp", name: "GMP and GHP implementation support", explanation: "Support good manufacturing and hygiene practices in daily operations.", audience: "Food businesses and processors", outcome: "Clear practices and records for routine operations." },
      { id: "sop", name: "SOP and food safety documentation", explanation: "Prepare operating procedures, checklists and records.", audience: "Food businesses and institutions", outcome: "Usable documentation tailored to the operation." },
      { id: "training", name: "Food hygiene training", explanation: "Practical food handling and hygiene sessions for staff.", audience: "Hotels, schools and processors", outcome: "Staff guidance aligned to the work being done." },
      { id: "traceability", name: "Traceability and quality records", explanation: "Organise ingredient, batch and production records.", audience: "Food processors", outcome: "Clearer production and batch documentation." },
      { id: "product-dev", name: "Product development and formulation guidance", explanation: "Support product trials, formulation and process improvement.", audience: "Entrepreneurs, farmers and processors", outcome: "A structured product-development process." },
      { id: "post-harvest", name: "Post-harvest handling advisory", explanation: "Review handling and processing practices that affect product quality.", audience: "Farmers and agribusinesses", outcome: "Practical recommendations for handling and value addition." },
      { id: "packaging", name: "Labelling and packaging advisory", explanation: "Review product information and packaging considerations.", audience: "Food product owners", outcome: "Clearer product presentation and information." },
    ],
  },
  {
    id: "isp-connectivity",
    title: "ICT & Connectivity Solutions",
    short: "Network planning, installation, configuration and support.",
    icon: "wifi",
    description:
      "ICT support and connectivity services for homes, small businesses, schools, farms and rural communities. Commercial internet resale is not implied.",
    services: [
      { id: "computer-support", name: "Computer support and maintenance", explanation: "Troubleshoot and maintain computer systems and connected equipment.", audience: "Homes, SMEs and institutions", outcome: "A documented assessment and agreed support actions." },
      { id: "lan", name: "LAN and office network installation", explanation: "Plan and install wired networks for small offices and sites.", audience: "SMEs and institutions", outcome: "A network arranged to fit the agreed site requirements." },
      { id: "wifi", name: "Wireless network installation", explanation: "Plan coverage and configure wireless access points.", audience: "Homes, businesses and schools", outcome: "Wireless coverage planned for the agreed area." },
      { id: "mikrotik", name: "Router configuration and troubleshooting", explanation: "Configure supported routers, including MikroTik RouterOS.", audience: "Businesses and network operators", outcome: "Configuration and troubleshooting suited to the requirements." },
      { id: "hotspot", name: "Hotspot and captive portal setup", explanation: "Set up guest access and hotspot management where appropriate.", audience: "Hotels, cafés and shared spaces", outcome: "A configured guest access experience." },
      { id: "ptp", name: "Point-to-point link planning", explanation: "Assess and plan point-to-point or point-to-multipoint wireless links.", audience: "Multi-site and rural clients", outcome: "A site-specific link plan and requirements." },
      { id: "cctv", name: "CCTV network support", explanation: "Support network connectivity for CCTV installations.", audience: "Businesses and homes", outcome: "A network setup aligned to the camera system needs." },
      { id: "network-consultancy", name: "Network infrastructure consultancy", explanation: "Review network needs, constraints and proposed infrastructure.", audience: "SMEs and institutions", outcome: "A scoped set of recommendations." },
    ],
  },
  {
    id: "digital-systems",
    title: "Digital Systems & Innovation",
    short: "Websites, business systems, workflow automation and digital support.",
    icon: "cpu",
    description:
      "Digital services for organisations seeking practical websites, software systems, structured records and more connected workflows.",
    services: [
      { id: "web-development", name: "Website design and development", explanation: "Plan and build websites around an organisation's content and needs.", audience: "Businesses and institutions", outcome: "A website scoped to the agreed requirements." },
      { id: "web-apps", name: "Custom web applications", explanation: "Develop web-based tools for defined business workflows.", audience: "SMEs and organisations", outcome: "An application shaped around agreed workflows." },
      { id: "business-systems", name: "Business management systems and ERP", explanation: "Support planning and implementation of suitable business systems.", audience: "Businesses and institutions", outcome: "A defined system scope and implementation plan." },
      { id: "records", name: "Digital records and data management", explanation: "Organise operational or financial records in suitable digital workflows.", audience: "SMEs and organisations", outcome: "Clearer records and access processes." },
      { id: "automation", name: "Workflow automation and reporting", explanation: "Identify repeatable workflows and reporting needs for digitisation.", audience: "Teams with recurring manual processes", outcome: "A scoped automation and reporting approach." },
      { id: "digital-support", name: "Application maintenance and support", explanation: "Provide agreed support and maintenance for digital applications.", audience: "Existing system owners", outcome: "Support aligned to the agreed service scope." },
    ],
  },
];

export const findDivision = (id: string) => divisions.find((d) => d.id === id);
export const findService = (divisionId: string, serviceId: string) =>
  findDivision(divisionId)?.services.find((s) => s.id === serviceId);