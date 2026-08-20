import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Bot, GitCompare, Scale, Gauge, AlertTriangle, FileCheck2, Split, FileText,
  Download, Compass, ExternalLink, Printer, Sparkles, ArrowRight, Lock, Search, Rocket, Layers,
} from "lucide-react";
import { Section, Panel, StatusPill, DataRow, Disclaimer } from "@/components/acquisition/AcqUI";
import { useAcquisition } from "@/acquisition/store";
import { BUDGET_RANGES, BUYER_TYPES, INTERESTED_IN, TIMELINES, type Asset } from "@/acquisition/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const capabilityIcons = [Bot, Sparkles, GitCompare, Scale, Gauge, AlertTriangle, FileCheck2, Split, FileText, Download, Compass];

const demoSteps = [
  "Launch Demo Mode and let the guided tour progress automatically",
  "Interact with LadyVioletGPT in the chat workspace",
  "Run verification on a response",
  "Compare independent model responses side by side",
  "Inspect the consensus judgement",
  "Review trust score and hallucination-risk metrics",
  "Examine the governance stream and detected divergences",
  "Export the verification report as a multi-page PDF",
];

const navItems = [
  ["overview", "Overview"],
  ["demo", "See It Working"],
  ["capabilities", "Capabilities"],
  ["package", "What You Acquire"],
  ["tech", "Technical"],
  ["status", "Status"],
  ["why", "Why Acquire"],
  ["buyers", "Buyer Fit"],
  ["terms", "Terms"],
  ["diligence", "Due Diligence"],
  ["process", "Process"],
  ["faq", "FAQ"],
  ["contact", "Contact"],
];

const categoryOrder: Asset["category"][] = ["Product", "AI", "Software", "Brand", "Documentation", "Other Assets"];
const categoryLabels: Record<string, string> = {
  Product: "Product",
  AI: "AI / Verification System",
  Software: "Software / Technical Assets",
  Brand: "Brand / Creative Assets",
  Documentation: "Documentation",
  "Other Assets": "Other Assets",
};

