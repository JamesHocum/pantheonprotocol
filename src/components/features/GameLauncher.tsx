import { Gamepad2, Terminal, Binary, Cpu, Lock, Wifi, Skull, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

const games = [
  {
    name: "HACK_THE_PLANET",
    icon: Terminal,
    description: "Classic terminal hacking simulator. Crack passwords, bypass firewalls, and infiltrate corporate mainframes.",
    genre: "Puzzle / Simulation",
    inspired: "Hackers (1995)",
    color: "#39ff14",
    status: "coming_soon" as const,
  },
  {
    name: "NEUROMANCER",
    icon: Cpu,
    description: "Navigate the cyberspace matrix as a console cowboy. Jack in, steal data, dodge ICE.",
    genre: "Adventure / RPG",
    inspired: "Neuromancer (1988)",
    color: "#00fff7",
    status: "coming_soon" as const,
  },
  {
    name: "CIPHER_BREAK",
    icon: Lock,
    description: "Decode encrypted messages against the clock. Frequency analysis, Caesar shifts, and RSA challenges.",
    genre: "Puzzle / Educational",
    inspired: "The Imitation Game",
    color: "#ff00cc",
    status: "coming_soon" as const,
  },
  {
    name: "WAR_DIALER",
    icon: Wifi,
    description: "Scan phone numbers to find vulnerable modems and BBS systems. Classic 80s phreaking sim.",
    genre: "Strategy / Retro",
    inspired: "WarGames (1983)",
    color: "#ffa500",
    status: "coming_soon" as const,
  },
  {
    name: "ZERO_DAY",
    icon: Skull,
    description: "Race to patch vulnerabilities before black hat hackers exploit them. Tower defense meets hacking.",
    genre: "Tower Defense / Strategy",
    inspired: "Mr. Robot",
    color: "#ff003c",
    status: "coming_soon" as const,
  },
  {
    name: "DARKNET_RUNNER",
    icon: Globe,
    description: "Navigate the dark web maze collecting data fragments while avoiding honeypots and law enforcement.",
    genre: "Roguelike / Stealth",
    inspired: "Watch Dogs",
    color: "#5f5dff",
    status: "coming_soon" as const,
  },
]

export const GameLauncher = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary neon-text">ARCADE // HACKER GAMES</h2>
        </div>
        <p className="text-muted-foreground font-mono text-sm">Classic pop culture hacker games — reimagined</p>
      </div>

      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
          {games.map((game) => {
            const Icon = game.icon
            return (
              <Card
                key={game.name}
                className="glass-morphism border-card-border p-4 hover:border-primary/50 transition-all group relative overflow-hidden"
              >
                <div 
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${game.color}, transparent 70%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg border border-border/30" style={{ borderColor: `${game.color}40` }}>
                      <Icon className="h-6 w-6" style={{ color: game.color }} />
                    </div>
                    <Badge variant="outline" className="text-xs font-mono border-secondary/50 text-secondary">
                      COMING SOON
                    </Badge>
                  </div>
                  
                  <h3 className="font-mono font-bold text-sm mb-1" style={{ color: game.color }}>
                    {game.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mb-3 line-clamp-2">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs font-mono">{game.genre}</Badge>
                    <span className="text-xs text-muted-foreground/60 font-mono italic">{game.inspired}</span>
                  </div>
                  
                  <CyberpunkButton
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={() => toast.info(`${game.name} is under development. Stay tuned!`)}
                  >
                    <Binary className="h-3 w-3 mr-1" />
                    LAUNCH
                  </CyberpunkButton>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
