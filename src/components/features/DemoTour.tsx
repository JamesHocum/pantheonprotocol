import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDemoTour, TOUR_STEPS } from "@/contexts/DemoTourContext";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface Rect { top: number; left: number; width: number; height: number }

export const DemoTour = () => {
  const { running, step, stepIndex, next, prev, stop } = useDemoTour();
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!running || !step) { setRect(null); return; }
    let raf = 0;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour-id="${step.targetId}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [running, step]);

  if (!running || !step) return null;

  const pad = 8;
  const spotlight: React.CSSProperties = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : { top: 80, left: 16, width: 280, height: 48 };

  const tipTop = rect
    ? Math.min(window.innerHeight - 240, rect.top + rect.height + 16)
    : 120;
  const tipLeft = rect
    ? Math.max(16, Math.min(window.innerWidth - 380, rect.left))
    : 16;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dim overlay with cutout shadow */}
      <div
        className="absolute rounded-lg pointer-events-auto"
        style={{
          ...spotlight,
          boxShadow: "0 0 0 9999px hsl(var(--background) / 0.78), 0 0 0 2px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.6)",
          transition: "all 400ms cubic-bezier(.2,.7,.2,1)",
        }}
      />
      {/* Tooltip card */}
      <div
        className="absolute pointer-events-auto holo-card scanline p-4 w-[360px] max-w-[92vw] border border-primary/60"
        style={{ top: tipTop, left: tipLeft }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-primary">Demo Mode</div>
            <h3 className="text-sm font-bold gradient-text-holo mt-0.5">{step.title}</h3>
          </div>
          <button onClick={stop} className="text-muted-foreground hover:text-foreground" aria-label="End tour">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs font-mono text-muted-foreground leading-relaxed">{step.body}</p>
        {step.prompt && (
          <div className="mt-2 text-[11px] font-mono text-primary/80 border-l-2 border-primary pl-2">
            ▸ Auto-prompt: “{step.prompt}”
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-4 rounded-full ${i === stepIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <CyberpunkButton variant="ghost" size="sm" onClick={prev} disabled={stepIndex === 0}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </CyberpunkButton>
            <CyberpunkButton variant="neon" size="sm" onClick={next}>
              {stepIndex + 1 >= TOUR_STEPS.length ? "Finish" : "Next"}
              <ChevronRight className="h-3.5 w-3.5" />
            </CyberpunkButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const DemoTourTrigger = () => {
  const { start, running } = useDemoTour();
  return (
    <CyberpunkButton
      variant="neon"
      size="sm"
      onClick={start}
      disabled={running}
      title="Run the platform walkthrough"
    >
      <Play className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Demo Mode</span>
    </CyberpunkButton>
  );
};
