export type Service = {
  id: string;
  name: string;
  explanation: string;
  audience: string;
  outcome: string;
};

export type Division = {
  id: "food-safety" | "value-addition" | "isp-connectivity";
  title: string;
  short: string;
  description: string;
  icon: "shield" | "sprout" | "wifi";
  services: Service[];
};

export const divisions: Division[] = [
  {
    id: "food-safety",
    title: "Food Safety & Compliance Solutions",
    short: "Food safety, audits, SOPs & KEBS readiness.",
    icon: "shield",
    description:
      "We help food businesses, processors, hotels, institutions, SMEs, and agribusinesses improve food safety, prepare for compliance, and set up professional quality systems.",
    services: [
      { id: "haccp", name: "HACCP system setup", explanation: "Design and implement a Hazard Analysis Critical Control Point system for your operation.", audience: "Processors, hotels, institutions", outcome: "Documented HACCP plan ready for compliance review." },
      { id: "audits", name: "Food safety audits", explanation: "Independent on-site audit against food safety best practices.", audience: "Food businesses & SMEs", outcome: "Audit report with corrective actions." },
      { id: "gmp-ghp", name: "GMP and GHP implementation", explanation: "Roll out Good Manufacturing & Hygiene Practices across your facility.", audience: "Small processors", outcome: "Hygiene & manufacturing standards in place." },
      { id: "kebs", name: "KEBS readiness support", explanation: "Prepare your product, facility, and documentation for KEBS evaluation.", audience: "Agribusinesses & SMEs", outcome: "Higher chance of KEBS approval." },
      { id: "sop", name: "SOP documentation", explanation: "Write clear Standard Operating Procedures for your team.", audience: "Any food business", outcome: "Repeatable, trainable processes." },
      { id: "training", name: "Food handler training", explanation: "Practical hygiene and safe-handling training for your staff.", audience: "Hotels, schools, processors", outcome: "Confident, compliant staff." },
      { id: "traceability", name: "Traceability system setup", explanation: "Track ingredients and batches from intake to dispatch.", audience: "Processors", outcome: "Faster recall and stronger trust." },
      { id: "labels", name: "Product labelling review", explanation: "Review labels for legal and informational completeness.", audience: "Food product owners", outcome: "Market-ready labels." },
      { id: "checklist", name: "Internal compliance checklist preparation", explanation: "Custom checklists tailored to your operation.", audience: "SMEs", outcome: "Easy daily compliance monitoring." },
      { id: "hygiene", name: "Hygiene inspection support", explanation: "Inspection visits with practical recommendations.", audience: "Food businesses", outcome: "Cleaner, safer facility." },
      { id: "records", name: "Production records and batch documentation", explanation: "Set up production logs and batch records.", audience: "Processors", outcome: "Traceable production history." },
      { id: "consultancy", name: "Food safety consultancy for small processors", explanation: "Ongoing advisory tailored to small operations.", audience: "Small processors", outcome: "Continuous improvement support." },
    ],
  },
  {
    id: "value-addition",
    title: "Value Addition Solutions",
    short: "Turn raw products into market-ready value-added products.",
    icon: "sprout",
    description:
      "We support farmers, processors, youth entrepreneurs, and SMEs in turning raw products into market-ready value-added products.",
    services: [
      { id: "product-dev", name: "Product development support", explanation: "From idea to a sellable food product.", audience: "Entrepreneurs & farmers", outcome: "A trial product ready for testing." },
      { id: "formulation", name: "Food formulation guidance", explanation: "Recipe & ingredient ratios for stable products.", audience: "Processors", outcome: "Consistent product quality." },
      { id: "porridge", name: "Porridge flour product support", explanation: "Blend design, nutrition messaging and packaging.", audience: "Flour producers", outcome: "Marketable porridge flour line." },
      { id: "dairy", name: "Dairy value addition support", explanation: "Yoghurt, mala, and processed dairy guidance.", audience: "Dairy farmers & SMEs", outcome: "New dairy product lines." },
      { id: "fruit-veg", name: "Fruit and vegetable processing support", explanation: "Drying, juicing, and preservation guidance.", audience: "Farmer groups", outcome: "Reduced post-harvest losses." },
      { id: "packaging", name: "Packaging advice", explanation: "Right packaging for your product and market.", audience: "Small processors", outcome: "Better shelf appeal." },
      { id: "label-content", name: "Label content review", explanation: "Make labels clear, compliant and attractive.", audience: "Product owners", outcome: "Customer-ready labels." },
      { id: "shelf-life", name: "Shelf-life improvement guidance", explanation: "Practical steps to extend product shelf life.", audience: "Processors", outcome: "Longer-lasting products." },
      { id: "workflow", name: "Small-scale processing workflow design", explanation: "Layout & workflow for tiny processing units.", audience: "Youth & SMEs", outcome: "Efficient small-scale production." },
      { id: "costing", name: "Production costing support", explanation: "Know your real cost per unit.", audience: "All producers", outcome: "Profitable pricing." },
      { id: "branding", name: "Branding and market-readiness support", explanation: "Naming, identity, and positioning.", audience: "Entrepreneurs", outcome: "A brand ready for market." },
      { id: "training-va", name: "Training for value addition groups", explanation: "Group training tailored to your product.", audience: "Cooperatives & groups", outcome: "Skilled members & better products." },
    ],
  },
  {
    id: "isp-connectivity",
    title: "ISP & Connectivity Solutions",
    short: "WiFi, hotspots, MikroTik, CCTV & rural connectivity.",
    icon: "wifi",
    description:
      "Digital connectivity, networking, hotspot, and technical support services for homes, small businesses, cyber cafés, schools, farms, and rural communities.",
    services: [
      { id: "wifi", name: "WiFi installation", explanation: "Plan and install WiFi for homes & businesses.", audience: "Homes, SMEs", outcome: "Reliable wireless coverage." },
      { id: "hotspot", name: "Hotspot setup", explanation: "Voucher-based or free hotspot deployment.", audience: "Cyber cafés, hotels", outcome: "Monetised guest internet." },
      { id: "mikrotik", name: "MikroTik router configuration", explanation: "Professional MikroTik configuration & tuning.", audience: "ISPs & power users", outcome: "Stable, secure routing." },
      { id: "captive", name: "Captive portal setup", explanation: "Branded login pages for hotspot users.", audience: "Hotels, cafés", outcome: "Professional guest experience." },
      { id: "rural-survey", name: "Rural internet survey", explanation: "Site survey for rural connectivity options.", audience: "Rural businesses", outcome: "A clear connectivity plan." },
      { id: "ptp", name: "Point-to-point wireless link planning", explanation: "Plan PtP links between sites.", audience: "Multi-site clients", outcome: "Reliable inter-site links." },
      { id: "troubleshoot", name: "Network troubleshooting", explanation: "Diagnose and fix network issues.", audience: "Any client", outcome: "Network back to health." },
      { id: "cctv", name: "CCTV network setup", explanation: "Networking layer for CCTV systems.", audience: "Businesses & homes", outcome: "Stable CCTV connectivity." },
      { id: "office-net", name: "Small office network setup", explanation: "Wired & wireless office networking.", audience: "SMEs", outcome: "Productive office network." },
      { id: "ap-install", name: "Router and access point installation", explanation: "Mount and configure routers/APs.", audience: "Homes & SMEs", outcome: "Stronger signal everywhere." },
      { id: "coverage", name: "Internet coverage planning", explanation: "Plan coverage for compounds & estates.", audience: "Property owners", outcome: "End-to-end coverage plan." },
      { id: "pos", name: "POS and printer connectivity support", explanation: "Connect POS systems & printers reliably.", audience: "Retailers & cafés", outcome: "Working POS & printer network." },
    ],
  },
];

export const findDivision = (id: string) => divisions.find((d) => d.id === id);
export const findService = (divisionId: string, serviceId: string) =>
  findDivision(divisionId)?.services.find((s) => s.id === serviceId);