export default function AcquisitionHub() {
  const { data, updateSection } = useAcquisition();
  const { project, acquisition, capabilities, assets, technology, maturity, buyers, dueDiligence, faq } = data;

  const grouped = useMemo(
    () => categoryOrder.map((c) => ({ category: c, items: assets.filter((a) => a.category === c) })).filter((g) => g.items.length),
    [assets],
  );

  const [form, setForm] = useState({
    name: "", company: "", email: "", buyerType: "", interestedIn: "", budgetRange: "", timeline: "", message: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    updateSection("inquiries", [
      { id: `inq-${Date.now()}`, createdAt: new Date().toISOString(), ...form },
      ...data.inquiries,
    ]);
    toast.success("Inquiry recorded locally", {
      description: "Delivery destination is not configured yet — configure it in the owner panel to route inquiries.",
    });
    setForm({ name: "", company: "", email: "", buyerType: "", interestedIn: "", budgetRange: "", timeline: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="no-print sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-foreground">Pantheon Protocol</span>
          </div>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navItems.slice(0, 7).map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link to="/acquire/brief" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-xs"><Printer className="mr-1.5 h-3.5 w-3.5" />Brief</Button>
            </Link>
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="text-xs">Live Demo<ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="overview" className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(ellipse_at_20%_0%,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(ellipse_at_85%_20%,hsl(var(--secondary)/0.14),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3.5 py-1.5">
            <span className="status-dot h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-secondary">Asset available for acquisition</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {project.name}
            <span className="mt-2 block gradient-text-holo">Acquire the Working Foundation.</span>
          </h1>

          <p className="mt-5 max-w-2xl font-mono text-xs uppercase tracking-[0.2em] text-secondary/90">{project.tagline}</p>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            An existing AI-powered cybersecurity platform with a live interactive demonstration and operational multi-model verification workflow.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <Button size="lg" className="tracking-wide">Launch Live Demo<ExternalLink className="ml-2 h-4 w-4" /></Button>
            </a>
            <a href="#package">
              <Button size="lg" variant="secondary" className="tracking-wide">View Acquisition Package</Button>
            </a>
            <a href="#contact">
              <Button size="lg" variant="outline" className="tracking-wide">Request Information</Button>
            </a>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              ["Sale type", "Asset sale"],
              ["Asking price", acquisition.askingPrice],
              ["Availability", acquisition.availability],
            ].map(([k, v]) => (
              <Panel key={k} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{k}</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">{v}</p>
              </Panel>
            ))}
          </div>

          <div className="mt-6 max-w-3xl">
            <Disclaimer>{project.saleNote}</Disclaimer>
          </div>
        </div>
      </section>

      {/* PRODUCT OVERVIEW */}
      <Section id="product" eyebrow="Product overview" title="What Pantheon Protocol is" description={project.subtitle}>
        <Panel className="max-w-4xl">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{project.overview}</p>
        </Panel>
      </Section>

      {/* SEE IT WORKING */}
      <Section
        id="demo"
        eyebrow="See it working"
        title="Evaluate the product, not a pitch deck"
        description="The live application is the asset. A prospective buyer can run the workflow end to end in the browser."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel hover>
            <ol className="space-y-3">
              {demoSteps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel className="flex flex-col justify-between gap-6">
            <div>
              <StatusPill status="Complete" className="mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Live demonstration</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Opens the existing Pantheon Protocol application in a new tab. No screenshots are substituted for the working product.
              </p>
            </div>
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <Button className="w-full">Launch Live Demo<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </Panel>
        </div>
      </Section>

      {/* CAPABILITIES */}
      <Section id="capabilities" eyebrow="Existing capabilities" title="Implemented in the current application"
        description="Capability descriptions reflect what exists in the application today. Depth, coverage and production readiness of each area remain subject to buyer verification.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => {
            const Icon = capabilityIcons[i % capabilityIcons.length];
            return (
              <Panel key={c.id} hover className="flex flex-col gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">{c.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              </Panel>
            );
          })}
        </div>
      </Section>

      {/* PACKAGE */}
      <Section id="package" eyebrow="Acquisition inventory" title="What the buyer acquires"
        description="Nothing below is represented as verified until confirmed during due diligence. Transferability of third-party and platform-bound items must be reviewed individually.">
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.category}>
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-secondary/90">{categoryLabels[g.category]}</h3>
              <Panel className="overflow-x-auto p-0">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="p-4">Asset</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Transferable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((a) => (
                      <tr key={a.id} className="border-b border-border/25 last:border-0">
                        <td className="p-4 font-medium text-foreground">{a.asset}</td>
                        <td className="p-4 text-xs text-muted-foreground">{a.description}</td>
                        <td className="p-4"><StatusPill status={a.status} /></td>
                        <td className="p-4"><StatusPill status={a.transferable} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </div>
          ))}
          <Disclaimer>
            Credentials, API keys and access tokens are never published here. Any credential handover is transferred separately through a secure process.
          </Disclaimer>
        </div>
      </Section>

      {/* TECH */}
      <Section id="tech" eyebrow="Technical snapshot" title="Architecture summary"
        description="Only owner-entered values are shown. Unconfirmed fields display “To Verify”.">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            {technology.map((t) => (
              <DataRow key={t.id} label={t.field} value={t.value} status={t.status} />
            ))}
          </Panel>
          <div className="space-y-4">
            <Panel className="border-accent/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Technical and ownership details are being verified prior to transfer.
                </p>
              </div>
            </Panel>
            <Panel>
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Credentials transferred separately through secure process. No private repository URLs or service endpoints are exposed on this page unless explicitly marked public by the owner.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </Section>

      {/* STATUS */}
      <Section id="status" eyebrow="Current product status" title={project.statusHeadline}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="border-secondary/40">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-secondary">Live demonstration available</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.statusBody}</p>
          </Panel>
          <Panel className="p-0">
            <div className="divide-y divide-border/30">
              {maturity.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.category}</p>
                    {m.note && <p className="mt-0.5 text-xs text-muted-foreground">{m.note}</p>}
                  </div>
                  <StatusPill status={m.status} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Section>

      {/* WHY */}
      <Section id="why" eyebrow="Acquisition opportunity" title="Acquire the foundation. Accelerate the roadmap.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Rocket, t: "Start ahead of zero", d: "Acquire an existing product foundation instead of beginning the architecture from scratch." },
            { icon: Search, t: "See the system work", d: "The buyer can interact with the existing live demonstration rather than evaluating only screenshots or concept documents." },
            { icon: Layers, t: "Extend the foundation", d: "The existing architecture can serve as a starting point for further cybersecurity training, AI governance, verification, education, or enterprise applications." },
          ].map(({ icon: Icon, t, d }) => (
            <Panel key={t} hover className="flex flex-col gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold tracking-tight text-foreground">{t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{d}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* BUYERS */}
      <Section id="buyers" eyebrow="Potential buyer profile" title="Who this may fit"
        description="Illustrative buyer categories only. No specific company is represented as interested or in discussions.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buyers.map((b) => (
            <Panel key={b.id} hover className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{b.rationale}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* TERMS */}
      <Section id="terms" eyebrow="Acquisition details" title="Terms">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <DataRow label="Asking price" value={acquisition.askingPrice} />
            <DataRow label="Sale type" value="Asset sale" />
            <DataRow label="Asset availability" value={acquisition.assetStatus} />
            <DataRow label="Transfer timeline" value={acquisition.transferTimeline} />
            <DataRow label="Included support" value={acquisition.includedSupport} />
            <DataRow label="Negotiability" value={acquisition.negotiability} />
          </Panel>
          <Panel>
            <DataRow label="Contact" value={data.contact.contactName} />
            <DataRow label="Role" value={data.contact.contactRole} />
            <DataRow label="Preferred channel" value={data.contact.preferredChannel} />
            <DataRow label="Response time" value={data.contact.responseTime} />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Direct contact details are not published on this page. Use the inquiry form below.
            </p>
          </Panel>
        </div>
      </Section>

      {/* DILIGENCE */}
      <Section id="diligence" eyebrow="Due diligence" title="Buyer verification checklist">
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="p-4">Item</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Evidence</th>
                <th className="p-4">Last verified</th>
              </tr>
            </thead>
            <tbody>
              {dueDiligence.map((d) => (
                <tr key={d.id} className="border-b border-border/25 last:border-0">
                  <td className="p-4 font-medium text-foreground">{d.item}</td>
                  <td className="p-4"><StatusPill status={d.status} /></td>
                  <td className="p-4 text-xs text-muted-foreground">{d.notes || "—"}</td>
                  <td className="p-4 text-xs text-muted-foreground">{d.evidence || "—"}</td>
                  <td className="p-4 text-xs text-muted-foreground">{d.lastVerified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <div className="mt-4">
          <Disclaimer>Passwords, API keys, access tokens and private authentication information are never displayed in this package.</Disclaimer>
        </div>
      </Section>

      {/* PROCESS */}
      <Section id="process" eyebrow="Acquisition process" title="Five steps to transfer">
        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["01", "Review", "Explore the acquisition page and live demo."],
            ["02", "Discuss", "Buyer and seller discuss scope and terms."],
            ["03", "Due Diligence", "Verify included assets, ownership, dependencies, and transferability."],
            ["04", "Agreement", "Execute appropriate asset-purchase/transfer documentation."],
            ["05", "Transfer", "Transfer agreed assets and provide agreed support."],
          ].map(([n, t, d]) => (
            <Panel key={n} hover className="flex flex-col gap-2">
              <span className="font-mono text-xs text-primary">{n}</span>
              <h3 className="text-sm font-semibold text-foreground">{t}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{d}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6">
          <Disclaimer>Final transfer terms should be documented in a proper asset-purchase agreement prepared by qualified counsel.</Disclaimer>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Common buyer questions">
        <Panel>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left text-sm">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>
      </Section>

      {/* CONTACT */}
      <Section id="contact" eyebrow="Buyer contact" title="Request information"
        description="Submit an inquiry and the seller will follow up through the configured channel.">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Buyer type</Label>
                <Select value={form.buyerType} onValueChange={(v) => setForm({ ...form, buyerType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BUYER_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Interested in</Label>
                <Select value={form.interestedIn} onValueChange={(v) => setForm({ ...form, interestedIn: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{INTERESTED_IN.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Budget range</Label>
                <Select value={form.budgetRange} onValueChange={(v) => setForm({ ...form, budgetRange: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{BUDGET_RANGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Timeline</Label>
                <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TIMELINES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full sm:w-auto">Submit Inquiry</Button>
              </div>
            </form>
          </Panel>
          <div className="space-y-4">
            <Panel>
              <h3 className="text-sm font-semibold text-foreground">Delivery configuration</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {data.contact.inquiryDestination
                  ? "An inquiry destination is configured in the owner panel. Inquiries are also recorded in this browser session."
                  : "No inquiry destination is configured yet. Submitted inquiries are stored in this browser only and are not emailed anywhere. Configure delivery in the owner panel."}
              </p>
            </Panel>
            <Panel>
              <h3 className="text-sm font-semibold text-foreground">Acquisition brief</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Print-friendly summary suitable for saving as PDF.</p>
              <Link to="/acquire/brief"><Button variant="outline" className="mt-4 w-full">Open Brief<Printer className="ml-2 h-4 w-4" /></Button></Link>
            </Panel>
          </div>
        </div>
      </Section>

      <footer className="no-print border-t border-border/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-xs text-muted-foreground">
          <p>{project.name} — acquisition package. Information subject to verification. No customers, revenue, certifications or production guarantees are represented.</p>
          <Link to="/acquire/admin" className="underline hover:text-foreground">Owner panel</Link>
        </div>
      </footer>
    </div>
  );
}
