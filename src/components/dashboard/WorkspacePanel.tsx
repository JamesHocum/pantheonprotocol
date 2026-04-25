import { ChatInterface } from "@/components/chat/ChatInterface"
import type { AssistantKey } from "@/lib/assistants"

interface WorkspacePanelProps {
  active: AssistantKey
  onAssistantChange: (key: AssistantKey) => void
  pendingPrompt?: string
  onPromptConsumed?: () => void
}

export const WorkspacePanel = ({ active, onAssistantChange, pendingPrompt, onPromptConsumed }: WorkspacePanelProps) => {
  return (
    <div className="holo-card scanline overflow-hidden h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground">Workspace</span>
        <span className="text-[10px] font-mono tracking-widest uppercase gradient-text-holo">{active.toUpperCase()}</span>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface
          compact
          activeAssistant={active}
          onAssistantChange={onAssistantChange}
          hideSelector
          pendingPrompt={pendingPrompt}
          onPromptConsumed={onPromptConsumed}
        />
      </div>
    </div>
  )
}
