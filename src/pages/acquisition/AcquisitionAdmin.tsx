import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAcquisition } from "@/acquisition/store";
import type {
  Asset,
  AssetStatus,
  DueDiligenceItem,
  MaturityItem,
  MaturityStatus,
  Technology,
  Transferable,
  VerificationStatus,
} from "@/acquisition/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, Section, StatusPill } from "@/components/acquisition/AcqUI";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ASSET_STATUS: AssetStatus[] = ["Verified", "To Verify", "Excluded", "Unknown"];
const TRANSFERABLE: Transferable[] = ["Yes", "No", "Needs Review"];
const VERIF: VerificationStatus[] = ["Verified", "To Verify", "Unknown"];
const MATURITY: MaturityStatus[] = ["Complete", "Partial", "Prototype", "Planned", "Unknown"];
const DD_STATUS = ["Verified", "To Verify", "Unknown", "Requires Review", "Not Included"];

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</Label>
      {multiline ? (
        <Textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={4} />
      ) : (
        <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[160px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-xs">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AcquisitionAdmin() {
  const { data, update, updateSection, reset, persistence } = useAcquisition();

  const setProject = (patch: Partial<typeof data.project>) =>
    update({ project: { ...data.project, ...patch } });
  const setAcq = (patch: Partial<typeof data.acquisition>) =>
    update({ acquisition: { ...data.acquisition, ...patch } });
  const setContact = (patch: Partial<typeof data.contact>) =>
    update({ contact: { ...data.contact, ...patch } });

  const patchAsset = (id: string, patch: Partial<Asset>) =>
    updateSection("assets", data.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const patchTech = (id: string, patch: Partial<Technology>) =>
    updateSection("technology", data.technology.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const patchMaturity = (id: string, patch: Partial<MaturityItem>) =>
    updateSection("maturity", data.maturity.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const patchDD = (id: string, patch: Partial<DueDiligenceItem>) =>
    updateSection("dueDiligence", data.dueDiligence.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pantheon-acquisition-package.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Package exported");
  };

  const importJson = (file: File) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const parsed = JSON.parse(String(fr.result));
        update(parsed);
        toast.success("Package imported");
      } catch {
        toast.error("That file is not valid package JSON.");
      }
    };
    fr.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link
            to="/acquire"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Acquisition hub
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={exportJson}>
              Export <Download className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <label>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
              />
              <Button size="sm" variant="outline" className="text-xs" asChild>
                <span>
                  Import <Upload className="ml-1.5 h-3.5 w-3.5" />
                </span>
              </Button>
            </label>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => {
                reset();
                toast.success("Reset to defaults");
              }}
            >
              Reset <RotateCcw className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Section
        eyebrow="Owner panel"
        title="Edit the acquisition package"
        description={
          persistence === "local"
            ? "Changes are saved to this browser only — no backend is configured for the acquisition package. Use Export to keep a copy or move it to another device."
            : "Changes are held in this session only."
        }
      >
        <Tabs defaultValue="project">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
            <TabsTrigger value="terms" className="text-xs">Terms & Contact</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="tech" className="text-xs">Technology</TabsTrigger>
            <TabsTrigger value="state" className="text-xs">Current State</TabsTrigger>
            <TabsTrigger value="dd" className="text-xs">Due Diligence</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">FAQ & Links</TabsTrigger>
            <TabsTrigger value="inquiries" className="text-xs">
              Inquiries ({data.inquiries.length})
            </TabsTrigger>
          </TabsList>

          {/* Project */}
          <TabsContent value="project" className="mt-6">
            <Panel className="grid gap-4">
              <Field label="Name" value={data.project.name} onChange={(v) => setProject({ name: v })} />
              <Field label="Tagline" value={data.project.tagline} onChange={(v) => setProject({ tagline: v })} />
              <Field label="One-sentence summary" multiline value={data.project.oneSentence} onChange={(v) => setProject({ oneSentence: v })} />
              <Field label="Subtitle" multiline value={data.project.subtitle} onChange={(v) => setProject({ subtitle: v })} />
              <Field label="Overview" multiline value={data.project.overview} onChange={(v) => setProject({ overview: v })} />
              <Field label="Asset-sale note" multiline value={data.project.saleNote} onChange={(v) => setProject({ saleNote: v })} />
              <Field label="Status headline" value={data.project.statusHeadline} onChange={(v) => setProject({ statusHeadline: v })} />
              <Field label="Status body" multiline value={data.project.statusBody} onChange={(v) => setProject({ statusBody: v })} />
              <Field label="Remaining work" multiline value={data.project.remainingWork} onChange={(v) => setProject({ remainingWork: v })} />
              <Field label="Reason for sale" multiline value={data.project.reasonForSale} onChange={(v) => setProject({ reasonForSale: v })} />
              <Field label="Live demo path or URL" value={data.project.demoUrl} onChange={(v) => setProject({ demoUrl: v })} />
            </Panel>
          </TabsContent>

          {/* Terms & contact */}
          <TabsContent value="terms" className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel className="grid gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary/80">Acquisition terms</p>
              <Field label="Asking price" value={data.acquisition.askingPrice} onChange={(v) => setAcq({ askingPrice: v })} />
              <Field label="Asset status" value={data.acquisition.assetStatus} onChange={(v) => setAcq({ assetStatus: v })} />
              <Field label="Availability" value={data.acquisition.availability} onChange={(v) => setAcq({ availability: v })} />
              <Field label="Transfer timeline" value={data.acquisition.transferTimeline} onChange={(v) => setAcq({ transferTimeline: v })} />
              <Field label="Included support" value={data.acquisition.includedSupport} onChange={(v) => setAcq({ includedSupport: v })} />
              <Field label="Negotiability" value={data.acquisition.negotiability} onChange={(v) => setAcq({ negotiability: v })} />
            </Panel>
            <Panel className="grid gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary/80">Contact</p>
              <Field label="Contact name" value={data.contact.contactName} onChange={(v) => setContact({ contactName: v })} />
              <Field label="Role" value={data.contact.contactRole} onChange={(v) => setContact({ contactRole: v })} />
              <Field
                label="Inquiry destination (private — never shown publicly)"
                value={data.contact.inquiryDestination}
                placeholder="you@example.com"
                onChange={(v) => setContact({ inquiryDestination: v })}
              />
              <Field label="Response time" value={data.contact.responseTime} onChange={(v) => setContact({ responseTime: v })} />
              <Field label="Preferred channel" value={data.contact.preferredChannel} onChange={(v) => setContact({ preferredChannel: v })} />
            </Panel>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory" className="mt-6 grid gap-3">
            {data.assets.map((a) => (
              <Panel key={a.id} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{a.asset}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{a.category}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Picker value={a.status} options={ASSET_STATUS} onChange={(v) => patchAsset(a.id, { status: v as AssetStatus })} />
                  <Picker value={a.transferable} options={TRANSFERABLE} onChange={(v) => patchAsset(a.id, { transferable: v as Transferable })} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Location" value={a.location} onChange={(v) => patchAsset(a.id, { location: v })} />
                  <Field label="Evidence" value={a.evidence} onChange={(v) => patchAsset(a.id, { evidence: v })} />
                </div>
                <Field label="Notes" value={a.notes} onChange={(v) => patchAsset(a.id, { notes: v })} />
              </Panel>
            ))}
          </TabsContent>

          {/* Technology */}
          <TabsContent value="tech" className="mt-6 grid gap-3">
            {data.technology.map((t) => (
              <Panel key={t.id} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <Field label={t.field} value={t.value} onChange={(v) => patchTech(t.id, { value: v })} />
                </div>
                <Picker value={t.status} options={VERIF} onChange={(v) => patchTech(t.id, { status: v as VerificationStatus })} />
              </Panel>
            ))}
          </TabsContent>

          {/* Current state */}
          <TabsContent value="state" className="mt-6 grid gap-3">
            {data.maturity.map((m) => (
              <Panel key={m.id} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <Field label={m.category} value={m.note} placeholder="Note" onChange={(v) => patchMaturity(m.id, { note: v })} />
                </div>
                <Picker value={m.status} options={MATURITY} onChange={(v) => patchMaturity(m.id, { status: v as MaturityStatus })} />
              </Panel>
            ))}
          </TabsContent>

          {/* Due diligence */}
          <TabsContent value="dd" className="mt-6 grid gap-3">
            {data.dueDiligence.map((d) => (
              <Panel key={d.id} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{d.item}</span>
                  <Picker
                    value={d.status}
                    options={DD_STATUS}
                    onChange={(v) => patchDD(d.id, { status: v as DueDiligenceItem["status"] })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Notes" value={d.notes} onChange={(v) => patchDD(d.id, { notes: v })} />
                  <Field label="Evidence" value={d.evidence} onChange={(v) => patchDD(d.id, { evidence: v })} />
                  <Field label="Last verified" value={d.lastVerified} onChange={(v) => patchDD(d.id, { lastVerified: v })} />
                </div>
              </Panel>
            ))}
          </TabsContent>

          {/* FAQ & links */}
          <TabsContent value="content" className="mt-6 grid gap-3">
            {data.faq.map((f) => (
              <Panel key={f.id} className="grid gap-3">
                <Field
                  label="Question"
                  value={f.question}
                  onChange={(v) => updateSection("faq", data.faq.map((x) => (x.id === f.id ? { ...x, question: v } : x)))}
                />
                <Field
                  label="Answer"
                  multiline
                  value={f.answer}
                  onChange={(v) => updateSection("faq", data.faq.map((x) => (x.id === f.id ? { ...x, answer: v } : x)))}
                />
              </Panel>
            ))}
            {data.links.map((l) => (
              <Panel key={l.id} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <Field
                    label={`${l.label} link`}
                    value={l.url}
                    onChange={(v) => updateSection("links", data.links.map((x) => (x.id === l.id ? { ...x, url: v } : x)))}
                  />
                </div>
                <Picker
                  value={l.visibility}
                  options={["Public", "Private"]}
                  onChange={(v) =>
                    updateSection(
                      "links",
                      data.links.map((x) => (x.id === l.id ? { ...x, visibility: v as "Public" | "Private" } : x)),
                    )
                  }
                />
              </Panel>
            ))}
          </TabsContent>

          {/* Inquiries */}
          <TabsContent value="inquiries" className="mt-6 grid gap-3">
            {data.inquiries.length === 0 && (
              <Panel>
                <p className="text-sm text-muted-foreground">No inquiries recorded in this browser yet.</p>
              </Panel>
            )}
            {data.inquiries.map((q) => (
              <Panel key={q.id} className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {q.name} {q.company && `— ${q.company}`}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {new Date(q.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{q.email}</p>
                <div className="flex flex-wrap gap-1.5">
                  <StatusPill status={q.buyerType || "Unknown"} />
                  <StatusPill status={q.interestedIn || "Unknown"} />
                  <StatusPill status={q.budgetRange || "Unknown"} />
                  <StatusPill status={q.timeline || "Unknown"} />
                </div>
                {q.message && <p className="text-sm leading-relaxed text-foreground/90">{q.message}</p>}
              </Panel>
            ))}
            <Button
              variant="outline"
              className="justify-self-start text-xs"
              onClick={() => {
                updateSection("inquiries", []);
                toast.success("Inquiries cleared");
              }}
            >
              Clear inquiries
            </Button>
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  );
}
