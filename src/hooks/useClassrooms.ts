import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export interface Classroom {
  id: string
  name: string
  description: string
  instructor_id: string
  invite_code: string
  created_at: string
  updated_at: string
}

export interface ClassroomMember {
  id: string
  classroom_id: string
  user_id: string
  role: string
  joined_at: string
  profile?: { display_name: string | null; avatar_url: string | null }
}

export interface ClassroomAssignment {
  id: string
  classroom_id: string
  course_id: string
  assigned_at: string
  due_date: string | null
  course?: { title: string; category: string; difficulty: string }
}

export interface MemberProgress {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  course_id: string
  completed_modules: number[] | null
  current_module: number | null
  completed_at: string | null
  total_modules: number
}

export const useClassrooms = () => {
  const { user } = useAuth()
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyClassrooms = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setMyClassrooms((data as Classroom[]) || [])
  }, [user])

  const fetchEnrolledClassrooms = useCallback(async () => {
    if (!user) return
    const { data: memberships, error: mErr } = await supabase
      .from("classroom_members")
      .select("classroom_id")
      .eq("user_id", user.id)
    if (mErr) { console.error(mErr); return }
    if (!memberships?.length) { setEnrolledClassrooms([]); return }

    const classroomIds = memberships.map(m => m.classroom_id)
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .in("id", classroomIds)
      .order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setEnrolledClassrooms((data as Classroom[]) || [])
  }, [user])

  const refresh = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchMyClassrooms(), fetchEnrolledClassrooms()])
    setLoading(false)
  }, [fetchMyClassrooms, fetchEnrolledClassrooms])

  useEffect(() => { refresh() }, [refresh])

  const createClassroom = async (name: string, description: string) => {
    if (!user) return null
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ name, description, instructor_id: user.id })
      .select()
      .single()
    if (error) { toast.error("Failed to create classroom"); console.error(error); return null }
    toast.success("Classroom created!")
    await fetchMyClassrooms()
    return data as Classroom
  }

  const deleteClassroom = async (id: string) => {
    const { error } = await supabase.from("classrooms").delete().eq("id", id)
    if (error) { toast.error("Failed to delete classroom"); return }
    toast.success("Classroom deleted")
    await fetchMyClassrooms()
  }

  const joinClassroom = async (inviteCode: string) => {
    if (!user) return false
    const { data: classroom, error: findErr } = await supabase
      .from("classrooms")
      .select("id, instructor_id")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .single()
    if (findErr || !classroom) { toast.error("Invalid invite code"); return false }
    if (classroom.instructor_id === user.id) { toast.error("You're the instructor of this classroom"); return false }

    const { error } = await supabase
      .from("classroom_members")
      .insert({ classroom_id: classroom.id, user_id: user.id })
    if (error) {
      if (error.code === "23505") toast.error("Already enrolled")
      else toast.error("Failed to join")
      return false
    }
    toast.success("Joined classroom!")
    await fetchEnrolledClassrooms()
    return true
  }

  const leaveClassroom = async (classroomId: string) => {
    if (!user) return
    const { error } = await supabase
      .from("classroom_members")
      .delete()
      .eq("classroom_id", classroomId)
      .eq("user_id", user.id)
    if (error) { toast.error("Failed to leave"); return }
    toast.success("Left classroom")
    await fetchEnrolledClassrooms()
  }

  const getMembers = async (classroomId: string): Promise<ClassroomMember[]> => {
    const { data, error } = await supabase
      .from("classroom_members")
      .select("*")
      .eq("classroom_id", classroomId)
    if (error) { console.error(error); return [] }
    
    // Fetch profiles for members
    const userIds = (data || []).map(m => m.user_id)
    if (!userIds.length) return []
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds)
    
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))
    return (data || []).map(m => ({
      ...m,
      profile: profileMap.get(m.user_id) || undefined
    })) as ClassroomMember[]
  }

  const getAssignments = async (classroomId: string): Promise<ClassroomAssignment[]> => {
    const { data, error } = await supabase
      .from("classroom_assignments")
      .select("*")
      .eq("classroom_id", classroomId)
    if (error) { console.error(error); return [] }
    
    const courseIds = (data || []).map(a => a.course_id)
    if (!courseIds.length) return []
    const { data: courses } = await supabase
      .from("training_courses")
      .select("id, title, category, difficulty")
      .in("id", courseIds)
    
    const courseMap = new Map((courses || []).map(c => [c.id, c]))
    return (data || []).map(a => ({
      ...a,
      course: courseMap.get(a.course_id) || undefined
    })) as ClassroomAssignment[]
  }

  const assignCourse = async (classroomId: string, courseId: string, dueDate?: string) => {
    const { error } = await supabase
      .from("classroom_assignments")
      .insert({ classroom_id: classroomId, course_id: courseId, due_date: dueDate || null })
    if (error) {
      if (error.code === "23505") toast.error("Course already assigned")
      else toast.error("Failed to assign course")
      return false
    }
    toast.success("Course assigned!")
    return true
  }

  const removeAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from("classroom_assignments")
      .delete()
      .eq("id", assignmentId)
    if (error) { toast.error("Failed to remove assignment"); return }
    toast.success("Assignment removed")
  }

  const getClassroomProgress = async (classroomId: string): Promise<MemberProgress[]> => {
    const members = await getMembers(classroomId)
    const assignments = await getAssignments(classroomId)
    if (!members.length || !assignments.length) return []

    const memberIds = members.map(m => m.user_id)
    const courseIds = assignments.map(a => a.course_id)

    const { data: progress } = await supabase
      .from("training_progress")
      .select("*")
      .in("user_id", memberIds)
      .in("course_id", courseIds)

    // Get course syllabus lengths
    const { data: courses } = await supabase
      .from("training_courses")
      .select("id, syllabus")
      .in("id", courseIds)

    const syllabusMap = new Map(
      (courses || []).map(c => {
        const syllabus = c.syllabus as any[]
        return [c.id, Array.isArray(syllabus) ? syllabus.length : 0]
      })
    )

    const results: MemberProgress[] = []
    for (const member of members) {
      for (const assignment of assignments) {
        const p = (progress || []).find(
          pr => pr.user_id === member.user_id && pr.course_id === assignment.course_id
        )
        results.push({
          user_id: member.user_id,
          display_name: member.profile?.display_name || null,
          avatar_url: member.profile?.avatar_url || null,
          course_id: assignment.course_id,
          completed_modules: p?.completed_modules || null,
          current_module: p?.current_module || null,
          completed_at: p?.completed_at || null,
          total_modules: syllabusMap.get(assignment.course_id) || 0
        })
      }
    }
    return results
  }

  const getMemberCount = async (classroomId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("classroom_members")
      .select("*", { count: "exact", head: true })
      .eq("classroom_id", classroomId)
    if (error) return 0
    return count || 0
  }

  return {
    myClassrooms,
    enrolledClassrooms,
    loading,
    refresh,
    createClassroom,
    deleteClassroom,
    joinClassroom,
    leaveClassroom,
    getMembers,
    getAssignments,
    assignCourse,
    removeAssignment,
    getClassroomProgress,
    getMemberCount,
  }
}
