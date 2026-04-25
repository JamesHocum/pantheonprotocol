import { Search, BookOpen, Shield, Bug, Lock, Trophy, Cpu, ChevronRight } from "lucide-react"

interface AcademyModulesRailProps {
  onOpenAcademy?: (subTab?: string) => void
}

const modules = [
  { id: "recon",    title: "Reconnaissance",  desc: "Information gathering, OSINT, footprinting fundamentals.",  icon: Search,  color: "hsl(180 100% 55%)", subTab: "courses" },
  { id: "prompt",   title: "Prompt Engineering", desc: "AI red-teaming concepts and defensive prompt design.", icon: BookOpen, color: "hsl(280 100% 70%)", subTab: "courses" },
  { id: "secure",   title: "Secure Systems",  desc: "Hardening, configuration audits, secure architecture.",   icon: Shield,  color: "hsl(140 100% 55%)", subTab: "courses" },
  { id: "exploit",  title: "Exploit Analysis", desc: "Vulnerability research and CVE breakdowns (theory).",    icon: Bug,     color: "hsl(0 100% 62%)",   subTab: "exercises" },
  { id: "defense",  title: "Defensive Ops",   desc: "Blue-team monitoring, detection, incident response.",     icon: Lock,    color: "hsl(35 100% 60%)",  subTab: "toolkits" },
  { id: "ctf",      title: "CTF Arena",       desc: "Authorized capture-the-flag challenges & writeups.",      icon: Trophy,  color: "hsl(320 100% 65%)", subTab: "exercises" },
  { id: "neural",   title: "Neural Lab",      desc: "On-device AI experimentation in a sandboxed environment.", icon: Cpu,    color: "hsl(240 100% 70%)", subTab: "courses" },
]

export const AcademyModulesRail = ({ onOpenAcademy }: AcademyModulesRailProps) => {
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase gradient-text-holo">Academy Modules</h2>
        <button
          onClick={() => onOpenAcademy?.("courses")}
          className="text-[11px] font-mono tracking-widest uppercase text-primary/80 hover:text-primary flex items-center gap-1 transition-colors"
        >
          View All Modules <ChevronRight className="h-3 w-3" />
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onOpenAcademy?.(m.subTab)}
            className="holo-card holo-card-hover p-3 text-left flex flex-col gap-2 group animate-lift-in"
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center border border-current/30"
              style={{ color: m.color, backgroundColor: `${m.color}15` }}
            >
              <m.icon className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-foreground group-hover:text-primary transition-colors">
              {m.title}
            </h3>
            <p className="text-[10px] leading-snug text-muted-foreground font-mono line-clamp-2">{m.desc}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
