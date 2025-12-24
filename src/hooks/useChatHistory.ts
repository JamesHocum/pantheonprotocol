import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { AssistantKey } from "@/lib/assistants"

interface ChatMessage {
  id: string
  conversation_id: string
  role: string
  content: string
  assistant_key: string
  created_at: string
}

interface Conversation {
  id: string
  assistant_key: string
  user_id: string | null
  created_at: string
  updated_at: string
}

export const useChatHistory = (assistantKey: AssistantKey) => {
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversation = useCallback(async () => {
    if (!user) {
      setConversation(null)
      setMessages([])
      setLoading(false)
      return
    }

    // Get or create conversation for this assistant
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("assistant_key", assistantKey)
      .maybeSingle()

    if (existingConv) {
      setConversation(existingConv)

      // Fetch messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", existingConv.id)
        .order("created_at", { ascending: true })

      if (msgs) {
        setMessages(msgs)
      }
    }

    setLoading(false)
  }, [user, assistantKey])

  useEffect(() => {
    fetchConversation()
  }, [fetchConversation])

  const createConversation = async () => {
    if (!user) return { conversation: null, error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        assistant_key: assistantKey
      })
      .select()
      .single()

    if (data && !error) {
      setConversation(data)
    }

    return { conversation: data, error }
  }

  const addMessage = async (role: "user" | "assistant", content: string) => {
    if (!user) return { error: new Error("Not authenticated") }

    let convId = conversation?.id

    if (!convId) {
      const { conversation: newConv, error } = await createConversation()
      if (error || !newConv) return { error: error || new Error("Failed to create conversation") }
      convId = newConv.id
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: convId,
        role,
        content,
        assistant_key: assistantKey
      })
      .select()
      .single()

    if (data && !error) {
      setMessages(prev => [...prev, data])
    }

    return { error }
  }

  const clearHistory = async () => {
    if (!conversation) return

    await supabase
      .from("chat_messages")
      .delete()
      .eq("conversation_id", conversation.id)

    setMessages([])
  }

  return {
    conversation,
    messages,
    loading,
    addMessage,
    clearHistory,
    refetch: fetchConversation
  }
}
