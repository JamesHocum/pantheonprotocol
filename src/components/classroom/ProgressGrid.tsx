import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClassroomAssignment, ClassroomMember, MemberProgress } from "@/hooks/useClassrooms"

interface Props {
  progress: MemberProgress[]
  assignments: ClassroomAssignment[]
  members: ClassroomMember[]
}

export const ProgressGrid = ({ progress, assignments, members }: Props) => {
  const getProgress = (userId: string, courseId: string) => {
    const p = progress.find(pr => pr.user_id === userId && pr.course_id === courseId)
    if (!p) return 0
    if (p.total_modules === 0) return 0
    return Math.round(((p.completed_modules?.length || 0) / p.total_modules) * 100)
  }

  const getColor = (pct: number) => {
    if (pct >= 75) return "bg-green-500/80 text-green-50"
    if (pct >= 25) return "bg-yellow-500/80 text-yellow-50"
    if (pct > 0) return "bg-red-500/80 text-red-50"
    return "bg-muted/30 text-muted-foreground"
  }

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono">Student Progress Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium border-b border-border/30">Student</th>
                {assignments.map(a => (
                  <th key={a.id} className="text-center py-2 px-2 text-muted-foreground font-medium border-b border-border/30 max-w-[120px] truncate">
                    {a.course?.title || "Course"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="hover:bg-background/20">
                  <td className="py-2 px-2 border-b border-border/20">
                    <div className="flex items-center gap-1">
                      {m.profile?.avatar_url && <img src={m.profile.avatar_url} className="w-4 h-4 rounded-full" alt="" />}
                      {m.profile?.display_name || "Unknown"}
                    </div>
                  </td>
                  {assignments.map(a => {
                    const pct = getProgress(m.user_id, a.course_id)
                    return (
                      <td key={a.id} className="text-center py-2 px-2 border-b border-border/20">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getColor(pct)}`}>
                          {pct}%
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
