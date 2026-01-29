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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Badge definitions with era unlocks
const BADGE_ERA_UNLOCKS: Record<string, EraTheme> = {
  'crypto_rookie': '1990s',
  'master_hacker': '1980s',
  'triple_threat': '2000s',
  'pantheon_elite': '1980s', // Unlocks all
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentEra, setCurrentEra] = useState<EraTheme>('2020s');
  const [unlockedEras, setUnlockedEras] = useState<EraTheme[]>(['2020s']);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Load theme and badges from Supabase or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_era')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.theme_era) {
          setCurrentEra(profile.theme_era as EraTheme);
        }

        // Load badges from user_xp
        const { data: xpData } = await supabase
          .from('user_xp')
          .select('badges')
          .eq('user_id', user.id)
          .maybeSingle();

        if (xpData?.badges && Array.isArray(xpData.badges)) {
          const userBadges = xpData.badges as unknown as Badge[];
          setBadges(userBadges);
          
          // Calculate unlocked eras from badges
          const unlocked: EraTheme[] = ['2020s'];
          userBadges.forEach((badge: Badge) => {
            const unlockedEra = BADGE_ERA_UNLOCKS[badge.id];
            if (unlockedEra && !unlocked.includes(unlockedEra)) {
              unlocked.push(unlockedEra);
            }
            // Pantheon Elite unlocks all
            if (badge.id === 'pantheon_elite') {
              setUnlockedEras(['1980s', '1990s', '2000s', '2020s']);
              return;
            }
          });
          setUnlockedEras(unlocked);
        }
      } else {
        // Use localStorage for anonymous users
        const savedEra = localStorage.getItem('theme_era');
        if (savedEra) {
          setCurrentEra(savedEra as EraTheme);
        }
      }
    };

    loadTheme();
  }, [user]);

  // Apply era class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-era', currentEra);
  }, [currentEra]);

  const setEra = async (era: EraTheme) => {
    if (!isEraUnlocked(era)) return;
    
    setCurrentEra(era);
    localStorage.setItem('theme_era', era);

    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_era: era })
        .eq('id', user.id);
    }
  };

  const isEraUnlocked = (era: EraTheme): boolean => {
    return unlockedEras.includes(era);
  };

  return (
    <ThemeContext.Provider value={{ currentEra, setEra, isEraUnlocked, unlockedEras, badges }}>
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
