import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Copy, Plus, Trash2, AlertTriangle, Clock, CalendarIcon } from "lucide-react"
import { ProgressGrid } from "./ProgressGrid"
import { ClassroomAnalytics } from "./ClassroomAnalytics"
import { ClassroomLeaderboard } from "./ClassroomLeaderboard"
import { AchievementsFeed } from "./AchievementsFeed"
import { useCourses } from "@/hooks/useCourses"
import { useClassroomRealtime } from "@/hooks/useClassroomRealtime"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Classroom, ClassroomAssignment, ClassroomMember, MemberProgress } from "@/hooks/useClassrooms"

interface XPData {
  user_id: string
  total_xp: number
  current_level: number
}

interface Props {
  classroom: Classroom
  isInstructor: boolean
  onBack: () => void
  classroomHook: {
    getMembers: (id: string) => Promise<ClassroomMember[]>
    getAssignments: (id: string) => Promise<ClassroomAssignment[]>
    assignCourse: (classroomId: string, courseId: string, dueDate?: string) => Promise<boolean>
    removeAssignment: (id: string) => Promise<void>
    getClassroomProgress: (id: string) => Promise<MemberProgress[]>
  }
}

export const ClassroomDetail = ({ classroom, isInstructor, onBack, classroomHook }: Props) => {
  const { user } = useAuth()
  const { courses } = useCourses()
  const [members, setMembers] = useState<ClassroomMember[]>([])
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([])
  const [progress, setProgress] = useState<MemberProgress[]>([])
  const [xpData, setXpData] = useState<XPData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [m, a, p] = await Promise.all([
      classroomHook.getMembers(classroom.id),
      classroomHook.getAssignments(classroom.id),
      classroomHook.getClassroomProgress(classroom.id),
    ])
    setMembers(m)
    setAssignments(a)
    setProgress(p)

    // Fetch XP data for leaderboard
    if (m.length > 0) {
      const userIds = m.map(member => member.user_id)
      const { data: xp } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, current_level")
        .in("user_id", userIds)
      setXpData((xp as XPData[]) || [])
    }

    setLoading(false)
  }, [classroom.id, classroomHook])

  useEffect(() => { loadData() }, [loadData])

  // Real-time notifications
  useClassroomRealtime({
    classroomIds: [classroom.id],
    isInstructor,
    onMemberChange: loadData,
    onProgressChange: loadData,
  })

  // Notify students of overdue assignments on load
  useEffect(() => {
    if (isInstructor || !user || assignments.length === 0) return
    const overdueAssignments = assignments.filter(a => a.due_date && new Date(a.due_date) < new Date())
    if (overdueAssignments.length > 0) {
      toast.warning(
        `You have ${overdueAssignments.length} overdue assignment${overdueAssignments.length > 1 ? 's' : ''}!`,
        { icon: "⚠️", duration: 6000 }
      )
    }
  }, [assignments, isInstructor, user])

  const handleAssign = async () => {
    if (!selectedCourseId) return
    const dueDateStr = dueDate ? dueDate.toISOString() : undefined
    const success = await classroomHook.assignCourse(classroom.id, selectedCourseId, dueDateStr)
    if (success) {
      setSelectedCourseId("")
      setDueDate(undefined)
      await loadData()
    }
  }

  const handleRemoveAssignment = async (id: string) => {
    await classroomHook.removeAssignment(id)
    await loadData()
  }

  const copyCode = () => {
    navigator.clipboard.writeText(classroom.invite_code)
    toast.success("Invite code copied!")
  }

  const assignedCourseIds = new Set(assignments.map(a => a.course_id))
  const availableCourses = courses.filter(c => !assignedCourseIds.has(c.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CyberpunkButton variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </CyberpunkButton>
        <div className="flex-1">
          <h2 className="text-lg font-bold font-mono text-foreground">{classroom.name}</h2>
          {classroom.description && <p className="text-xs text-muted-foreground font-mono">{classroom.description}</p>}
        </div>
        {isInstructor && (
          <button onClick={copyCode} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors">
            <code className="text-xs font-mono text-primary">{classroom.invite_code}</code>
            <Copy className="h-3 w-3 text-primary" />
          </button>
        )}
      </div>

      {/* Members */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono">Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-xs text-muted-foreground font-mono">Loading...</p> : (
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <Badge key={m.id} variant="secondary" className="font-mono text-xs flex items-center gap-1">
                  {m.profile?.avatar_url && <img src={m.profile.avatar_url} className="w-4 h-4 rounded-full" alt="" />}
                  {m.profile?.display_name || "Unknown"}
                  <span className="text-muted-foreground">({m.role})</span>
                </Badge>
              ))}
              {members.length === 0 && <p className="text-xs text-muted-foreground font-mono">No students yet</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono">Assigned Courses ({assignments.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isInstructor && availableCourses.length > 0 && (
            <div className="flex gap-2 mb-3">
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background/50 px-3 text-xs font-mono"
              >
                <option value="">Select a course to assign...</option>
                {availableCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.difficulty})</option>
                ))}
              </select>
              <CyberpunkButton variant="neon" size="sm" onClick={handleAssign} disabled={!selectedCourseId}>
                <Plus className="h-4 w-4" />
              </CyberpunkButton>
            </div>
          )}
          {assignments.map(a => {
            const isOverdue = a.due_date && new Date(a.due_date) < new Date()
            const isDueSoon = a.due_date && !isOverdue && (new Date(a.due_date).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
            return (
              <div key={a.id} className={`flex items-center justify-between py-1.5 px-2 rounded transition-colors ${isOverdue ? 'bg-destructive/10 border border-destructive/30' : isDueSoon ? 'bg-accent/20 border border-accent/30' : 'bg-background/30'}`}>
                <div className="flex items-center gap-2">
                  {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
                  {isDueSoon && !isOverdue && <Clock className="h-3.5 w-3.5 text-accent-foreground flex-shrink-0" />}
                  <div>
                    <span className="text-sm font-mono text-foreground">{a.course?.title || "Unknown Course"}</span>
                    {a.due_date && (
                      <span className={`text-xs ml-2 font-mono ${isOverdue ? 'text-destructive font-semibold' : isDueSoon ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                        {isOverdue ? 'OVERDUE — ' : isDueSoon ? 'Due soon — ' : 'Due: '}
                        {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {isInstructor && (
                  <button onClick={() => handleRemoveAssignment(a.id)} className="p-1 rounded hover:bg-destructive/20">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                )}
              </div>
            )
          })}
          {assignments.length === 0 && <p className="text-xs text-muted-foreground font-mono">No courses assigned yet</p>}
        </CardContent>
      </Card>

      {/* Achievements Feed */}
      {progress.length > 0 && (
        <AchievementsFeed members={members} assignments={assignments} progress={progress} />
      )}

      {/* Leaderboard (visible to all) */}
      {members.length > 0 && (
        <ClassroomLeaderboard members={members} assignments={assignments} progress={progress} xpData={xpData} />
      )}

      {/* Analytics (instructor only) */}
      {isInstructor && members.length > 0 && (
        <ClassroomAnalytics members={members} assignments={assignments} progress={progress} />
      )}

      {/* Progress Grid (instructor only) */}
      {isInstructor && assignments.length > 0 && members.length > 0 && (
        <ProgressGrid progress={progress} assignments={assignments} members={members} />
      )}

      {/* Student's own progress */}
      {!isInstructor && assignments.length > 0 && (
        <Card className="border-border/30 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">My Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {progress.map((p, i) => {
              const assignment = assignments.find(a => a.course_id === p.course_id)
              const pct = p.total_modules > 0 ? Math.round(((p.completed_modules?.length || 0) / p.total_modules) * 100) : 0
              return (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-xs font-mono">{assignment?.course?.title || "Course"}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-background/50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
