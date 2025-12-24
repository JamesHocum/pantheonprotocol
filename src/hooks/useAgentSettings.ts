import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { AssistantKey } from "@/lib/assistants"

interface AgentSettings {
  id: string
  user_id: string
  assistant_key: string
  custom_instructions: string | null
  custom_avatar_url: string | null
  tor_enabled: boolean
}

export const useAgentSettings = (assistantKey: AssistantKey) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AgentSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("user_agent_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("assistant_key", assistantKey)
      .maybeSingle()

    if (data && !error) {
      setSettings(data)
    }
    setLoading(false)
  }, [user, assistantKey])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: Partial<Omit<AgentSettings, "id" | "user_id" | "assistant_key">>) => {
    if (!user) return { error: new Error("Not authenticated") }

    if (settings) {
      // Update existing
      const { error } = await supabase
        .from("user_agent_settings")
        .update(updates)
        .eq("id", settings.id)

      if (!error) {
        setSettings({ ...settings, ...updates })
      }
      return { error }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("user_agent_settings")
        .insert({
          user_id: user.id,
          assistant_key: assistantKey,
          ...updates
        })
        .select()
        .single()

      if (data && !error) {
        setSettings(data)
      }
      return { error }
    }
  }

  const uploadAgentAvatar = async (file: File) => {
    if (!user) return { url: null, error: new Error("Not authenticated") }

    const fileExt = file.name.split(".").pop()
    const filePath = `${user.id}/agents/${assistantKey}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      return { url: null, error: uploadError }
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    await updateSettings({ custom_avatar_url: publicUrl })

    return { url: publicUrl, error: null }
  }

  return {
    settings,
    loading,
    updateSettings,
    uploadAgentAvatar,
    refetch: fetchSettings
  }
}
