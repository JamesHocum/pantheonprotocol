import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, TrendingUp, AlertTriangle, Star } from "lucide-react"
import type { ClassroomAssignment, ClassroomMember, MemberProgress } from "@/hooks/useClassrooms"

interface Props {
  members: ClassroomMember[]
  assignments: ClassroomAssignment[]
  progress: MemberProgress[]
}

export const ClassroomAnalytics = ({ members, assignments, progress }: Props) => {
  const analytics = useMemo(() => {
    const totalStudents = members.length
    const totalCourses = assignments.length

    // Per-student completion map
    const studentStats = members.map(m => {
      const studentProgress = progress.filter(p => p.user_id === m.user_id)
      const completions = studentProgress.map(p => {
        if (p.total_modules === 0) return 0
        return ((p.completed_modules?.length || 0) / p.total_modules) * 100
      })
      const avg = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0
      const hasAnyProgress = studentProgress.some(p => (p.completed_modules?.length || 0) > 0 || (p.current_module || 0) > 0)
      return {
        userId: m.user_id,
        name: m.profile?.display_name || "Unknown",
        avatarUrl: m.profile?.avatar_url,
        avgCompletion: Math.round(avg),
        hasProgress: hasAnyProgress,
      }
    })

    const avgCompletionAll = studentStats.length > 0
      ? Math.round(studentStats.reduce((a, s) => a + s.avgCompletion, 0) / studentStats.length)
      : 0

    const noProgressStudents = studentStats.filter(s => !s.hasProgress)
    const topStudents = [...studentStats].sort((a, b) => b.avgCompletion - a.avgCompletion).slice(0, 3)

    // Per-course stats
    const courseStats = assignments.map(a => {
      const courseProgress = progress.filter(p => p.course_id === a.course_id)
      const completions = courseProgress.map(p => {
        if (p.total_modules === 0) return 0
        return ((p.completed_modules?.length || 0) / p.total_modules) * 100
      })
      const avg = completions.length > 0 ? completions.reduce((acc, v) => acc + v, 0) / completions.length : 0
      const fullyCompleted = completions.filter(c => c >= 100).length
      return {
        courseId: a.course_id,
        title: a.course?.title || "Course",
        avgCompletion: Math.round(avg),
        fullyCompleted,
        totalStudents,
      }
    })

    return { totalStudents, totalCourses, avgCompletionAll, noProgressStudents, topStudents, courseStats }
  }, [members, assignments, progress])

  const getCompletionColor = (pct: number) => {
    if (pct >= 75) return "text-green-400"
    if (pct >= 25) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Classroom Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-background/40 border border-border/20 p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold font-mono text-foreground">{analytics.totalStudents}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Enrolled</p>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/20 p-3 text-center">
            <BookOpen className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold font-mono text-foreground">{analytics.totalCourses}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Courses</p>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/20 p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className={`text-xl font-bold font-mono ${getCompletionColor(analytics.avgCompletionAll)}`}>
              {analytics.avgCompletionAll}%
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">Avg Completion</p>
          </div>
        </div>

        {/* Top students */}
        {analytics.topStudents.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="h-3 w-3" /> Top Performers
            </h4>
            <div className="space-y-1">
              {analytics.topStudents.map((s, i) => (
                <div key={s.userId} className="flex items-center justify-between py-1 px-2 rounded bg-background/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</span>
                    {s.avatarUrl && <img src={s.avatarUrl} className="w-4 h-4 rounded-full" alt="" />}
                    <span className="text-xs font-mono text-foreground">{s.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${getCompletionColor(s.avgCompletion)}`}>
                    {s.avgCompletion}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students with no progress */}
        {analytics.noProgressStudents.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-400" /> No Progress Yet ({analytics.noProgressStudents.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {analytics.noProgressStudents.map(s => (
                <Badge key={s.userId} variant="outline" className="font-mono text-[10px] border-yellow-500/30 text-yellow-400">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Course breakdown */}
        {analytics.courseStats.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-muted-foreground mb-2">Course Completion</h4>
            <div className="space-y-2">
              {analytics.courseStats.map(c => (
                <div key={c.courseId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground truncate max-w-[60%]">{c.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {c.fullyCompleted}/{c.totalStudents} done
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.avgCompletion >= 75 ? 'bg-green-500' : c.avgCompletion >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${c.avgCompletion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
