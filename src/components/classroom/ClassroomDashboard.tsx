import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useClassrooms } from "@/hooks/useClassrooms"
import { InstructorView } from "./InstructorView"
import { StudentView } from "./StudentView"
import { ClassroomDetail } from "./ClassroomDetail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users } from "lucide-react"
import type { Classroom } from "@/hooks/useClassrooms"

export const ClassroomDashboard = () => {
  const { user } = useAuth()
  const classrooms = useClassrooms()
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [viewAs, setViewAs] = useState<"instructor" | "student">("instructor")

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <Users className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-bold font-mono text-foreground">Sign in to access Classrooms</h2>
        <p className="text-sm text-muted-foreground font-mono">Create or join classrooms to collaborate with your team.</p>
      </div>
    )
  }

  if (selectedClassroom) {
    return (
      <ClassroomDetail
        classroom={selectedClassroom}
        isInstructor={selectedClassroom.instructor_id === user.id}
        onBack={() => setSelectedClassroom(null)}
        classroomHook={classrooms}
      />
    )
  }

  return (
    <Tabs defaultValue="instructor" onValueChange={(v) => setViewAs(v as any)} className="h-full">
      <TabsList className="mb-4 bg-card/30 border border-border/30">
        <TabsTrigger value="instructor" className="data-[state=active]:bg-primary/20">
          <GraduationCap className="h-4 w-4 mr-2" />
          Instructor
        </TabsTrigger>
        <TabsTrigger value="student" className="data-[state=active]:bg-primary/20">
          <Users className="h-4 w-4 mr-2" />
          Student
        </TabsTrigger>
      </TabsList>

      <TabsContent value="instructor" className="mt-0">
        <InstructorView
          classrooms={classrooms.myClassrooms}
          loading={classrooms.loading}
          onCreate={classrooms.createClassroom}
          onDelete={classrooms.deleteClassroom}
          onSelect={setSelectedClassroom}
          getMemberCount={classrooms.getMemberCount}
        />
      </TabsContent>

      <TabsContent value="student" className="mt-0">
        <StudentView
          classrooms={classrooms.enrolledClassrooms}
          loading={classrooms.loading}
          onJoin={classrooms.joinClassroom}
          onLeave={classrooms.leaveClassroom}
          onSelect={setSelectedClassroom}
        />
      </TabsContent>
    </Tabs>
  )
}
