import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  icon: string;
  unlocksEra?: '1980s' | '1990s' | '2000s';
}

interface XPData {
  totalXP: number;
  level: number;
  badges: Badge[];
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, // 1-10
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, // 11-20
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200, // 21-30
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950, // 31-40
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700 // 41-50
];

// Badge definitions
const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt'>> = {
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first exercise',
    icon: '🩸',
  },
  crypto_rookie: {
    id: 'crypto_rookie',
    name: 'Crypto Rookie',
    description: 'Complete 3 crypto exercises',
    icon: '🔐',
    unlocksEra: '1990s',
  },
  forensics_hunter: {
    id: 'forensics_hunter',
    name: 'Forensics Hunter',
    description: 'Complete 3 forensics exercises',
    icon: '🔍',
  },
  web_warrior: {
    id: 'web_warrior',
    name: 'Web Warrior',
    description: 'Complete 3 web exploitation exercises',
    icon: '🌐',
  },
  triple_threat: {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Complete exercises in all categories',
    icon: '⚡',
    unlocksEra: '2000s',
  },
  course_completer: {
    id: 'course_completer',
    name: 'Course Completer',
    description: 'Finish your first course',
    icon: '📚',
  },
  master_hacker: {
    id: 'master_hacker',
    name: 'Master Hacker',
    description: 'Complete 10 advanced exercises',
    icon: '💀',
    unlocksEra: '1980s',
  },
  pantheon_elite: {
    id: 'pantheon_elite',
    name: 'Pantheon Elite',
    description: 'Reach level 25',
    icon: '👑',
  },
};

// XP amounts by difficulty
export const XP_REWARDS = {
  beginner: 50,
  intermediate: 100,
  advanced: 200,
  course_module: 75,
  course_complete: 500,
  daily_login: 25,
};

export const useXP = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [xpData, setXPData] = useState<XPData>({
    totalXP: 0,
    level: 1,
    badges: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }, []);

  // Get XP needed for next level
  const getNextLevelXP = useCallback((currentXP: number): number => {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= LEVEL_THRESHOLDS.length) return 0;
    return LEVEL_THRESHOLDS[currentLevel] - currentXP;
  }, [calculateLevel]);

  // Get progress percentage to next level
  const getLevelProgress = useCallback((currentXP: number): number => {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= LEVEL_THRESHOLDS.length) return 100;
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
    const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [calculateLevel]);

  // Load XP data
  useEffect(() => {
    const loadXP = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading XP:', error);
      }

      if (data) {
        const badgesArray = Array.isArray(data.badges) 
          ? (data.badges as unknown as Badge[]) 
          : [];
        setXPData({
          totalXP: data.total_xp,
          level: data.current_level,
          badges: badgesArray,
        });
      } else {
        // Create initial XP record
        await supabase.from('user_xp').insert({
          user_id: user.id,
          total_xp: 0,
          current_level: 1,
          badges: [],
        });
      }

      setIsLoading(false);
    };

    loadXP();
  }, [user]);

  // Add XP
  const addXP = useCallback(async (amount: number, source: string): Promise<void> => {
    if (!user) return;

    const newTotalXP = xpData.totalXP + amount;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > xpData.level;

    // Update local state immediately
    setXPData(prev => ({
      ...prev,
      totalXP: newTotalXP,
      level: newLevel,
    }));

    // Update database
    const { error } = await supabase
      .from('user_xp')
      .update({
        total_xp: newTotalXP,
        current_level: newLevel,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating XP:', error);
      return;
    }

    // Show XP gain toast
    toast({
      title: `+${amount} XP`,
      description: `Earned from: ${source}`,
    });

    // Show level up toast
    if (leveledUp) {
      toast({
        title: '🎉 Level Up!',
        description: `You've reached level ${newLevel}!`,
      });
    }
  }, [user, xpData, calculateLevel, toast]);

  // Award badge
  const awardBadge = useCallback(async (badgeId: string): Promise<void> => {
    if (!user) return;

    const badgeDef = BADGE_DEFINITIONS[badgeId];
    if (!badgeDef) return;

    // Check if already earned
    if (xpData.badges.some(b => b.id === badgeId)) return;

    const newBadge: Badge = {
      ...badgeDef,
      earnedAt: new Date().toISOString(),
    };

    const updatedBadges = [...xpData.badges, newBadge];

    setXPData(prev => ({
      ...prev,
      badges: updatedBadges,
    }));

    const { error } = await supabase
      .from('user_xp')
      .update({ badges: JSON.parse(JSON.stringify(updatedBadges)) })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error awarding badge:', error);
      return;
    }

    toast({
      title: `${badgeDef.icon} Badge Earned!`,
      description: badgeDef.name,
    });

    if (badgeDef.unlocksEra) {
      toast({
        title: '🎨 Theme Unlocked!',
        description: `You can now use the ${badgeDef.unlocksEra} era theme!`,
      });
    }
  }, [user, xpData.badges, toast]);

  // Check badge eligibility
  const checkBadges = useCallback(async (exerciseType?: string, difficulty?: string): Promise<void> => {
    if (!user) return;

    // Fetch exercise completions
    const { data: completions } = await supabase
      .from('exercise_completions')
      .select('exercise_id, practice_exercises(exercise_type, difficulty)')
      .eq('user_id', user.id);

    if (!completions) return;

    const totalCompleted = completions.length;
    const byType: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};

    completions.forEach((c: any) => {
      const type = c.practice_exercises?.exercise_type;
      const diff = c.practice_exercises?.difficulty;
      if (type) byType[type] = (byType[type] || 0) + 1;
      if (diff) byDifficulty[diff] = (byDifficulty[diff] || 0) + 1;
    });

    // Check First Blood
    if (totalCompleted >= 1) await awardBadge('first_blood');

    // Check category badges
    if ((byType['crypto'] || 0) >= 3) await awardBadge('crypto_rookie');
    if ((byType['forensics'] || 0) >= 3) await awardBadge('forensics_hunter');
    if ((byType['web'] || 0) >= 3) await awardBadge('web_warrior');

    // Check Triple Threat
    if (byType['crypto'] && byType['forensics'] && byType['web']) {
      await awardBadge('triple_threat');
    }

    // Check Master Hacker
    if ((byDifficulty['advanced'] || 0) >= 10) {
      await awardBadge('master_hacker');
    }

    // Check Pantheon Elite
    if (xpData.level >= 25) {
      await awardBadge('pantheon_elite');
    }
  }, [user, awardBadge, xpData.level]);

  return {
    totalXP: xpData.totalXP,
    level: xpData.level,
    badges: xpData.badges,
    isLoading,
    addXP,
    awardBadge,
    checkBadges,
    calculateLevel,
    getNextLevelXP,
    getLevelProgress,
    XP_REWARDS,
    BADGE_DEFINITIONS,
  };
};
