import { Lock, Check, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme, EraTheme } from '@/contexts/ThemeContext';
import { useEraSound } from '@/hooks/useEraSound';
import { cn } from '@/lib/utils';

interface EraConfig {
  id: EraTheme;
  name: string;
  description: string;
  colors: string[];
  unlockRequirement: string;
}

const ERA_CONFIGS: EraConfig[] = [
  {
    id: '1980s',
    name: 'Arcade Era',
    description: 'Neon pink & cyan, CRT scanlines, retro arcade vibes',
    colors: ['#FF1493', '#00FFFF', '#1a0a1a'],
    unlockRequirement: 'Master Hacker badge',
  },
  {
    id: '1990s',
    name: 'Matrix Era',
    description: 'Matrix green, terminal aesthetic, digital rain',
    colors: ['#00FF41', '#9400D3', '#0a0f0a'],
    unlockRequirement: 'Crypto Rookie badge',
  },
  {
    id: '2000s',
    name: 'Web 2.0 Era',
    description: 'Royal blue & orange, glossy buttons, gradients',
    colors: ['#4169E1', '#FF4500', '#1a1a2e'],
    unlockRequirement: 'Triple Threat badge',
  },
  {
    id: '2020s',
    name: 'Cyberpunk Era',
    description: 'Purple & neon green, glass morphism, current default',
    colors: ['#8B5CF6', '#00FF41', '#0a0a0f'],
    unlockRequirement: 'Always unlocked',
  },
];

export const EraSkinToggle = () => {
  const { currentEra, setEra, isEraUnlocked } = useTheme();
  const { playClick, playSuccess } = useEraSound();
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('era_sounds_enabled') !== 'false'
  );

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('era_sounds_enabled', String(enabled));
  };

  const handleSelectEra = (era: EraTheme) => {
    if (!isEraUnlocked(era)) return;
    playClick();
    setEra(era);
    playSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-primary neon-text">Era Skin Selection</h3>
        <p className="text-sm text-muted-foreground font-mono">
          Unlock themes by earning badges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ERA_CONFIGS.map((era) => {
          const unlocked = isEraUnlocked(era.id);
          const selected = currentEra === era.id;

          return (
            <Card
              key={era.id}
              onClick={() => handleSelectEra(era.id)}
              className={cn(
                'relative p-4 cursor-pointer transition-all duration-300 glass-morphism',
                unlocked ? 'hover:scale-102 hover:shadow-lg' : 'opacity-60 cursor-not-allowed',
                selected && 'ring-2 ring-primary neon-border'
              )}
            >
              {/* Color preview bar */}
              <div className="flex h-8 rounded-md overflow-hidden mb-3">
                {era.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Era info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground">{era.name}</h4>
                  {selected ? (
                    <Check className="h-5 w-5 text-secondary" />
                  ) : !unlocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {era.description}
                </p>
              </div>

              {/* Unlock requirement */}
              {!unlocked && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs text-primary/80 font-mono">
                    🔒 Unlock: {era.unlockRequirement}
                  </p>
                </div>
              )}

              {/* Selected indicator */}
              {selected && (
                <div className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  ACTIVE
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sound Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
        <div className="flex items-center gap-2">
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
          <label className="text-sm font-mono text-foreground">Era Sound Effects</label>
        </div>
        <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
      </div>
    </div>
  );
};
