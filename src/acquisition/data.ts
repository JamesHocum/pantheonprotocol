// ============================================================
// Pantheon Protocol — Acquisition & Liquidation Hub data model
// All buyer-facing content lives here as editable data.
// Nothing is marked VERIFIED by default.
// ============================================================

export type AssetStatus = "Verified" | "To Verify" | "Excluded" | "Unknown";
export type Transferable = "Yes" | "No" | "Needs Review";
export type MaturityStatus = "Complete" | "Partial" | "Prototype" | "Planned" | "Unknown";
export type VerificationStatus = "Verified" | "To Verify" | "Unknown";

export interface Asset {
  id: string;
  asset: string;
  category: "Software" | "Product" | "AI" | "Brand" | "Documentation" | "Other Assets";
  description: string;
  status: AssetStatus;
  transferable: Transferable;
  location: string;
  evidence: string;
  notes: string;
}

export interface Technology {
  id: string;
  field: string;
  value: string;
  status: VerificationStatus;
}

export interface MaturityItem {
  id: string;
  category: string;
  status: MaturityStatus;
  note: string;
}

export interface Evidence {
  id: string;
  claim: string;
  type: string;
  location: string;
  status: VerificationStatus;
  notes: string;
}

export interface DueDiligenceItem {
  id: string;
  item: string;
  status: VerificationStatus | "Not Included" | "Requires Review";
  notes: string;
  evidence: string;
  lastVerified: string;
}

export interface BuyerCategory {
  id: string;
  title: string;
  rationale: string;
}

export interface Capability {
  id: string;
  title: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  visibility: "Public" | "Private";
}

export interface BuyerInquiry {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  buyerType: string;
  message: string;
  interestedIn: string;
  budgetRange: string;
  timeline: string;
}

export interface AcquisitionSettings {
  askingPrice: string;
  assetStatus: string;
  availability: string;
  transferTimeline: string;
  includedSupport: string;
  negotiability: string;
}

export interface ContactSettings {
  contactName: string;
  contactRole: string;
  inquiryDestination: string; // never rendered publicly
  responseTime: string;
  preferredChannel: string;
}

export interface ProjectSettings {
  name: string;
  tagline: string;
  oneSentence: string;
  subtitle: string;
  overview: string;
  saleNote: string;
  remainingWork: string;
  reasonForSale: string;
  demoUrl: string;
  statusHeadline: string;
  statusBody: string;
}


export interface PantheonPackage {
  project: ProjectSettings;
  acquisition: AcquisitionSettings;
  contact: ContactSettings;
  capabilities: Capability[];
  assets: Asset[];
  technology: Technology[];
  maturity: MaturityItem[];
  buyers: BuyerCategory[];
  dueDiligence: DueDiligenceItem[];
  evidence: Evidence[];
  faq: FAQItem[];
  links: LinkItem[];
  inquiries: BuyerInquiry[];
}

const id = (p: string, n: number) => `${p}-${n}`;

const TV = "To Verify" as const;

