import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface TourStep {
  tab: string;
  targetId: string;
  title: string;
  body: string;
  prompt?: string; // optional sample prompt to inject (chat step only)
  durationMs?: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    tab: "chat",
    targetId: "tour-tab-chat",
    title: "1 / 9 — Chat",
    body: "Seven AI personas with persistent memory. Watch a sample prompt fire against LadyVioletGPT.",
    prompt: "Give me a 60-second tour of what you can teach me.",
    durationMs: 8000,
  },
  { tab: "academy", targetId: "tour-tab-academy", title: "2 / 9 — Academy", body: "Structured CTF courses, exercises, toolkits, and progress tracking." },
  { tab: "classroom", targetId: "tour-tab-classroom", title: "3 / 9 — Classroom", body: "Cohort dashboards with realtime leaderboards and instructor analytics." },
  { tab: "images", targetId: "tour-tab-images", title: "4 / 9 — Studio", body: "Multi-modal generation: SDXL, Nano-Banana, LoRA trainer, gallery." },
  { tab: "news", targetId: "tour-tab-news", title: "5 / 9 — InfoSec News", body: "Curated security feed pulled fresh on demand." },
  { tab: "games", targetId: "tour-tab-games", title: "6 / 9 — Arcade", body: "CIPHER_BREAK and HACK THE PLANET minigames feed your XP track." },
  { tab: "voice", targetId: "tour-tab-voice", title: "7 / 9 — Voice", body: "Hands-free voice assistant routed through the same persona engine." },
  { tab: "avatar", targetId: "tour-tab-avatar", title: "8 / 9 — Profile", body: "Profile, XP, and unlockable avatars earned through gameplay." },
  { tab: "settings", targetId: "tour-tab-settings", title: "9 / 9 — Settings", body: "Era skins, theming, agent customization, secrets and privacy." },
];

interface TourContextValue {
  running: boolean;
  stepIndex: number;
  step: TourStep | null;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export const DemoTourProvider = ({ children }: { children: ReactNode }) => {
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const start = useCallback(() => {
    setStepIndex(0);
    setRunning(true);
  }, []);
  const stop = useCallback(() => setRunning(false), []);
  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= TOUR_STEPS.length) {
        setRunning(false);
        return 0;
      }
      return i + 1;
    });
  }, []);
  const prev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  // Auto-advance
  useEffect(() => {
    if (!running) return;
    const s = TOUR_STEPS[stepIndex];
    const t = setTimeout(next, s.durationMs ?? 5000);
    return () => clearTimeout(t);
  }, [running, stepIndex, next]);

  const value = useMemo<TourContextValue>(
    () => ({
      running,
      stepIndex,
      step: running ? TOUR_STEPS[stepIndex] : null,
      start,
      stop,
      next,
      prev,
    }),
    [running, stepIndex, start, stop, next, prev],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useDemoTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useDemoTour must be used within DemoTourProvider");
  return ctx;
};
