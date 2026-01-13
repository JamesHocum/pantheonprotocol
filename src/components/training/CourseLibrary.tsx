import { BookOpen, Clock, Star, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { useCourses, type Course } from "@/hooks/useCourses"
import { useTrainingProgress } from "@/hooks/useTrainingProgress"
import type { Json } from "@/integrations/supabase/types"

interface CourseLibraryProps {
  onSelectCourse: (course: Course) => void
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30"
    case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "advanced": return "bg-red-500/20 text-red-400 border-red-500/30"
    default: return "bg-primary/20 text-primary border-primary/30"
  }
}

const getSyllabusLength = (syllabus: Json): number => {
  if (Array.isArray(syllabus)) return syllabus.length
  return 0
}

export const CourseLibrary = ({ onSelectCourse }: CourseLibraryProps) => {
  const { courses, loading, error } = useCourses()
  const { getProgressForCourse, calculateCompletion } = useTrainingProgress()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm font-mono text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p className="font-mono">Error loading courses: {error.message}</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-mono">No courses available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold font-mono">Training Courses</h2>
        <Badge variant="secondary" className="ml-auto">{courses.length} courses</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => {
          const progress = getProgressForCourse(course.id)
          const syllabusLength = getSyllabusLength(course.syllabus)
          const completion = calculateCompletion(course.id, syllabusLength)

          return (
            <Card 
              key={course.id}
              className="glass-morphism border-card-border p-4 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => onSelectCourse(course)}
            >
              <div className="flex items-start justify-between mb-3">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.category}
                </Badge>
              </div>

              <h3 className="font-bold font-mono text-lg mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.estimated_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {syllabusLength} modules
                  </span>
                </div>

                {progress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <span className="text-primary">{completion}%</span>
                  </div>
                ) : (
                  <CyberpunkButton variant="ghost" size="sm" className="text-xs">
                    Start <ChevronRight className="h-3 w-3 ml-1" />
                  </CyberpunkButton>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
