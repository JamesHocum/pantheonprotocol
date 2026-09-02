import { Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { useAcquisition } from "@/acquisition/store";
import { StatusPill, Disclaimer } from "@/components/acquisition/AcqUI";
import { Button } from "@/components/ui/button";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-avoid-break mb-10">
      <h2 className="mb-4 border-b border-border/60 pb-2 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-border/40 py-2 text-sm last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "Not Provided"}</span>
    </div>
  );
}

export default function AcquisitionBrief() {
  const { data } = useAcquisition();
  const { project, acquisition, contact } = data;

  const categories = ["Product", "AI", "Software", "Brand", "Documentation", "Other Assets"] as const;

  return (
    <div className="print-root min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
          <Link to="/acquire" className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to hub
          </Link>
          <Button size="sm" onClick={() => window.print()} className="text-xs">
            Print / Save as PDF <Printer className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 py-10 md:py-14">
        {/* Cover */}
        <div className="print-page mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-secondary/80">Acquisition brief</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{project.name}</h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{project.tagline}</p>
          <p className="mt-6 text-sm leading-relaxed text-foreground/90">{project.oneSentence}</p>
          <div className="mt-8 grid gap-1 rounded-lg border border-border/60 p-5 print-panel">
            <KV label="Asset status" value={acquisition.assetStatus} />
            <KV label="Asking price" value={acquisition.askingPrice} />
            <KV label="Availability" value={acquisition.availability} />
            <KV label="Transfer timeline" value={acquisition.transferTimeline} />
            <KV label="Prepared by" value={`${contact.contactName} — ${contact.contactRole}`} />
          </div>
          <div className="mt-6">
            <Disclaimer>{project.saleNote}</Disclaimer>
          </div>
        </div>

        <Block title="Overview">
          <p className="text-sm leading-relaxed text-muted-foreground">{project.overview}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.subtitle}</p>
        </Block>

        <Block title="Current State">
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{project.statusBody}</p>
          <div className="grid gap-1">
            {data.maturity.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                <span className="text-sm text-foreground">{m.category}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {m.note}
                  <StatusPill status={m.status} />
                </span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Implemented Capabilities">
          <ul className="grid gap-2 md:grid-cols-2">
            {data.capabilities.map((c) => (
              <li key={c.id} className="rounded-lg border border-border/50 p-3 print-panel">
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              </li>
            ))}
          </ul>
        </Block>

        <div className="print-page" />

        <Block title="Acquisition Inventory">
          {categories.map((cat) => {
            const rows = data.assets.filter((a) => a.category === cat);
            if (!rows.length) return null;
            return (
              <div key={cat} className="print-avoid-break mb-6">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-secondary/80">{cat}</p>
                <div className="grid gap-1">
                  {rows.map((a) => (
                    <div key={a.id} className="border-b border-border/40 py-2 last:border-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-foreground">{a.asset}</span>
                        <span className="flex items-center gap-1.5">
                          <StatusPill status={a.status} />
                          <StatusPill status={a.transferable} />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Block>

        <Block title="Technical Snapshot">
          <div className="grid gap-1">
            {data.technology.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t.field}</span>
                <span className="flex items-center gap-2 text-sm text-foreground">
                  {t.value || "Not Provided"} <StatusPill status={t.status} />
                </span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buyer Fit">
          <ul className="grid gap-2 md:grid-cols-2">
            {data.buyers.map((b) => (
              <li key={b.id} className="rounded-lg border border-border/50 p-3 print-panel">
                <p className="text-sm font-medium text-foreground">{b.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.rationale}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Acquisition Terms">
          <div className="grid gap-1">
            <KV label="Asking price" value={acquisition.askingPrice} />
            <KV label="Negotiability" value={acquisition.negotiability} />
            <KV label="Availability" value={acquisition.availability} />
            <KV label="Transfer timeline" value={acquisition.transferTimeline} />
            <KV label="Included support" value={acquisition.includedSupport} />
            <KV label="Reason for sale" value={project.reasonForSale} />
            <KV label="Remaining work" value={project.remainingWork} />
          </div>
        </Block>

        <Block title="Due Diligence Checklist">
          <div className="grid gap-1">
            {data.dueDiligence.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                <span className="text-sm text-foreground">{d.item}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {d.lastVerified} <StatusPill status={d.status} />
                </span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Evidence Register">
          <div className="grid gap-1">
            {data.evidence.map((e) => (
              <div key={e.id} className="border-b border-border/40 py-2 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{e.claim}</span>
                  <StatusPill status={e.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.type} — {e.location}
                </p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Frequently Asked Questions">
          <div className="grid gap-4">
            {data.faq.map((f) => (
              <div key={f.id} className="print-avoid-break">
                <p className="text-sm font-medium text-foreground">{f.question}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Contact">
          <div className="grid gap-1">
            <KV label="Contact" value={contact.contactName} />
            <KV label="Role" value={contact.contactRole} />
            <KV label="Preferred channel" value={contact.preferredChannel} />
            <KV label="Response time" value={contact.responseTime} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Inquiries are submitted through the acquisition hub inquiry form. Direct contact details are shared during buyer discussions.
          </p>
        </Block>

        <div className="mt-10">
          <Disclaimer>
            All statuses in this brief reflect the seller's current assessment and are subject to verification during due
            diligence. Nothing herein constitutes a representation, warranty, or offer to sell.
          </Disclaimer>
        </div>
      </div>
    </div>
  );
}
