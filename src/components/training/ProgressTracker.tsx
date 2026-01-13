import { Trophy, BookOpen, Clock, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { useTrainingProgress } from "@/hooks/useTrainingProgress"
import { useCourses, type Course } from "@/hooks/useCourses"
import { useAuth } from "@/contexts/AuthContext"
import type { Json } from "@/integrations/supabase/types"

interface ProgressTrackerProps {
  onSelectCourse: (course: Course) => void
}

const getSyllabusLength = (syllabus: Json): number => {
  if (Array.isArray(syllabus)) return syllabus.length
  return 0
}

export const ProgressTracker = ({ onSelectCourse }: ProgressTrackerProps) => {
  const { user } = useAuth()
  const { progress, loading: progressLoading } = useTrainingProgress()
  const { courses, loading: coursesLoading } = useCourses()

  if (!user) {
    return (
      <div className="text-center p-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-mono font-bold mb-2">Sign in to track progress</h3>
        <p className="text-sm text-muted-foreground">
          Create an account to save your learning progress across sessions.
        </p>
      </div>
    )
  }

  if (progressLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Trophy className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm font-mono text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <div className="text-center p-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-mono font-bold mb-2">No courses started yet</h3>
        <p className="text-sm text-muted-foreground">
          Head to the Courses tab to begin your hacker training journey.
        </p>
      </div>
    )
  }

  // Calculate overall stats
  const totalModulesCompleted = progress.reduce(
    (sum, p) => sum + (p.completed_modules?.length || 0), 
    0
  )
  const coursesCompleted = progress.filter(p => p.completed_at).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-morphism border-card-border p-4 text-center">
          <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono">{progress.length}</p>
          <p className="text-xs text-muted-foreground">Courses Started</p>
        </Card>
        <Card className="glass-morphism border-card-border p-4 text-center">
          <Trophy className="h-6 w-6 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono">{coursesCompleted}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </Card>
        <Card className="glass-morphism border-card-border p-4 text-center">
          <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono">{totalModulesCompleted}</p>
          <p className="text-xs text-muted-foreground">Modules Done</p>
        </Card>
      </div>

      {/* In-Progress Courses */}
      <div>
        <h3 className="font-mono font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Your Courses
        </h3>

        <div className="space-y-3">
          {progress.map((prog) => {
            const course = courses.find(c => c.id === prog.course_id)
            if (!course) return null

            const totalModules = getSyllabusLength(course.syllabus)
            const completedCount = prog.completed_modules?.length || 0
            const percentComplete = totalModules > 0 
              ? Math.round((completedCount / totalModules) * 100) 
              : 0

            return (
              <Card 
                key={prog.id}
                className="glass-morphism border-card-border p-4 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => onSelectCourse(course)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono font-bold">{course.title}</h4>
                  <Badge variant={prog.completed_at ? "default" : "secondary"}>
                    {prog.completed_at ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{completedCount} of {totalModules} modules</span>
                      <span>{percentComplete}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <CyberpunkButton variant="ghost" size="sm">
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </CyberpunkButton>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
