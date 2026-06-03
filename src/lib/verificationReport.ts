import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { assistants, type AssistantKey } from "@/lib/assistants";

export interface VerifyMetrics {
  consensus_score: number;
  trust_score: number;
  hallucination_risk: number;
  governance_stream: Array<{ stage: string; status: "pass" | "warn" | "fail"; detail: string }>;
  summary: string;
  divergences: string[];
}

export interface VerifyResult {
  verified_at: string;
  original_model: string | null;
  assistant_key: string | null;
  prompt: string;
  original_response: string;
  consensus_models: string[];
  judge_model: string;
  independent_answers: Array<{ model: string; answer: string; ok: boolean; error?: string }>;
  metrics: VerifyMetrics;
}

export async function runVerification(args: {
  prompt: string;
  originalResponse: string;
  systemPrompt?: string;
  assistantKey?: AssistantKey;
  originalModel?: string;
}): Promise<VerifyResult> {
  const { data, error } = await supabase.functions.invoke("verify-consensus", {
    body: args,
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as VerifyResult;
}

// ----- PDF rendering -----

const PURPLE: [number, number, number] = [124, 58, 237];
const GREEN: [number, number, number] = [16, 185, 129];
const AMBER: [number, number, number] = [245, 158, 11];
const RED: [number, number, number] = [239, 68, 68];
const INK: [number, number, number] = [30, 30, 40];
const MUTE: [number, number, number] = [110, 110, 130];

function statusColor(s: string): [number, number, number] {
  if (s === "pass") return GREEN;
  if (s === "warn") return AMBER;
  if (s === "fail") return RED;
  return MUTE;
}

function scoreColor(score: number, invert = false): [number, number, number] {
  const v = invert ? 100 - score : score;
  if (v >= 75) return GREEN;
  if (v >= 45) return AMBER;
  return RED;
}

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text || "", maxWidth);
}

export function buildVerificationPDF(r: VerifyResult): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const assistantName =
    r.assistant_key && (assistants as any)[r.assistant_key]
      ? (assistants as any)[r.assistant_key].name
      : "Pantheon Protocol";

  // Header bar
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PANTHEON PROTOCOL", M, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Verification Report", M, 50);
  doc.text(new Date(r.verified_at).toLocaleString(), W - M, 50, { align: "right" });

  y = 100;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Source: ${assistantName} (${r.original_model ?? "n/a"})`, M, y);
  y += 18;

  // Metrics cards
  const cardW = (W - M * 2 - 16) / 3;
  const cards = [
    { label: "Consensus", value: r.metrics.consensus_score, color: scoreColor(r.metrics.consensus_score) },
    { label: "Trust Score", value: r.metrics.trust_score, color: scoreColor(r.metrics.trust_score) },
    { label: "Hallucination Risk", value: r.metrics.hallucination_risk, color: scoreColor(r.metrics.hallucination_risk, true) },
  ];
  cards.forEach((c, i) => {
    const x = M + i * (cardW + 8);
    doc.setDrawColor(220);
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(x, y, cardW, 76, 6, 6, "FD");
    doc.setFontSize(9);
    doc.setTextColor(...MUTE);
    doc.setFont("helvetica", "normal");
    doc.text(c.label.toUpperCase(), x + 12, y + 18);
    doc.setFontSize(28);
    doc.setTextColor(...c.color);
    doc.setFont("helvetica", "bold");
    doc.text(`${Math.round(c.value)}`, x + 12, y + 52);
    doc.setFontSize(10);
    doc.setTextColor(...MUTE);
    doc.text("/ 100", x + 12 + doc.getTextWidth(`${Math.round(c.value)}`) + 4, y + 52);
    // mini bar
    const barW = cardW - 24;
    doc.setFillColor(230, 230, 235);
    doc.rect(x + 12, y + 62, barW, 6, "F");
    doc.setFillColor(...c.color);
    doc.rect(x + 12, y + 62, Math.max(2, (barW * c.value) / 100), 6, "F");
  });
  y += 92;

  // Summary
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.text("Verdict", M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  const sumLines = wrap(doc, r.metrics.summary || "—", W - M * 2);
  doc.text(sumLines, M, y);
  y += sumLines.length * 13 + 10;

  // Prompt
  doc.setFont("helvetica", "bold");
  doc.text("Prompt", M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTE);
  const promptLines = wrap(doc, r.prompt, W - M * 2);
  doc.text(promptLines.slice(0, 8), M, y);
  y += Math.min(promptLines.length, 8) * 12 + 10;

  // Original response (truncated)
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.text("Original Response", M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  const respLines = wrap(doc, r.original_response, W - M * 2).slice(0, 18);
  doc.text(respLines, M, y);
  y += respLines.length * 12 + 12;

  // Governance stream
  if (y > H - 200) { doc.addPage(); y = M; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Governance Stream", M, y);
  y += 16;
  doc.setFontSize(9);
  r.metrics.governance_stream.forEach((g) => {
    if (y > H - 60) { doc.addPage(); y = M; }
    const [rr, gg, bb] = statusColor(g.status);
    doc.setFillColor(rr, gg, bb);
    doc.circle(M + 4, y - 3, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(`${g.stage.toUpperCase()}  [${g.status.toUpperCase()}]`, M + 16, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTE);
    const dl = wrap(doc, g.detail, W - M * 2 - 16);
    doc.text(dl, M + 16, y);
    y += dl.length * 11 + 6;
  });

  // Divergences
  if (r.metrics.divergences?.length) {
    if (y > H - 120) { doc.addPage(); y = M; }
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("Divergences", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    r.metrics.divergences.forEach((d) => {
      if (y > H - 50) { doc.addPage(); y = M; }
      const lines = wrap(doc, `• ${d}`, W - M * 2);
      doc.text(lines, M, y);
      y += lines.length * 11 + 4;
    });
  }

  // Independent answers (new page)
  doc.addPage();
  y = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text("Independent Re-runs", M, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...MUTE);
  doc.text(`Judge: ${r.judge_model}`, M, y + 12);
  y += 24;

  r.independent_answers.forEach((a, i) => {
    if (y > H - 100) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(`Model ${i + 1}: ${a.model} ${a.ok ? "" : "(failed)"}`, M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTE);
    const content = a.ok ? a.answer : (a.error || "no response");
    const lines = wrap(doc, content, W - M * 2).slice(0, 24);
    doc.text(lines, M, y);
    y += lines.length * 11 + 14;
  });

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...MUTE);
    doc.text("Pantheon Protocol — Verification Report", M, H - 20);
    doc.text(`Page ${p}/${pages}`, W - M, H - 20, { align: "right" });
  }

  return doc;
}

export async function downloadVerificationReport(args: {
  prompt: string;
  originalResponse: string;
  systemPrompt?: string;
  assistantKey?: AssistantKey;
  originalModel?: string;
  filename?: string;
}) {
  const result = await runVerification(args);
  const doc = buildVerificationPDF(result);
  const name =
    args.filename ||
    `pantheon-verification-${new Date(result.verified_at).toISOString().replace(/[:.]/g, "-")}.pdf`;
  doc.save(name);
  return result;
}
