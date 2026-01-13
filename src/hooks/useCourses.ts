import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Tables } from "@/integrations/supabase/types"

export type Course = Tables<'training_courses'>

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("training_courses")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setCourses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch courses"))
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return { courses, loading, error }
}
