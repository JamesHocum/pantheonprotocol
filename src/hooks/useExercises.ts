import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { Tables } from "@/integrations/supabase/types"

export type Exercise = Tables<"practice_exercises">

interface ExerciseContent {
  encoded?: string
  html?: string
  encrypted?: string
  shift?: number
  hex?: string
  binary?: string
  instructions: string
}

interface ExerciseSolution {
  expected_output: string
  explanation: string
}

export interface ParsedExercise extends Omit<Exercise, 'content' | 'solution'> {
  content: ExerciseContent
  solution: ExerciseSolution | null
}

interface ExerciseCompletion {
  exercise_id: string
  completed_at: string
  attempts: number
  score: number | null
}

export const useExercises = () => {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<ParsedExercise[]>([])
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("practice_exercises")
        .select("*")
        .order("difficulty", { ascending: true })

      if (fetchError) throw fetchError

      const parsed: ParsedExercise[] = (data || []).map((ex) => ({
        ...ex,
        content: ex.content as unknown as ExerciseContent,
        solution: ex.solution as unknown as ExerciseSolution | null,
      }))

      setExercises(parsed)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch exercises"))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setCompletions([])
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("exercise_completions")
        .select("exercise_id, completed_at, attempts, score")
        .eq("user_id", user.id)

      if (fetchError) throw fetchError

      setCompletions(data || [])
    } catch (err) {
      console.error("Failed to fetch completions:", err)
    }
  }, [user])

  useEffect(() => {
    fetchExercises()
    fetchCompletions()
  }, [fetchExercises, fetchCompletions])

  const markComplete = async (exerciseId: string, score?: number): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") }

    try {
      // Check if already completed
      const existing = completions.find(c => c.exercise_id === exerciseId)
      
      if (existing) {
        // Update attempts
        const { error } = await supabase
          .from("exercise_completions")
          .update({ 
            attempts: existing.attempts + 1,
            score: score ?? existing.score,
            completed_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
          .eq("exercise_id", exerciseId)

        if (error) throw error
      } else {
        // Insert new completion
        const { error } = await supabase
          .from("exercise_completions")
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            attempts: 1,
            score: score ?? null
          })

        if (error) throw error
      }

      await fetchCompletions()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Failed to mark complete") }
    }
  }

  const isCompleted = (exerciseId: string): boolean => {
    return completions.some(c => c.exercise_id === exerciseId)
  }

  const getCompletion = (exerciseId: string): ExerciseCompletion | undefined => {
    return completions.find(c => c.exercise_id === exerciseId)
  }

  return {
    exercises,
    completions,
    loading,
    error,
    markComplete,
    isCompleted,
    getCompletion,
    refetch: fetchExercises,
  }
}
