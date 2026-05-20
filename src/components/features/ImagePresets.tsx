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
  {
    name: "Chrome Netrunner",
    style: "cyberpunk",
    prompt: "A chrome-plated netrunner jacked into a neural deck, fiber-optic cables sprouting from skull ports, magenta and cyan glow, rim lighting, ultra-detailed",
    tags: ["cyberpunk", "character", "neon"],
  },
  {
    name: "Megacity Skyline",
    style: "cyberpunk",
    prompt: "Endless megacity skyline at dusk, kilometer-tall arcology towers, flying cars, volumetric fog, holographic billboards in kanji, Blade Runner 2049 vibe",
    tags: ["cyberpunk", "city", "epic"],
  },
  {
    name: "Back-Alley Ripperdoc",
    style: "cyberpunk",
    prompt: "A back-alley ripperdoc clinic, surgical lights over a chrome chair, jars of cybernetic eyes, neon kanji signs, gritty and atmospheric",
    tags: ["cyberpunk", "interior", "gritty"],
  },
  {
    name: "Neon Yakuza",
    style: "cyberpunk",
    prompt: "A tattooed cyber-yakuza enforcer in a rain-soaked Tokyo alley, mono-katana with plasma edge, LED tattoos pulsing under skin, cinematic",
    tags: ["cyberpunk", "character", "rain"],
  },
  {
    name: "Holo-Idol Concert",
    style: "cyberpunk",
    prompt: "A holographic pop idol performing above a packed neon crowd, lasers, augmented reality particles, vaporwave palette, crowd silhouettes",
    tags: ["cyberpunk", "concert", "neon"],
  },
  {
    name: "Rogue AI Server",
    style: "darkweb",
    prompt: "A self-aware rogue AI manifesting as a glowing eye inside a black server core, tendrils of light reaching into cables, eerie red illumination",
    tags: ["ai", "dark", "tech"],
  },
  {
    name: "Drone Swarm",
    style: "cyberpunk",
    prompt: "A swarm of black combat drones over a neon-drenched downtown, searchlights cutting through smoke, civilians fleeing, dystopian",
    tags: ["cyberpunk", "action", "dystopia"],
  },
  {
    name: "Cyber Witch",
    style: "cyberpunk",
    prompt: "A cyber-witch casting a glitchy spell with floating holographic runes, neon purple smoke, augmented reality interface around her hands, dark studio backdrop",
    tags: ["cyberpunk", "character", "magic"],
  },
  {
    name: "Underground Race",
    style: "synthwave",
    prompt: "Two neon-lit hover bikes racing through a tunnel of fluorescent graffiti, motion blur, sparks, retro-futurist style",
    tags: ["synthwave", "action", "vehicle"],
  },
  {
    name: "Black ICE",
    style: "darkweb",
    prompt: "Visualization of black ICE intrusion countermeasures: a fractal wall of red glowing code closing in on a tiny pixel-figure netrunner, abstract and menacing",
    tags: ["hacker", "abstract", "dark"],
  },
  {
    name: "Neo-Tokyo Noodle Bar",
    style: "cyberpunk",
    prompt: "A cramped neon noodle bar in Neo-Tokyo, steam rising, neon signs reflecting in chrome counters, lone hooded customer eating ramen, Blade Runner aesthetic",
    tags: ["cyberpunk", "interior", "noir"],
  },
  {
    name: "Augmented Detective",
    style: "cyberpunk",
    prompt: "A trench-coated detective with a glowing augmented-reality monocle scanning a crime scene in a neon alley, holographic evidence tags floating mid-air",
    tags: ["cyberpunk", "noir", "character"],
  },
  {
    name: "Corpo Tower",
    style: "cyberpunk",
    prompt: "A colossal megacorp tower piercing acid-rain clouds, holographic logo rotating at the summit, drone traffic, low-angle hero shot, dystopian",
    tags: ["cyberpunk", "architecture", "epic"],
  },
  {
    name: "Pixel Punk Portrait",
    style: "glitch",
    prompt: "A close-up portrait of a punk with neon mohawk, face fragmenting into glitch pixels and scanlines, CRT distortion, vivid magenta and cyan",
    tags: ["glitch", "portrait", "neon"],
  },
  {
    name: "Vapor Shrine",
    style: "synthwave",
    prompt: "A vaporwave Greek shrine floating in pink clouds, marble bust with neon sunglasses, palm trees, 80s grid floor, dreamy pastel sky",
    tags: ["vaporwave", "surreal", "retro"],
  },
  {
    name: "Cyber Cathedral",
    style: "cyberpunk",
    prompt: "Interior of a cyber-cathedral made of black steel and stained-glass LEDs, server racks as pews, a robed AI priest at the altar, volumetric light beams",
    tags: ["cyberpunk", "interior", "epic"],
  },
  {
    name: "Junk City Scavenger",
    style: "cyberpunk",
    prompt: "A scavenger in patchwork armor digging through a mountain of obsolete electronics, sparks, smoke, neon signs glowing in the distance, gritty",
    tags: ["cyberpunk", "character", "gritty"],
  },
  {
    name: "Quantum Hacker",
    style: "darkweb",
    prompt: "A hacker surrounded by floating quantum-state holograms, qubit spheres orbiting, dark room lit only by screens, intense focus",
    tags: ["hacker", "quantum", "tech"],
  },
  {
    name: "Acid Rain Courier",
    style: "cyberpunk",
    prompt: "A bike courier in glowing reflective gear speeding through acid-rain streets, neon reflections streaking, motion blur, cinematic",
    tags: ["cyberpunk", "action", "rain"],
  },
  {
    name: "Glitch Goddess",
    style: "glitch",
    prompt: "A divine female figure made of corrupted data and pixel sort artifacts, halo of broken UI elements, magenta-cyan chromatic aberration",
    tags: ["glitch", "character", "surreal"],
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
