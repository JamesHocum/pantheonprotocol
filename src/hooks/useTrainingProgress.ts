import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { Tables } from "@/integrations/supabase/types"

export type TrainingProgress = Tables<'training_progress'>

export const useTrainingProgress = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState<TrainingProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("training_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setProgress(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch progress"))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const startCourse = async (courseId: string) => {
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("training_progress")
      .insert({
        user_id: user.id,
        course_id: courseId,
        current_module: 0,
        completed_modules: [],
      })
      .select()
      .single()

    if (!error && data) {
      setProgress(prev => [...prev, data])
    }

    return { data, error }
  }

  const completeModule = async (courseId: string, moduleIndex: number) => {
    if (!user) return { error: new Error("Not authenticated") }

    const existing = progress.find(p => p.course_id === courseId)
    if (!existing) return { error: new Error("Progress not found") }

    const completedModules = [...(existing.completed_modules || []), moduleIndex]
    const newCurrent = moduleIndex + 1

    const { data, error } = await supabase
      .from("training_progress")
      .update({
        current_module: newCurrent,
        completed_modules: completedModules,
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (!error && data) {
      setProgress(prev => prev.map(p => p.id === existing.id ? data : p))
    }

    return { data, error }
  }

  const getProgressForCourse = (courseId: string) => {
    return progress.find(p => p.course_id === courseId)
  }

  const calculateCompletion = (courseId: string, totalModules: number): number => {
    const courseProgress = getProgressForCourse(courseId)
    if (!courseProgress || totalModules === 0) return 0
    return Math.round((courseProgress.completed_modules?.length || 0) / totalModules * 100)
  }

  return {
    progress,
    loading,
    error,
    startCourse,
    completeModule,
    getProgressForCourse,
    calculateCompletion,
    refetch: fetchProgress,
  }
}
