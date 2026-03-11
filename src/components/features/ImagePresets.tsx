import { Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ImagePresetsProps {
  onApplyPreset: (prompt: string, style: string) => void
}

const presets = [
  {
    name: "Neon Street",
    style: "cyberpunk",
    prompt: "A rain-soaked cyberpunk street at night, neon signs reflecting on wet asphalt, holographic advertisements, steam rising from grates",
    tags: ["cyberpunk", "urban", "night"],
  },
  {
    name: "Ghost in the Shell",
    style: "anime",
    prompt: "A futuristic cyborg woman overlooking a sprawling megacity, cybernetic implants glowing, inspired by Ghost in the Shell aesthetic",
    tags: ["anime", "sci-fi", "character"],
  },
  {
    name: "Hacker Terminal",
    style: "darkweb",
    prompt: "A dimly lit hacker workstation with multiple monitors showing green code, scattered energy drinks, cables everywhere, moody lighting",
    tags: ["hacker", "dark", "tech"],
  },
  {
    name: "Digital Heist",
    style: "glitch",
    prompt: "A figure in a hoodie walking through a corridor of corrupted data streams, glitch effects, digital rain, vaporwave colors",
    tags: ["glitch", "action", "digital"],
  },
  {
    name: "Retro Sunset",
    style: "synthwave",
    prompt: "A DeLorean driving on an infinite highway toward a massive synthwave sun, chrome reflections, palm trees silhouetted, 80s grid landscape",
    tags: ["retro", "synthwave", "vehicle"],
  },
  {
    name: "Cyber Samurai",
    style: "cyberpunk",
    prompt: "A futuristic samurai with a plasma katana standing on a Tokyo rooftop, cherry blossoms mixed with circuit board patterns, dramatic lighting",
    tags: ["warrior", "japan", "action"],
  },
  {
    name: "AI Portrait",
    style: "photorealistic",
    prompt: "A photorealistic portrait of a person with subtle cybernetic eye implants, circuit-trace tattoos glowing softly under skin, studio lighting",
    tags: ["portrait", "realistic", "character"],
  },
  {
    name: "Data Vault",
    style: "darkweb",
    prompt: "An underground server room with endless racks of blinking servers, laser grid security, a lone figure accessing a terminal",
    tags: ["tech", "dark", "architecture"],
  },
  {
    name: "Mech Workshop",
    style: "anime",
    prompt: "A cluttered workshop where a mechanic works on a massive battle mech, sparks flying, anime style, warm industrial lighting",
    tags: ["mech", "anime", "workshop"],
  },
  {
    name: "Neon Dragon",
    style: "synthwave",
    prompt: "A massive neon dragon coiling around a skyscraper, synthwave color palette, dramatic perspective from below, city lights",
    tags: ["fantasy", "creature", "urban"],
  },
]

export const ImagePresets = ({ onApplyPreset }: ImagePresetsProps) => {
  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="grid grid-cols-1 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onApplyPreset(preset.prompt, preset.style)}
            className="text-left p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                {preset.name}
              </span>
              <Zap className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground font-mono line-clamp-2 mb-2">{preset.prompt}</p>
            <div className="flex gap-1">
              {preset.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-mono px-1.5 py-0">{tag}</Badge>
              ))}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
