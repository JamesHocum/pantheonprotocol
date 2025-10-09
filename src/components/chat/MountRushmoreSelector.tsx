import { AssistantKey, assistants } from "@/lib/assistants"
import { AIAvatar } from "./AIAvatars"

interface MountRushmoreSelectorProps {
  selectedAssistant: AssistantKey
  onSelectAssistant: (key: AssistantKey) => void
}

export const MountRushmoreSelector = ({ selectedAssistant, onSelectAssistant }: MountRushmoreSelectorProps) => {
  const aiList: AssistantKey[] = ["violet", "darkbert", "ghost", "demon", "wormgpt", "venice"]

  return (
    <div className="flex justify-center items-end gap-2 p-4 bg-gradient-to-r from-card/50 via-card/80 to-card/50 border-b border-border/30 rounded-b-3xl">
      {aiList.map((key) => (
        <button
          key={key}
          onClick={() => onSelectAssistant(key)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-110 ${
            selectedAssistant === key ? "bg-primary/20" : "opacity-70 hover:opacity-100"
          }`}
          title={assistants[key].description}
        >
          <AIAvatar assistantKey={key} selected={selectedAssistant === key} />
          <span className="text-xs font-mono" style={{ color: assistants[key].avatarColor }}>
            {assistants[key].name}
          </span>
        </button>
      ))}
    </div>
  )
}
