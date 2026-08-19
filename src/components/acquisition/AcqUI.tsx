import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ---------- Status pill ---------- */
const statusStyles: Record<string, string> = {
  Verified: "border-secondary/50 bg-secondary/10 text-secondary",
  Complete: "border-secondary/50 bg-secondary/10 text-secondary",
  Yes: "border-secondary/50 bg-secondary/10 text-secondary",
  Partial: "border-primary/50 bg-primary/10 text-primary",
  Prototype: "border-primary/50 bg-primary/10 text-primary",
  "To Verify": "border-accent/50 bg-accent/10 text-accent",
  "Needs Review": "border-accent/50 bg-accent/10 text-accent",
  Planned: "border-border bg-muted/50 text-muted-foreground",
  Unknown: "border-border bg-muted/40 text-muted-foreground",
  "Not Provided": "border-border bg-muted/40 text-muted-foreground",
  Excluded: "border-destructive/50 bg-destructive/10 text-destructive",
  "Not Included": "border-destructive/50 bg-destructive/10 text-destructive",
  No: "border-destructive/50 bg-destructive/10 text-destructive",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        statusStyles[status] ?? "border-border bg-muted/40 text-muted-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}

/* ---------- Section wrapper ---------- */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 md:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-5">
        <header className="mb-8 max-w-3xl">
          {eyebrow && (
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] text-secondary/80">{eyebrow}</p>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
          {description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/* ---------- Panel ---------- */
export function Panel({ children, className, hover }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={cn("holo-card p-5 md:p-6", hover && "holo-card-hover", className)}>{children}</div>;
}

/* ---------- Key/value row ---------- */
export function DataRow({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-sm text-foreground">
        {value || "Not Provided"}
        {status && <StatusPill status={status} />}
      </span>
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 text-xs leading-relaxed text-accent-foreground/90">
      <span className="font-mono uppercase tracking-[0.2em] text-accent">Notice — </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
