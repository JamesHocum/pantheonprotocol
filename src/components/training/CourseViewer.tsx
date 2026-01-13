import { useState } from "react"
import { ArrowLeft, BookOpen, CheckCircle, Circle, Clock, Play, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTrainingProgress } from "@/hooks/useTrainingProgress"
import { useAuth } from "@/contexts/AuthContext"
import type { Course } from "@/hooks/useCourses"
import type { Json } from "@/integrations/supabase/types"
import { toast } from "sonner"

interface CourseViewerProps {
  course: Course
  onBack: () => void
}

interface SyllabusModule {
  title: string
  description?: string
  lessons?: string[]
}

const parseSyllabus = (syllabus: Json): SyllabusModule[] => {
  if (!Array.isArray(syllabus)) return []
  return syllabus as unknown as SyllabusModule[]
}

export const CourseViewer = ({ course, onBack }: CourseViewerProps) => {
  const { user } = useAuth()
  const { getProgressForCourse, startCourse, completeModule, calculateCompletion } = useTrainingProgress()
  const [loading, setLoading] = useState(false)

  const syllabus = parseSyllabus(course.syllabus)
  const progress = getProgressForCourse(course.id)
  const completion = calculateCompletion(course.id, syllabus.length)
  const completedModules = progress?.completed_modules || []

  const handleStartCourse = async () => {
    if (!user) {
      toast.error("Please sign in to track your progress")
      return
    }

    setLoading(true)
    const { error } = await startCourse(course.id)
    setLoading(false)

    if (error) {
      toast.error("Failed to start course")
    } else {
      toast.success("Course started! Good luck, hacker.")
    }
  }

  const handleCompleteModule = async (moduleIndex: number) => {
    if (!user) {
      toast.error("Please sign in to track your progress")
      return
    }

    if (!progress) {
      toast.error("Start the course first")
      return
    }

    setLoading(true)
    const { error } = await completeModule(course.id, moduleIndex)
    setLoading(false)

    if (error) {
      toast.error("Failed to update progress")
    } else {
      toast.success("Module completed! 🎉")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <CyberpunkButton variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </CyberpunkButton>
      </div>

      {/* Course Info Card */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
            <h1 className="text-2xl font-bold font-mono mb-2">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
          
          {progress && (
            <div className="text-center">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${completion * 1.76} 176`}
                    className="text-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {completion}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.estimated_hours} hours
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {syllabus.length} modules
          </span>
        </div>

        {!progress && (
          <CyberpunkButton 
            variant="cyber" 
            onClick={handleStartCourse}
            disabled={loading}
          >
            <Play className="h-4 w-4 mr-2" />
            {loading ? "Starting..." : "Start Course"}
          </CyberpunkButton>
        )}

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <h4 className="text-sm font-mono font-bold mb-2">Prerequisites:</h4>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((prereq, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Syllabus */}
      <Card className="glass-morphism border-card-border p-6">
        <h2 className="text-lg font-bold font-mono mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Course Syllabus
        </h2>

        <Accordion type="single" collapsible className="space-y-2">
          {syllabus.map((module, index) => {
            const isCompleted = completedModules.includes(index)
            const isLocked = !progress && index > 0

            return (
              <AccordionItem 
                key={index} 
                value={`module-${index}`}
                className="border border-border/30 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={`font-mono ${isLocked ? "text-muted-foreground" : ""}`}>
                      Module {index + 1}: {module.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {module.description && (
                    <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                  )}
                  
                  {module.lessons && module.lessons.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  )}

                  {progress && !isCompleted && (
                    <CyberpunkButton
                      variant="neon"
                      size="sm"
                      onClick={() => handleCompleteModule(index)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </CyberpunkButton>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </Card>
    </div>
  )
}
