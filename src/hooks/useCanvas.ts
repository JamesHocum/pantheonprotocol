import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { AssistantKey } from "@/lib/assistants"

interface CanvasData {
  id: string
  user_id: string
  assistant_key: string
  content: string
  language: string
}

export const useCanvas = (assistantKey: AssistantKey) => {
  const { user } = useAuth()
  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCanvas = useCallback(async () => {
    if (!user) {
      setCanvas(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("canvas_data")
      .select("*")
      .eq("user_id", user.id)
      .eq("assistant_key", assistantKey)
      .maybeSingle()

    if (data && !error) {
      setCanvas(data)
    }
    setLoading(false)
  }, [user, assistantKey])

  useEffect(() => {
    fetchCanvas()
  }, [fetchCanvas])

  const saveCanvas = async (content: string, language: string = "javascript") => {
    if (!user) return { error: new Error("Not authenticated") }

    if (canvas) {
      // Update existing
      const { error } = await supabase
        .from("canvas_data")
        .update({ content, language })
        .eq("id", canvas.id)

      if (!error) {
        setCanvas({ ...canvas, content, language })
      }
      return { error }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("canvas_data")
        .insert({
          user_id: user.id,
          assistant_key: assistantKey,
          content,
          language
        })
        .select()
        .single()

      if (data && !error) {
        setCanvas(data)
      }
      return { error }
    }
  }

  return {
    canvas,
    loading,
    saveCanvas,
    refetch: fetchCanvas
  }
}
