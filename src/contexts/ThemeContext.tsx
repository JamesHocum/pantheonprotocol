import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EraTheme = '1980s' | '1990s' | '2000s' | '2020s';

interface Badge {
  id: string;
  name: string;
  earnedAt: string;
  unlocksEra?: EraTheme;
}

interface ThemeContextType {
  currentEra: EraTheme;
  setEra: (era: EraTheme) => void;
  isEraUnlocked: (era: EraTheme) => boolean;
  unlockedEras: EraTheme[];
  badges: Badge[];
  /** Neon glow intensity 0–100 */
  neonIntensity: number;
  setNeonIntensity: (value: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const BADGE_ERA_UNLOCKS: Record<string, EraTheme> = {
  crypto_rookie: '1990s',
  master_hacker: '1980s',
  triple_threat: '2000s',
  pantheon_elite: '1980s',
};

const NEON_KEY = 'pp_neon_intensity';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentEra, setCurrentEra] = useState<EraTheme>('2020s');
  const [unlockedEras, setUnlockedEras] = useState<EraTheme[]>(['2020s']);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [neonIntensity, setNeonIntensityState] = useState<number>(() => {
    if (typeof window === 'undefined') return 60;
    const saved = window.localStorage.getItem(NEON_KEY);
    const n = saved !== null ? Number(saved) : 60;
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 60;
  });

  // Sync intensity to CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--neon-intensity', String(neonIntensity / 100));
  }, [neonIntensity]);

  const setNeonIntensity = (value: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    setNeonIntensityState(clamped);
    try { window.localStorage.setItem(NEON_KEY, String(clamped)); } catch {}
  };

  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_era')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.theme_era) setCurrentEra(profile.theme_era as EraTheme);

        const { data: xpData } = await supabase
          .from('user_xp')
          .select('badges')
          .eq('user_id', user.id)
          .maybeSingle();

        if (xpData?.badges && Array.isArray(xpData.badges)) {
          const userBadges = xpData.badges as unknown as Badge[];
          setBadges(userBadges);

          const unlocked: EraTheme[] = ['2020s'];
          let allUnlocked = false;
          userBadges.forEach((badge: Badge) => {
            const unlockedEra = BADGE_ERA_UNLOCKS[badge.id];
            if (unlockedEra && !unlocked.includes(unlockedEra)) unlocked.push(unlockedEra);
            if (badge.id === 'pantheon_elite') allUnlocked = true;
          });
          setUnlockedEras(allUnlocked ? ['1980s', '1990s', '2000s', '2020s'] : unlocked);
        }
      } else {
        setUnlockedEras(['1980s', '1990s', '2000s', '2020s']);
        const savedEra = localStorage.getItem('theme_era');
        if (savedEra) setCurrentEra(savedEra as EraTheme);
      }
    };

    loadTheme();
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-era', currentEra);
  }, [currentEra]);

  const setEra = async (era: EraTheme) => {
    if (!isEraUnlocked(era)) return;

    setCurrentEra(era);
    localStorage.setItem('theme_era', era);

    if (user) {
      await supabase.from('profiles').update({ theme_era: era }).eq('id', user.id);
    }
  };

  const isEraUnlocked = (era: EraTheme): boolean => unlockedEras.includes(era);

  return (
    <ThemeContext.Provider
      value={{
        currentEra,
        setEra,
        isEraUnlocked,
        unlockedEras,
        badges,
        neonIntensity,
        setNeonIntensity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
