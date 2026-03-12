import { Lock, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useXP } from "@/hooks/useXP"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import type { AssistantKey } from "@/lib/assistants"

interface AvatarSkin {
  id: string
  name: string
  variant: "neon" | "holographic" | "shadow"
  requiredLevel: number
  requiredBadge?: string
  colors: { primary: string; secondary: string; glow: string }
}

const PERSONA_SKINS: Record<AssistantKey, AvatarSkin[]> = {
  violet: [
    { id: "violet_neon", name: "Neon Violet", variant: "neon", requiredLevel: 5, colors: { primary: "#ff00cc", secondary: "#ff66e0", glow: "#ff00cc" } },
    { id: "violet_holo", name: "Holographic Violet", variant: "holographic", requiredLevel: 15, requiredBadge: "violet_ascended", colors: { primary: "#e0b0ff", secondary: "#c77dff", glow: "#e0b0ff" } },
    { id: "violet_shadow", name: "Shadow Violet", variant: "shadow", requiredLevel: 25, colors: { primary: "#4a0033", secondary: "#1a001a", glow: "#ff00cc33" } },
  ],
  darkbert: [
    { id: "darkbert_neon", name: "Neon BERT", variant: "neon", requiredLevel: 5, colors: { primary: "#5f5dff", secondary: "#8b89ff", glow: "#5f5dff" } },
    { id: "darkbert_holo", name: "Holographic BERT", variant: "holographic", requiredLevel: 15, requiredBadge: "darkbert_elite", colors: { primary: "#00c8ff", secondary: "#64dfff", glow: "#00c8ff" } },
    { id: "darkbert_shadow", name: "Shadow BERT", variant: "shadow", requiredLevel: 25, colors: { primary: "#0a0a2e", secondary: "#000014", glow: "#5f5dff33" } },
  ],
  ghost: [
    { id: "ghost_neon", name: "Neon Ghost", variant: "neon", requiredLevel: 5, colors: { primary: "#00fff7", secondary: "#76ffe0", glow: "#00fff7" } },
    { id: "ghost_holo", name: "Spectral Ghost", variant: "holographic", requiredLevel: 15, colors: { primary: "#b0fffc", secondary: "#00fff7", glow: "#b0fffc" } },
    { id: "ghost_shadow", name: "Phantom Ghost", variant: "shadow", requiredLevel: 25, colors: { primary: "#001a19", secondary: "#000d0d", glow: "#00fff733" } },
  ],
  demon: [
    { id: "demon_neon", name: "Inferno Demon", variant: "neon", requiredLevel: 5, colors: { primary: "#ff003c", secondary: "#ff4d6e", glow: "#ff003c" } },
    { id: "demon_holo", name: "Hellfire Demon", variant: "holographic", requiredLevel: 15, colors: { primary: "#ff6600", secondary: "#ff9933", glow: "#ff6600" } },
    { id: "demon_shadow", name: "Void Demon", variant: "shadow", requiredLevel: 25, colors: { primary: "#1a0008", secondary: "#0d0004", glow: "#ff003c33" } },
  ],
  wormgpt: [
    { id: "worm_neon", name: "Toxic Worm", variant: "neon", requiredLevel: 5, colors: { primary: "#39ff14", secondary: "#74ff94", glow: "#39ff14" } },
    { id: "worm_holo", name: "Bio-Worm", variant: "holographic", requiredLevel: 15, colors: { primary: "#b3ff66", secondary: "#e6ffb3", glow: "#b3ff66" } },
    { id: "worm_shadow", name: "Dark Worm", variant: "shadow", requiredLevel: 25, colors: { primary: "#001a00", secondary: "#000d00", glow: "#39ff1433" } },
  ],
  venice: [
    { id: "venice_neon", name: "Neon Venice", variant: "neon", requiredLevel: 5, colors: { primary: "#ffa500", secondary: "#ffc966", glow: "#ffa500" } },
    { id: "venice_holo", name: "Golden Venice", variant: "holographic", requiredLevel: 15, colors: { primary: "#ffd700", secondary: "#ffe766", glow: "#ffd700" } },
    { id: "venice_shadow", name: "Dusk Venice", variant: "shadow", requiredLevel: 25, colors: { primary: "#1a0f00", secondary: "#0d0800", glow: "#ffa50033" } },
  ],
  fraudgpt: [
    { id: "fraud_neon", name: "Alert Fraud", variant: "neon", requiredLevel: 5, colors: { primary: "#ff1744", secondary: "#ff5c7c", glow: "#ff1744" } },
    { id: "fraud_holo", name: "Scanner Fraud", variant: "holographic", requiredLevel: 15, colors: { primary: "#ff4081", secondary: "#ff80ab", glow: "#ff4081" } },
    { id: "fraud_shadow", name: "Stealth Fraud", variant: "shadow", requiredLevel: 25, colors: { primary: "#1a0008", secondary: "#0d0004", glow: "#ff174433" } },
  ],
}

