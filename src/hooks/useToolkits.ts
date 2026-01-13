import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Tables } from "@/integrations/supabase/types"

export type Toolkit = Tables<'hacker_toolkits'>

export const useToolkits = () => {
  const [toolkits, setToolkits] = useState<Toolkit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchToolkits = async () => {
      try {
        const { data, error } = await supabase
          .from("hacker_toolkits")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setToolkits(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch toolkits"))
      } finally {
        setLoading(false)
      }
    }

    fetchToolkits()
  }, [])

  return { toolkits, loading, error }
}
