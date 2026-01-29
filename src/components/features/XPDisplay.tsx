import { Star, Trophy, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useXP } from '@/hooks/useXP';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  compact?: boolean;
  showBadges?: boolean;
}

export const XPDisplay = ({ compact = false, showBadges = false }: XPDisplayProps) => {
  const { totalXP, level, badges, getLevelProgress, getNextLevelXP, isLoading } = useXP();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-10 w-32" />
    );
  }

  const progress = getLevelProgress(totalXP);
  const nextLevelXP = getNextLevelXP(totalXP);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-secondary" />
          <span className="text-sm font-bold text-secondary">Lv.{level}</span>
        </div>
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{totalXP} XP</span>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-lg p-4 space-y-4">
      {/* Level and XP Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">{level}</span>
            </div>
            <Zap className="absolute -bottom-1 -right-1 h-5 w-5 text-secondary drop-shadow-lg" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-mono">Level</p>
            <p className="text-2xl font-bold text-foreground">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-mono">Total XP</p>
          <p className="text-2xl font-bold text-primary neon-text">{totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>Progress to Level {level + 1}</span>
          <span>{nextLevelXP} XP needed</span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <div 
            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-pulse opacity-30"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Badges Section */}
      {showBadges && badges.length > 0 && (
        <div className="pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-secondary" />
            <span className="text-sm font-bold text-foreground">Badges Earned</span>
            <Badge variant="secondary" className="text-xs">{badges.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1 bg-card/50 px-2 py-1 rounded-full border border-border/30"
                title={badge.description}
              >
                <span>{badge.icon}</span>
                <span className="text-xs font-mono text-foreground">{badge.name}</span>
              </div>
            ))}
            {badges.length > 6 && (
              <Badge variant="outline" className="text-xs">+{badges.length - 6} more</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
