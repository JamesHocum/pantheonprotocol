import { Sparkles } from "lucide-react"
import { assistants, type AssistantKey } from "@/lib/assistants"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"

interface ConversationStartersProps {
  assistantKey: AssistantKey
  onSelectStarter: (message: string) => void
}

export const ConversationStarters = ({ assistantKey, onSelectStarter }: ConversationStartersProps) => {
  const starters = assistants[assistantKey]?.conversationStarters

  if (!starters || starters.length === 0) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-mono text-muted-foreground">Quick prompts:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {starters.map((starter, index) => (
          <CyberpunkButton
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onSelectStarter(starter)}
            className="text-xs border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
          >
            {starter.length > 45 ? starter.substring(0, 42) + "..." : starter}
          </CyberpunkButton>
        ))}
      </div>
    </div>
  )
}
