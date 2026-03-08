import { useEffect, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Options {
  classroomIds: string[]
  isInstructor: boolean
  onMemberChange?: () => void
  onProgressChange?: () => void
}

export const useClassroomRealtime = ({ classroomIds, isInstructor, onMemberChange, onProgressChange }: Options) => {
  const { user } = useAuth()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!user || classroomIds.length === 0) return

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`classroom-realtime-${classroomIds.join("-").slice(0, 30)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "classroom_members",
        },
        async (payload) => {
          const newMember = payload.new as { classroom_id: string; user_id: string }
          if (!classroomIds.includes(newMember.classroom_id)) return
          if (newMember.user_id === user.id) return

          // Fetch the new member's name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", newMember.user_id)
            .single()

          const name = profile?.display_name || "A student"
          
          if (isInstructor) {
            toast.info(`${name} joined your classroom!`, {
              icon: "👋",
              duration: 5000,
            })
          }
          onMemberChange?.()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "classroom_members",
        },
        (payload) => {
          const removed = payload.old as { classroom_id: string; user_id: string }
          if (!classroomIds.includes(removed.classroom_id)) return
          if (removed.user_id === user.id) return

          if (isInstructor) {
            toast.info("A student left the classroom", {
              icon: "👋",
              duration: 4000,
            })
          }
          onMemberChange?.()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_progress",
        },
        (payload) => {
          const record = (payload.new || payload.old) as { user_id?: string; completed_modules?: number[] }
          if (!record || record.user_id === user.id) return

          // Notify instructor about module completions
          if (isInstructor && payload.eventType === "UPDATE") {
            const oldModules = (payload.old as any)?.completed_modules?.length || 0
            const newModules = record.completed_modules?.length || 0
            if (newModules > oldModules) {
              toast.success("A student completed a module!", {
                icon: "🎓",
                duration: 4000,
              })
            }
          }
          onProgressChange?.()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, classroomIds.join(","), isInstructor])
}
