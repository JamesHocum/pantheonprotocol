import { useRef } from "react"
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react"
import { assistants, type AssistantKey } from "@/lib/assistants"
import { AIAvatar } from "@/components/chat/AIAvatars"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"

interface InstructorRailProps {
  active: AssistantKey
  onSelect: (key: AssistantKey) => void
}

const PERSONA_ORDER: AssistantKey[] = ["violet", "darkbert", "ghost", "demon", "wormgpt", "venice", "fraudgpt"]

const PERSONA_ROLES: Record<AssistantKey, string> = {
  violet:   "Lead Instructor",
  darkbert: "Code Architect",
  ghost:    "Recon Specialist",
  demon:    "Red-Team Advisor",
  wormgpt:  "Creative Engineer",
  venice:   "Resource Curator",
  fraudgpt: "Fraud Analyst",
}

const PERSONA_AURA: Record<AssistantKey, string> = {
  violet:   "persona-aura-violet",
  darkbert: "persona-aura-darkbert",
  ghost:    "persona-aura-ghost",
  demon:    "persona-aura-demon",
  wormgpt:  "persona-aura-wormgpt",
  venice:   "persona-aura-venice",
  fraudgpt: "persona-aura-fraudgpt",
}

export const InstructorRail = ({ active, onSelect }: InstructorRailProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollerRef.current) return
    scrollerRef.current.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" })
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase gradient-text-holo">AI Instructors</h2>
          <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">
            (07) — ETHICAL · DEFENSIVE · LAB-BASED
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <CyberpunkButton variant="ghost" size="iconSm" onClick={() => scroll("left")} aria-label="Scroll left">
            <ChevronLeft className="h-4 w-4" />
          </CyberpunkButton>
          <CyberpunkButton variant="ghost" size="iconSm" onClick={() => scroll("right")} aria-label="Scroll right">
            <ChevronRight className="h-4 w-4" />
          </CyberpunkButton>
        </div>
      </header>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {PERSONA_ORDER.map((key) => {
          const a = assistants[key]
          const isActive = active === key
          const color = a.avatarColor
          return (
            <article
              key={key}
              className={`holo-card holo-card-hover scanline relative flex-shrink-0 w-[220px] h-[340px] p-3 snap-start cursor-pointer animate-lift-in ${
                isActive ? "border-2" : ""
              }`}
              style={isActive ? { borderColor: color, boxShadow: `0 0 calc(28px * var(--neon-intensity)) ${color}55` } : undefined}
              onClick={() => onSelect(key)}
            >
              {/* Persona portrait area */}
              <div className={`relative h-[180px] rounded-md overflow-hidden flex items-end justify-center ${PERSONA_AURA[key]}`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[3] opacity-95">
                  <AIAvatar assistantKey={key} selected={isActive} />
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm border border-current/30 text-[9px] font-mono tracking-widest uppercase" style={{ color }}>
                  {PERSONA_ROLES[key]}
                </div>
              </div>

              {/* Name + description */}
              <div className="mt-3 space-y-2">
                <h3 className="text-sm font-bold tracking-[0.18em] uppercase" style={{ color }}>
                  {a.name}
                </h3>
                <p className="text-[11px] leading-snug text-muted-foreground line-clamp-3 font-mono">
                  {a.description}
                </p>
              </div>

              {/* Launch */}
              <CyberpunkButton
                variant="launch"
                size="sm"
                className="absolute bottom-3 left-3 right-3"
                onClick={(e) => { e.stopPropagation(); onSelect(key) }}
                style={{ color, borderColor: `${color}88`, boxShadow: `0 0 calc(14px * var(--neon-intensity)) ${color}55` }}
              >
                <Rocket className="h-3 w-3" />
                {isActive ? "Active" : "Launch"}
              </CyberpunkButton>
            </article>
          )
        })}
      </div>
    </section>
  )
}