export const defaultPackage: PantheonPackage = {
  project: {
    name: "Pantheon Protocol",
    tagline: "AI-Powered Cybersecurity Training & Verification Platform",
    oneSentence:
      "Pantheon Protocol is an existing, working AI cybersecurity training and verification application with a live interactive demonstration, offered as an asset sale subject to verification and transferability.",
    subtitle:
      "An existing, working product foundation combining AI-assisted cybersecurity interaction, multi-model verification, consensus analysis, trust scoring, governance, divergence detection, and exportable verification reports.",
    overview:
      "Pantheon Protocol combines persona-based AI cybersecurity interaction with a multi-model verification workflow. A prospective buyer can open the live demonstration, run a guided demo tour, interact with the AI mentor, trigger verification across independent models, and export a verification report — rather than evaluating concept documents alone.",
    saleNote:
      "This is an asset sale, not a sale of an operating business. No customers, revenue, contracts, certifications, or production-scale operations are represented. Every included component is subject to verification and transferability confirmation during due diligence.",
    remainingWork:
      "To Verify — additional production hardening, deployment configuration, account transfer, scaling and third-party service configuration may be required depending on the acquiring party's intended use.",
    reasonForSale: "To Verify — owner to provide statement prior to buyer discussions.",
    demoUrl: "/",
    statusHeadline: "Live demonstration available",
    statusBody:
      "The current application contains an operational interactive demonstration and implemented verification workflow. Additional production hardening, deployment configuration, account transfer, scaling, and third-party service configuration may be required depending on the acquiring party's intended use.",
  },
  acquisition: {
    askingPrice: "To Be Determined",
    assetStatus: "Available for acquisition",
    availability: "Immediate discussions",
    transferTimeline: "To Be Determined",
    includedSupport: "To Be Determined",
    negotiability: "To Be Determined",
  },
  contact: {
    contactName: "Not Provided",
    contactRole: "Owner / Seller",
    inquiryDestination: "",
    responseTime: "To Be Determined",
    preferredChannel: "Inquiry form",
  },
  capabilities: [
    { id: "cap-1", title: "AI Cybersecurity Interaction", description: "Conversational interface for working through cybersecurity topics with an AI counterpart." },
    { id: "cap-2", title: "Persona-Based AI Mentorship", description: "Distinct AI mentor personas give each track its own voice, framing and instructional tone." },
    { id: "cap-3", title: "Multi-Model Verification", description: "A response can be re-run independently across separate models for comparison." },
    { id: "cap-4", title: "Consensus Analysis", description: "Independent model outputs are judged against each other to establish agreement." },
    { id: "cap-5", title: "Trust Scoring", description: "Verification output includes a trust score summarizing agreement strength." },
    { id: "cap-6", title: "Hallucination Risk Detection", description: "Verification output includes a hallucination-risk assessment for the reviewed answer." },
    { id: "cap-7", title: "Governance Analysis", description: "A governance stream records the verification steps taken for the reviewed response." },
    { id: "cap-8", title: "Divergence Detection", description: "Points where independent models disagree are surfaced for inspection." },
    { id: "cap-9", title: "Verification Reports", description: "Verification results are compiled into a structured report." },
    { id: "cap-10", title: "PDF Export", description: "Reports can be exported as a multi-page PDF from the application." },
    { id: "cap-11", title: "Guided Demo Mode", description: "A spotlight/tooltip tour walks a first-time viewer through the product with auto progression." },
  ],

  assets: [
    { id: id("a", 1), asset: "Frontend source code", category: "Software", description: "Client application source for the platform interface.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 2), asset: "Backend source / server logic", category: "Software", description: "Server-side logic, if applicable.", status: "Unknown", transferable: "Needs Review", location: TV, evidence: TV, notes: "Scope to be confirmed." },
    { id: id("a", 3), asset: "Application architecture", category: "Software", description: "Structure, module boundaries and data flow of the application.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 4), asset: "UI component library", category: "Software", description: "Reusable interface components used across the product.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 5), asset: "Configuration files", category: "Software", description: "Build/runtime configuration, excluding all secrets.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "Credentials transferred separately through secure process." },
    { id: id("a", 6), asset: "Build & deployment assets", category: "Software", description: "Build scripts and deployment configuration.", status: "Unknown", transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 7), asset: "Product concept", category: "Product", description: "The overall product thesis and positioning.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 8), asset: "UX / UI direction", category: "Product", description: "Established visual system and interaction direction.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 9), asset: "Feature architecture", category: "Product", description: "Feature map and how capabilities relate to each other.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 10), asset: "Product workflows", category: "Product", description: "Learner, instructor and admin flows.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 11), asset: "Roadmap concepts", category: "Product", description: "Planned expansion directions.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 12), asset: "AI persona concepts", category: "AI", description: "Persona definitions used for mentorship framing.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 13), asset: "Prompt systems", category: "AI", description: "Prompt structures behind persona behavior.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 14), asset: "AI workflow designs", category: "AI", description: "Designed sequences for AI-assisted interaction.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 15), asset: "Mentorship architecture", category: "AI", description: "How mentorship sessions are structured conceptually.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 16), asset: "Pantheon Protocol name & marks", category: "Brand", description: "Product name and associated brand assets, where transferable.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "No trademark registration represented." },
    { id: id("a", 17), asset: "Logos", category: "Brand", description: "Logo and icon assets.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 18), asset: "Visual identity", category: "Brand", description: "Color system, typography direction, treatment rules.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 19), asset: "Marketing materials", category: "Brand", description: "Any existing promotional collateral.", status: "Unknown", transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 20), asset: "Product documentation", category: "Documentation", description: "Written description of product behavior and scope.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 21), asset: "Technical documentation", category: "Documentation", description: "Architecture and implementation notes.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 22), asset: "Setup instructions", category: "Documentation", description: "Steps required to run the project locally.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 23), asset: "Roadmap document", category: "Documentation", description: "Forward-looking product plan.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 24), asset: "Product notes", category: "Documentation", description: "Working notes and decisions.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 25), asset: "Screenshots", category: "Other Assets", description: "Interface captures for buyer review.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 26), asset: "Demonstrations", category: "Other Assets", description: "Walkthroughs or recorded demos, if available.", status: "Unknown", transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 27), asset: "Design files", category: "Other Assets", description: "Source design artifacts, if available.", status: "Unknown", transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 28), asset: "Supporting project assets", category: "Other Assets", description: "Images, icons and misc. project files.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 29), asset: "Live demonstration experience", category: "Product", description: "The interactive demo, including guided Demo Mode tour with auto progression.", status: TV, transferable: "Needs Review", location: TV, evidence: "Live demo link", notes: "" },
    { id: id("a", 30), asset: "Verification workflow", category: "AI", description: "End-to-end multi-model verification flow implemented in the application.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 31), asset: "Model-routing implementation", category: "AI", description: "Routing of requests to independent models for rerun and comparison.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 32), asset: "Consensus workflow", category: "AI", description: "Consensus judging across independent model responses.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 33), asset: "Trust & hallucination analysis", category: "AI", description: "Trust scoring and hallucination-risk assessment logic.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 34), asset: "Governance & divergence analysis", category: "AI", description: "Governance stream and divergence detection output.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 35), asset: "Verification report generation", category: "AI", description: "Report compilation and multi-page PDF export.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "" },
    { id: id("a", 36), asset: "Edge functions", category: "Software", description: "Server-side functions supporting chat and verification.", status: TV, transferable: "Needs Review", location: TV, evidence: TV, notes: "Credentials transferred separately through secure process." },
  ],
  technology: [
    { id: "t-1", field: "Frontend", value: TV, status: TV },
    { id: "t-2", field: "Backend / Edge Functions", value: TV, status: TV },
    { id: "t-3", field: "AI Models", value: TV, status: TV },
    { id: "t-4", field: "Verification Architecture", value: TV, status: TV },
    { id: "t-5", field: "PDF Generation", value: TV, status: TV },
    { id: "t-6", field: "Deployment", value: TV, status: TV },
    { id: "t-7", field: "Repository", value: TV, status: TV },
    { id: "t-8", field: "Database", value: TV, status: TV },
    { id: "t-9", field: "Authentication", value: TV, status: TV },
    { id: "t-10", field: "Third-Party Dependencies", value: TV, status: TV },
    { id: "t-11", field: "Domain", value: TV, status: TV },
    { id: "t-12", field: "Licensing", value: TV, status: TV },
  ],

  maturity: [
    { id: "m-1", category: "Concept", status: "Unknown", note: "" },
    { id: "m-2", category: "Design", status: "Unknown", note: "" },
    { id: "m-3", category: "Frontend", status: "Unknown", note: "" },
    { id: "m-4", category: "Backend", status: "Unknown", note: "" },
    { id: "m-5", category: "AI Integration", status: "Unknown", note: "" },
    { id: "m-6", category: "Authentication", status: "Unknown", note: "" },
    { id: "m-7", category: "Data Persistence", status: "Unknown", note: "" },
    { id: "m-8", category: "Deployment", status: "Unknown", note: "" },
    { id: "m-9", category: "Documentation", status: "Unknown", note: "" },
    { id: "m-10", category: "Branding", status: "Unknown", note: "" },
    { id: "m-11", category: "Demo Readiness", status: "Partial", note: "Interactive demonstration and guided Demo Mode present in the current application." },
    { id: "m-12", category: "Verification Workflow", status: "Partial", note: "Multi-model verification, consensus, trust/hallucination output and PDF export implemented; production hardening to verify." },
  ],
  buyers: [
    { id: "b-1", title: "Cybersecurity companies", rationale: "Attach an AI-assisted training and verification surface to an existing security portfolio." },
    { id: "b-2", title: "Security training organizations", rationale: "Add persona-driven AI mentorship and verification to an existing training catalog." },
    { id: "b-3", title: "AI governance companies", rationale: "Reuse the consensus, trust-scoring and governance/divergence workflow." },
    { id: "b-4", title: "AI education platforms", rationale: "Enter the security vertical with a working product foundation." },
    { id: "b-5", title: "Corporate learning companies", rationale: "Differentiate compliance-heavy catalogs with conversational, verified learning." },
    { id: "b-6", title: "Security consultancies", rationale: "Package internal enablement and client training under an owned product." },
    { id: "b-7", title: "AI SaaS founders", rationale: "Start from an implemented verification architecture instead of a blank repository." },
    { id: "b-8", title: "Developers seeking a product foundation", rationale: "Acquire an existing application, design system and workflow set." },
  ],
  dueDiligence: [
    "Source-code ownership",
    "Intellectual-property ownership",
    "Repository access",
    "Domain ownership",
    "Hosting",
    "Third-party services",
    "AI provider dependencies",
    "Open-source licenses",
    "Brand assets",
    "Design assets",
    "Documentation",
    "Deployment process",
    "Credentials",
    "Transfer requirements",

  ].map((item, i) => ({
    id: `dd-${i + 1}`,
    item,
    status: TV as VerificationStatus,
    notes: "",
    evidence: "",
    lastVerified: "Not Provided",
  })),
  evidence: [
    { id: "e-1", claim: "Source code exists and is owned by the seller", type: "Repository", location: TV, status: TV, notes: "" },
    { id: "e-2", claim: "Application runs and can be demonstrated", type: "Demo / screenshots", location: TV, status: TV, notes: "" },
    { id: "e-3", claim: "Documentation set exists", type: "Documents", location: TV, status: TV, notes: "" },
    { id: "e-4", claim: "Brand assets are transferable", type: "Asset files", location: TV, status: TV, notes: "" },
  ],
  faq: [
    { id: "f-1", question: "What is Pantheon Protocol?", answer: "A persona-driven AI cybersecurity training and collaboration platform concept, including product architecture, design direction, documentation and available software assets." },
    { id: "f-2", question: "What exactly is included?", answer: "See the acquisition inventory. Each line item carries its own status and transferability assessment; nothing is represented as verified until confirmed." },
    { id: "f-3", question: "Is the source code included?", answer: "To Verify — intended to be included, subject to ownership and dependency review." },
    { id: "f-4", question: "Is the brand included?", answer: "To Verify — name and brand assets are offered where transferable. No trademark registration is represented." },
    { id: "f-5", question: "Is the domain included?", answer: "To Verify — domain ownership and transferability to be confirmed." },
    { id: "f-6", question: "What technology does it use?", answer: "To Verify — see Technical Snapshot. Stack details are being confirmed prior to transfer." },
    { id: "f-7", question: "What remains to be built?", answer: "To Verify — the Current State matrix records per-category maturity as it is confirmed." },
    { id: "f-8", question: "Why is it being sold?", answer: "To Verify — owner statement pending." },
    { id: "f-9", question: "How quickly can it be transferred?", answer: "To Verify — target timeline is configurable in the acquisition terms section." },
    { id: "f-10", question: "Is seller support included?", answer: "To Verify — any transition support would be defined in the asset-purchase agreement." },
    { id: "f-11", question: "Are third-party services included?", answer: "Third-party accounts and API access are not automatically transferable and must be reviewed individually." },
    { id: "f-12", question: "Is the asking price negotiable?", answer: "To Verify." },
  ],
  links: [
    { id: "l-1", label: "Repository", url: "Not Provided", visibility: "Private" },
    { id: "l-2", label: "Live demo", url: "Not Provided", visibility: "Private" },
    { id: "l-3", label: "Documentation", url: "Not Provided", visibility: "Private" },
    { id: "l-4", label: "Screenshots", url: "Not Provided", visibility: "Private" },
  ],
  inquiries: [],
};

export const BUYER_TYPES = [
  "Cybersecurity training company",
  "Security consultancy",
  "AI education company",
  "Corporate learning platform",
  "Cybersecurity SaaS",
  "AI developer tools",
  "EdTech",
  "Founder / individual",
  "Investor",
  "Other",
];

export const BUDGET_RANGES = ["Undisclosed", "< $10k", "$10k – $50k", "$50k – $150k", "$150k – $500k", "$500k+"];
export const TIMELINES = ["Undisclosed", "Immediately", "Within 30 days", "1–3 months", "3+ months"];
export const INTERESTED_IN = ["Full asset package", "Source code only", "Brand & IP only", "Product concept & design", "Exploratory"];
