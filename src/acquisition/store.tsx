import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultPackage, type PantheonPackage } from "./data";

const STORAGE_KEY = "pantheon-acquisition-package-v1";

interface Ctx {
  data: PantheonPackage;
  update: (patch: Partial<PantheonPackage>) => void;
  updateSection: <K extends keyof PantheonPackage>(key: K, value: PantheonPackage[K]) => void;
  reset: () => void;
  persistence: "local" | "none";
}

const AcquisitionContext = createContext<Ctx | null>(null);

function load(): PantheonPackage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPackage;
    const parsed = JSON.parse(raw);
    return { ...defaultPackage, ...parsed };
  } catch {
    return defaultPackage;
  }
}

export function AcquisitionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PantheonPackage>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — edits remain in-session only */
    }
  }, [data]);

  const value = useMemo<Ctx>(
    () => ({
      data,
      update: (patch) => setData((d) => ({ ...d, ...patch })),
      updateSection: (key, val) => setData((d) => ({ ...d, [key]: val })),
      reset: () => setData(defaultPackage),
      persistence: "local",
    }),
    [data],
  );

  return <AcquisitionContext.Provider value={value}>{children}</AcquisitionContext.Provider>;
}

export function useAcquisition() {
  const ctx = useContext(AcquisitionContext);
  if (!ctx) throw new Error("useAcquisition must be used inside AcquisitionProvider");
  return ctx;
}
