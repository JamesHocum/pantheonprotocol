import { Trophy, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useXP } from '@/hooks/useXP';
import { cn } from '@/lib/utils';

export const LevelBadges = () => {
  const { badges, BADGE_DEFINITIONS } = useXP();

  const earnedIds = new Set(badges.map(b => b.id));

  const allBadges = Object.values(BADGE_DEFINITIONS).map(def => ({
    ...def,
    earned: earnedIds.has(def.id),
    earnedAt: badges.find(b => b.id === def.id)?.earnedAt,
  }));

  // Sort: earned first, then by name
  allBadges.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-secondary" />
        <h3 className="text-lg font-bold text-foreground">Achievement Badges</h3>
        <Badge variant="secondary" className="text-xs">
          {badges.length}/{allBadges.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allBadges.map((badge) => (
          <Card
            key={badge.id}
            className={cn(
              'p-4 transition-all duration-300 glass-morphism',
              badge.earned 
                ? 'border-secondary/50 bg-secondary/5' 
                : 'opacity-50 grayscale'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'text-3xl',
                badge.earned ? '' : 'opacity-40'
              )}>
                {badge.earned ? badge.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    'font-bold text-sm truncate',
                    badge.earned ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {badge.name}
                  </h4>
                  {badge.unlocksEra && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      🎨 {badge.unlocksEra}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {badge.description}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="text-[10px] text-secondary/80 font-mono mt-2">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
