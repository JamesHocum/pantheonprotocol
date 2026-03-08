import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, CheckCircle2, Flame } from "lucide-react"
import type { ClassroomMember, ClassroomAssignment, MemberProgress } from "@/hooks/useClassrooms"

interface Props {
  members: ClassroomMember[]
  assignments: ClassroomAssignment[]
  progress: MemberProgress[]
}

interface Achievement {
  type: "completion" | "milestone" | "started"
  userName: string
  avatarUrl: string | null
  courseTitle: string
  detail: string
  date: string | null
  sortDate: number
}

export const AchievementsFeed = ({ members, assignments, progress }: Props) => {
  const achievements: Achievement[] = []

  for (const p of progress) {
    const assignment = assignments.find(a => a.course_id === p.course_id)
    const courseTitle = assignment?.course?.title || "Course"

    // Course completed
    if (p.completed_at) {
      achievements.push({
        type: "completion",
        userName: p.display_name || "Student",
        avatarUrl: p.avatar_url,
        courseTitle,
        detail: `Completed ${courseTitle}`,
        date: p.completed_at,
        sortDate: new Date(p.completed_at).getTime(),
      })
    }

    // Milestone: 50%+ modules done (but not completed)
    const completedCount = p.completed_modules?.length || 0
    if (!p.completed_at && p.total_modules > 0 && completedCount >= Math.ceil(p.total_modules / 2)) {
      achievements.push({
        type: "milestone",
        userName: p.display_name || "Student",
        avatarUrl: p.avatar_url,
        courseTitle,
        detail: `Reached ${Math.round((completedCount / p.total_modules) * 100)}% in ${courseTitle}`,
        date: null,
        sortDate: Date.now() - 100000, // approximate
      })
    }

    // Started (has progress but < 50%)
    if (!p.completed_at && completedCount > 0 && completedCount < Math.ceil(p.total_modules / 2)) {
      achievements.push({
        type: "started",
        userName: p.display_name || "Student",
        avatarUrl: p.avatar_url,
        courseTitle,
        detail: `Started ${courseTitle} (${completedCount}/${p.total_modules} modules)`,
        date: null,
        sortDate: Date.now() - 200000,
      })
    }
  }

  achievements.sort((a, b) => b.sortDate - a.sortDate)
  const recent = achievements.slice(0, 10)

  if (recent.length === 0) return null

  const iconMap = {
    completion: <Trophy className="h-3.5 w-3.5 text-yellow-500" />,
    milestone: <Flame className="h-3.5 w-3.5 text-orange-500" />,
    started: <Star className="h-3.5 w-3.5 text-primary" />,
  }

  const badgeVariantMap = {
    completion: "default" as const,
    milestone: "secondary" as const,
    started: "outline" as const,
  }

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {recent.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-background/30">
              {a.avatarUrl ? (
                <img src={a.avatarUrl} className="w-5 h-5 rounded-full flex-shrink-0" alt="" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-foreground truncate">
                  <span className="font-semibold">{a.userName}</span>
                  {" — "}
                  {a.detail}
                </p>
              </div>
              <Badge variant={badgeVariantMap[a.type]} className="text-[10px] font-mono flex items-center gap-1 flex-shrink-0">
                {iconMap[a.type]}
                {a.type === "completion" ? "Done" : a.type === "milestone" ? "50%+" : "Active"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