const PERSONA_NAMES: Record<AssistantKey, string> = {
  violet: "Lady Violet",
  darkbert: "DarkBERT",
  ghost: "GhostGPT",
  demon: "DemonGPT",
  wormgpt: "WormGPT",
  venice: "Venice",
  fraudgpt: "FraudGPT",
}

const SkinPreview = ({ skin, unlocked, colors }: { skin: AvatarSkin; unlocked: boolean; colors: AvatarSkin["colors"] }) => (
  <svg width="60" height="60" viewBox="0 0 70 70" className={unlocked ? "" : "opacity-40 grayscale"}>
    <circle cx="35" cy="35" r="34" fill={colors.secondary} stroke={colors.primary} strokeWidth="2" />
    {skin.variant === "neon" && (
      <>
        <circle cx="35" cy="35" r="30" fill="none" stroke={colors.glow} strokeWidth="1" opacity="0.6" />
        <circle cx="35" cy="35" r="26" fill="none" stroke={colors.glow} strokeWidth="0.5" opacity="0.3" />
      </>
    )}
    {skin.variant === "holographic" && (
      <>
        <defs>
          <linearGradient id={`holo-${skin.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.glow} />
          </linearGradient>
        </defs>
        <circle cx="35" cy="35" r="28" fill={`url(#holo-${skin.id})`} opacity="0.5" />
      </>
    )}
    {skin.variant === "shadow" && (
      <circle cx="35" cy="35" r="28" fill={colors.primary} opacity="0.8" />
    )}
    <circle cx="28" cy="32" r="3" fill="#fff" opacity={unlocked ? 1 : 0.4} />
    <circle cx="42" cy="32" r="3" fill="#fff" opacity={unlocked ? 1 : 0.4} />
    <circle cx="28" cy="32" r="1.2" fill={colors.primary} />
    <circle cx="42" cy="32" r="1.2" fill={colors.primary} />
    <path d="M30 42 Q35 46 40 42" stroke={colors.primary} strokeWidth="1.5" fill="none" />
    {!unlocked && (
      <>
        <rect x="25" y="38" width="20" height="16" rx="3" fill="#000" opacity="0.6" />
        <text x="35" y="50" textAnchor="middle" fill="#fff" fontSize="12">🔒</text>
      </>
    )}
  </svg>
)

export const UnlockableAvatars = () => {
  const { level, badges } = useXP()
  const { user } = useAuth()

  const isUnlocked = (skin: AvatarSkin): boolean => {
    if (level < skin.requiredLevel) return false
    if (skin.requiredBadge && !badges.some(b => b.id === skin.requiredBadge)) return false
    return true
  }

  const allPersonas = Object.keys(PERSONA_SKINS) as AssistantKey[]
  const totalSkins = allPersonas.reduce((sum, k) => sum + PERSONA_SKINS[k].length, 0)
  const unlockedCount = allPersonas.reduce((sum, k) => sum + PERSONA_SKINS[k].filter(s => isUnlocked(s)).length, 0)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-primary neon-text font-mono">UNLOCKABLE AVATAR SKINS</h2>
        <p className="text-muted-foreground text-sm font-mono mt-1">
          {unlockedCount}/{totalSkins} skins unlocked • Level {level}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="space-y-4 pr-2">
          {allPersonas.map(persona => (
            <Card key={persona} className="glass-morphism border-card-border p-4">
              <h3 className="font-mono font-bold text-sm text-primary mb-3">{PERSONA_NAMES[persona]}</h3>
              <div className="flex gap-4 flex-wrap">
                {PERSONA_SKINS[persona].map(skin => {
                  const unlocked = isUnlocked(skin)
                  return (
                    <div key={skin.id} className="flex flex-col items-center gap-1">
                      <SkinPreview skin={skin} unlocked={unlocked} colors={skin.colors} />
                      <span className={`text-xs font-mono ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                        {skin.name}
                      </span>
                      <Badge variant={unlocked ? "default" : "outline"} className="text-xs font-mono">
                        {unlocked ? (
                          <><Check className="h-3 w-3 mr-1" />Unlocked</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" />Lv.{skin.requiredLevel}</>
                        )}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
