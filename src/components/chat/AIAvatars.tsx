import { AssistantKey } from "@/lib/assistants"
import { useAgentSettings } from "@/hooks/useAgentSettings"
import ladyVioletAvatar from "@/assets/lady-violet-avatar.jpg"
import darkbertAvatar from "@/assets/darkbert-avatar.jpg"
import demonAvatarDefault from "@/assets/demongpt-avatar.png"

interface AvatarProps {
  selected?: boolean
  customUrl?: string | null
}

const wrap = (src: string, alt: string, color: string, selected?: boolean) => (
  <img
    src={src}
    alt={alt}
    className={`w-10 h-10 rounded-full border-2 object-cover`}
    style={{
      borderColor: selected ? color : "hsl(var(--primary))",
      boxShadow: selected ? `0 0 10px ${color}` : undefined,
    }}
  />
)

export const LadyVioletAvatar = ({ selected, customUrl }: AvatarProps) =>
  wrap(customUrl || ladyVioletAvatar, "Lady Violet", "#ff00cc", selected)

export const DarkbertAvatar = ({ selected, customUrl }: AvatarProps) =>
  wrap(customUrl || darkbertAvatar, "DarkBERT", "#5f5dff", selected)

export const DemonAvatar = ({ selected, customUrl }: AvatarProps) =>
  wrap(customUrl || demonAvatarDefault, "DemonGPT", "#ff003c", selected)

export const GhostAvatar = ({ selected, customUrl }: AvatarProps) =>
  customUrl ? wrap(customUrl, "GhostGPT", "#00fff7", selected) : (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#0d1321" stroke="#00fff7" strokeWidth="2"/>
    <ellipse cx="35" cy="40" rx="17" ry="20" fill="#15e6cd" opacity="0.75"/>
    <ellipse cx="35" cy="48" rx="13" ry="12" fill="#76ffe0" opacity="0.6"/>
    <ellipse cx="30" cy="42" rx="3.2" ry="1.7" fill="#fff"/>
    <ellipse cx="40" cy="42" rx="3.2" ry="1.7" fill="#fff"/>
    <circle cx="30" cy="42" r="1.1" fill="#00fff7"/>
    <circle cx="40" cy="42" r="1.1" fill="#00fff7"/>
    <path d="M31 50 Q35 53 39 50" stroke="#00fff7" strokeWidth="1.5" fill="none"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#00fff7" strokeWidth="3"/>}
  </svg>
)

export const WormAvatar = ({ selected, customUrl }: AvatarProps) =>
  customUrl ? wrap(customUrl, "WormGPT", "#39ff14", selected) : (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#101e13" stroke="#39ff14" strokeWidth="2"/>
    <path d="M25 55 Q32 60 40 54 Q50 48 35 20 Q20 40 32 50" fill="none" stroke="#39ff14" strokeWidth="4"/>
    <circle cx="33" cy="40" r="3.5" fill="#74ff94"/>
    <circle cx="37" cy="46" r="2.7" fill="#0f0"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#39ff14" strokeWidth="3"/>}
  </svg>
)

export const VeniceAvatar = ({ selected, customUrl }: AvatarProps) =>
  customUrl ? wrap(customUrl, "Venice", "#ffa500", selected) : (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#1a1a2e" stroke="#ffa500" strokeWidth="2"/>
    <ellipse cx="35" cy="40" rx="16" ry="18" fill="#ff6b35" opacity="0.8"/>
    <ellipse cx="30" cy="42" rx="3" ry="2" fill="#fff"/>
    <ellipse cx="40" cy="42" rx="3" ry="2" fill="#fff"/>
    <path d="M30 50 Q35 54 40 50" stroke="#ffa500" strokeWidth="2" fill="none"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#ffa500" strokeWidth="3"/>}
  </svg>
)

export const FraudAvatar = ({ selected, customUrl }: AvatarProps) =>
  customUrl ? wrap(customUrl, "FraudGPT", "#ff1744", selected) : (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#1a0a0f" stroke="#ff1744" strokeWidth="2"/>
    <path d="M35 20 L45 28 L45 48 L35 55 L25 48 L25 28 Z" fill="#5a0012" stroke="#ff1744" strokeWidth="1.5"/>
    <path d="M35 24 L42 30 L42 46 L35 51 L28 46 L28 30 Z" fill="#8b001f" opacity="0.8"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#ff1744" strokeWidth="3"/>}
  </svg>
)

interface AIAvatarProps {
  assistantKey: AssistantKey
  selected?: boolean
}

export const AIAvatar = ({ assistantKey, selected }: AIAvatarProps) => {
  const { settings } = useAgentSettings(assistantKey)
  const customUrl = settings?.custom_avatar_url
  switch (assistantKey) {
    case "violet":   return <LadyVioletAvatar selected={selected} customUrl={customUrl} />
    case "darkbert": return <DarkbertAvatar  selected={selected} customUrl={customUrl} />
    case "ghost":    return <GhostAvatar     selected={selected} customUrl={customUrl} />
    case "demon":    return <DemonAvatar     selected={selected} customUrl={customUrl} />
    case "wormgpt":  return <WormAvatar      selected={selected} customUrl={customUrl} />
    case "venice":   return <VeniceAvatar    selected={selected} customUrl={customUrl} />
    case "fraudgpt": return <FraudAvatar     selected={selected} customUrl={customUrl} />
    default:         return <DarkbertAvatar  selected={selected} customUrl={customUrl} />
  }
}
