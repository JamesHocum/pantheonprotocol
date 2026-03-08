import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Flame, TrendingUp } from "lucide-react"
import type { ClassroomMember, ClassroomAssignment, MemberProgress } from "@/hooks/useClassrooms"

interface XPData {
  user_id: string
  total_xp: number
  current_level: number
}

interface Props {
  members: ClassroomMember[]
  assignments: ClassroomAssignment[]
  progress: MemberProgress[]
  xpData: XPData[]
}

export const ClassroomLeaderboard = ({ members, assignments, progress, xpData }: Props) => {
  const leaderboard = useMemo(() => {
    return members
      .map(m => {
        const xp = xpData.find(x => x.user_id === m.user_id)
        const studentProgress = progress.filter(p => p.user_id === m.user_id)
        const completions = studentProgress.map(p => {
          if (p.total_modules === 0) return 0
          return ((p.completed_modules?.length || 0) / p.total_modules) * 100
        })
        const avgCompletion = completions.length > 0
          ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length)
          : 0
        const coursesCompleted = completions.filter(c => c >= 100).length

        return {
          userId: m.user_id,
          name: m.profile?.display_name || "Unknown",
          avatarUrl: m.profile?.avatar_url,
          totalXp: xp?.total_xp || 0,
          level: xp?.current_level || 1,
          avgCompletion,
          coursesCompleted,
          totalCourses: assignments.length,
        }
      })
      .sort((a, b) => b.totalXp - a.totalXp || b.avgCompletion - a.avgCompletion)
  }, [members, assignments, progress, xpData])

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-4 w-4 text-yellow-400" />
    if (i === 1) return <Medal className="h-4 w-4 text-gray-300" />
    if (i === 2) return <Medal className="h-4 w-4 text-amber-600" />
    return <span className="text-xs font-mono text-muted-foreground w-4 text-center">{i + 1}</span>
  }

  const getCompletionColor = (pct: number) => {
    if (pct >= 75) return "text-green-400"
    if (pct >= 25) return "text-yellow-400"
    return "text-red-400"
  }

  if (members.length === 0) return null

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {leaderboard.map((s, i) => (
            <div
              key={s.userId}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" :
                i < 3 ? "bg-background/30" : "hover:bg-background/20"
              }`}
            >
              <div className="w-6 flex justify-center">{getRankIcon(i)}</div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {s.avatarUrl ? (
                  <img src={s.avatarUrl} className="w-6 h-6 rounded-full border border-border/30" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{s.name[0]}</span>
                  </div>
                )}
                <span className="text-sm font-mono text-foreground truncate">{s.name}</span>
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary ml-auto shrink-0">
                  Lv.{s.level}
                </Badge>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-primary">{s.totalXp.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">XP</p>
                </div>
                <div className="text-right w-12">
                  <p className={`text-sm font-bold font-mono ${getCompletionColor(s.avgCompletion)}`}>{s.avgCompletion}%</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Done</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Ranked by XP then completion rate
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {leaderboard.filter(s => s.coursesCompleted > 0).length}/{leaderboard.length} active
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
