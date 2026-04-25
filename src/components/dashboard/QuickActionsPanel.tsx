import { Sparkles, ArrowUpRight } from "lucide-react"
import { assistants, type AssistantKey } from "@/lib/assistants"

interface QuickActionsPanelProps {
  active: AssistantKey
  onSelect: (prompt: string) => void
}

export const QuickActionsPanel = ({ active, onSelect }: QuickActionsPanelProps) => {
  const starters = assistants[active]?.conversationStarters ?? []
  const color = assistants[active]?.avatarColor ?? "hsl(280 100% 70%)"

  return (
    <aside className="holo-card h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> Quick Actions
        </span>
        <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color }}>
          {assistants[active]?.name}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {starters.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono p-2">No quick actions for this instructor yet.</p>
        )}
        {starters.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="holo-card holo-card-hover w-full text-left p-3 group flex items-start justify-between gap-2 animate-lift-in"
          >
            <span className="text-xs font-mono leading-snug text-foreground/90 group-hover:text-foreground">
              {s}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-border/40 text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
        For educational & defensive use only
      </div>
    </aside>
  )
}
