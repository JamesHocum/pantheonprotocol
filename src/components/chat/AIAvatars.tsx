import { AssistantKey } from "@/lib/assistants"
import ladyVioletAvatar from "@/assets/lady-violet-avatar.jpg"
import darkbertAvatar from "@/assets/darkbert-avatar.jpg"

interface AvatarProps {
  selected?: boolean
}

export const LadyVioletAvatar = ({ selected }: AvatarProps) => (
  <img
    src={ladyVioletAvatar}
    alt="Lady Violet"
    className={`w-10 h-10 rounded-full border-2 ${
      selected ? "border-[#ff00cc] shadow-[0_0_10px_#ff00cc]" : "border-primary"
    }`}
  />
)

export const DarkbertAvatar = ({ selected }: AvatarProps) => (
  <img
    src={darkbertAvatar}
    alt="DarkBERT"
    className={`w-10 h-10 rounded-full border-2 ${
      selected ? "border-[#5f5dff] shadow-[0_0_10px_#5f5dff]" : "border-primary"
    }`}
  />
)

export const GhostAvatar = ({ selected }: AvatarProps) => (
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

export const DemonAvatar = ({ selected }: AvatarProps) => (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#1a0f23" stroke="#ff003c" strokeWidth="2"/>
    <ellipse cx="35" cy="38" rx="18" ry="22" fill="#560018" />
    <ellipse cx="35" cy="41" rx="13" ry="16" fill="#ad002b" />
    <path d="M20 23 Q17 10 28 19" stroke="#ff003c" strokeWidth="4" fill="none"/>
    <path d="M50 23 Q53 10 42 19" stroke="#ff003c" strokeWidth="4" fill="none"/>
    <ellipse cx="29" cy="42" rx="3.5" ry="2" fill="#fff"/>
    <ellipse cx="41" cy="42" rx="3.5" ry="2" fill="#fff"/>
    <circle cx="29" cy="42" r="1.2" fill="#ff003c"/>
    <circle cx="41" cy="42" r="1.2" fill="#ff003c"/>
    <path d="M29 52 Q35 57 41 52" stroke="#fff" strokeWidth="2" fill="none"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#ff003c" strokeWidth="3"/>}
  </svg>
)

export const WormAvatar = ({ selected }: AvatarProps) => (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#101e13" stroke="#39ff14" strokeWidth="2"/>
    <path d="M25 55 Q32 60 40 54 Q50 48 35 20 Q20 40 32 50" fill="none" stroke="#39ff14" strokeWidth="4"/>
    <circle cx="33" cy="40" r="3.5" fill="#74ff94"/>
    <circle cx="37" cy="46" r="2.7" fill="#0f0"/>
    <ellipse cx="31" cy="28" rx="2.2" ry="1.5" fill="#fff"/>
    <ellipse cx="38.5" cy="28" rx="2.2" ry="1.5" fill="#fff"/>
    <path d="M32 31 L32 34" stroke="#fff" strokeWidth="1"/>
    <path d="M38 31 L38 34" stroke="#fff" strokeWidth="1"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#39ff14" strokeWidth="3"/>}
  </svg>
)

export const VeniceAvatar = ({ selected }: AvatarProps) => (
  <svg width="40" height="40" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="34" fill="#1a1a2e" stroke="#ffa500" strokeWidth="2"/>
    <ellipse cx="35" cy="40" rx="16" ry="18" fill="#ff6b35" opacity="0.8"/>
    <ellipse cx="30" cy="42" rx="3" ry="2" fill="#fff"/>
    <ellipse cx="40" cy="42" rx="3" ry="2" fill="#fff"/>
    <circle cx="30" cy="42" r="1.2" fill="#ffa500"/>
    <circle cx="40" cy="42" r="1.2" fill="#ffa500"/>
    <path d="M30 50 Q35 54 40 50" stroke="#ffa500" strokeWidth="2" fill="none"/>
    {selected && <circle cx="35" cy="35" r="34" fill="none" stroke="#ffa500" strokeWidth="3"/>}
  </svg>
)

interface AIAvatarProps {
  assistantKey: AssistantKey
  selected?: boolean
}

export const AIAvatar = ({ assistantKey, selected }: AIAvatarProps) => {
  switch (assistantKey) {
    case "violet":
      return <LadyVioletAvatar selected={selected} />
    case "darkbert":
      return <DarkbertAvatar selected={selected} />
    case "ghost":
      return <GhostAvatar selected={selected} />
    case "demon":
      return <DemonAvatar selected={selected} />
    case "wormgpt":
      return <WormAvatar selected={selected} />
    case "venice":
      return <VeniceAvatar selected={selected} />
    default:
      return <DarkbertAvatar selected={selected} />
  }
}
