import { useState } from "react"
import { ChevronDown, Shuffle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ImageModifiersProps {
  onApplyModifier: (modifier: string) => void
}

const modifierCategories: Record<string, { emoji: string; options: string[] }> = {
  Artists: {
    emoji: "🎨",
    options: [
      "in the style of H.R. Giger", "in the style of Syd Mead", "in the style of Moebius",
      "in the style of Simon Stålenhag", "in the style of Beksiński", "in the style of Hajime Sorayama",
      "in the style of Blade Runner concept art", "in the style of Akira Toriyama",
      "in the style of Masamune Shirow", "in the style of Josan Gonzalez",
      "in the style of Katsuhiro Otomo", "in the style of Ashley Wood",
    ],
  },
  Colors: {
    emoji: "🌈",
    options: [
      "neon magenta and cyan palette", "monochrome green terminal", "deep purple and gold",
      "blood red and black", "electric blue glow", "sunset orange and pink",
      "desaturated muted tones", "high contrast black and white",
      "vaporwave pastel gradients", "toxic green and black",
    ],
  },
  "Art Movements & Styles": {
    emoji: "🖼️",
    options: [
      "cyberpunk", "solarpunk", "steampunk", "art deco", "brutalism",
      "neo-noir", "surrealism", "constructivism", "pop art", "dark fantasy",
      "biopunk", "dieselpunk", "afrofuturism", "retro-futurism",
    ],
  },
  "Mediums & Techniques": {
    emoji: "🖌️",
    options: [
      "oil painting", "digital illustration", "pixel art", "3D render",
      "watercolor", "ink sketch", "vector art", "collage", "linocut print",
      "charcoal drawing", "spray paint graffiti", "low poly 3D",
      "isometric design", "holographic material",
    ],
  },
  Photography: {
    emoji: "📸",
    options: [
      "35mm film grain", "long exposure light trails", "macro close-up",
      "tilt-shift miniature", "double exposure", "infrared photography",
      "drone aerial shot", "bokeh background", "golden hour lighting",
      "studio portrait lighting", "street photography", "noir cinematic",
    ],
  },
  "Design Tools & Communities": {
    emoji: "🛠️",
    options: [
      "Dribbble trending style", "Behance featured aesthetic", "ArtStation fantasy style",
      "DeviantArt digital painting", "Figma UI mockup style", "Blender 3D render",
      "Unreal Engine 5 quality", "Cinema 4D abstract", "After Effects motion design",
    ],
  },
  "Descriptive Terms": {
    emoji: "✨",
    options: [
      "highly detailed", "photorealistic", "ethereal", "gritty and raw",
      "minimalist", "ornate and intricate", "dreamlike", "dystopian",
      "luminous", "atmospheric", "cinematic composition", "epic scale",
      "intimate close-up", "abstract geometric",
    ],
  },
  "Culture & Genre": {
    emoji: "🌍",
    options: [
      "Japanese anime", "Korean manhwa", "Western comic book", "Chinese ink painting",
      "African tribal patterns", "Nordic mythology", "Egyptian hieroglyphic",
      "Mayan civilization", "Indian mandala", "Gothic cathedral",
      "Aztec warrior", "Celtic knots",
    ],
  },
  Classic: {
    emoji: "🏛️",
    options: [
      "Renaissance painting", "Baroque dramatic lighting", "Impressionist brushstrokes",
      "Art Nouveau organic curves", "Ukiyo-e woodblock print", "Ancient Greek sculpture",
      "Medieval manuscript illumination", "Romantic era landscape",
    ],
  },
  "Negative Prompts": {
    emoji: "🚫",
    options: [
      "no blur", "no watermark", "no text", "no distortion",
      "no extra limbs", "no artifacts", "no low quality",
      "no oversaturation", "no cropping", "no noise",
    ],
  },
}

export const ImageModifiers = ({ onApplyModifier }: ImageModifiersProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const handleRandom = (category: string) => {
    const options = modifierCategories[category].options
    const random = options[Math.floor(Math.random() * options.length)]
    onApplyModifier(random)
  }

  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="space-y-1">
        {Object.entries(modifierCategories).map(([category, { emoji, options }]) => (
          <div key={category} className="border border-border/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className="w-full flex items-center justify-between p-3 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <span className="text-sm font-mono font-medium text-foreground">{category}</span>
                <Badge variant="outline" className="text-xs font-mono">{options.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRandom(category) }}
                  className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                  title="Random"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </button>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  expandedCategory === category && "rotate-180"
                )} />
              </div>
            </button>
            
            {expandedCategory === category && (
              <div className="p-2 pt-0 flex flex-wrap gap-1.5">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => onApplyModifier(option)}
                    className="text-xs font-mono px-2 py-1 rounded border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
                  >
                    <Plus className="h-3 w-3 inline mr-1" />
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
