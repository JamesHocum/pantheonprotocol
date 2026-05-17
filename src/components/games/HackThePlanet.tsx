import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Terminal } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"

interface Props { onBack: () => void }

type Target = { host: string; ports: number[]; password: string; loot: string }

const TARGETS: Target[] = [
  { host: "ellingson.corp",     ports: [22, 80, 443],         password: "GIBSON",     loot: "Da Vinci virus blueprint" },
  { host: "gibson.mainframe",   ports: [23, 25, 8080],        password: "LOVE",       loot: "Garbage file (the smoking gun)" },
  { host: "acid-burn.local",    ports: [21, 22, 6667],        password: "CRASH",      loot: "Acid Burn's chat logs" },
  { host: "phantom.phreak.net", ports: [80, 1337, 31337],     password: "ZERO_COOL",  loot: "Phone phreak handbook" },
]

const HINT = (pw: string) => pw.split("").map((c, i) => (i === 0 || i === pw.length - 1 ? c : "_")).join(" ")

export const HackThePlanet = ({ onBack }: Props) => {
  const [target, setTarget] = useState(0)
  const [lines, setLines] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [scanned, setScanned] = useState<Record<number, boolean>>({})
  const [stage, setStage] = useState<"recon" | "crack" | "loot" | "done">("recon")
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)

  const t = TARGETS[target]

  const log = (...l: string[]) => setLines(prev => [...prev, ...l])

  useEffect(() => {
    setLines([
      "╔══════════════════════════════════════════╗",
      "║   HACK THE PLANET v1.0 — net-runner OS   ║",
      "╚══════════════════════════════════════════╝",
      "",
      `[+] Target acquired: ${t.host}`,
      `[+] Open ports detected: ${t.ports.length} (unknown)`,
      "",
      "Available commands:",
      "  scan <port>         — probe a port",
      "  crack <password>    — attempt login",
      "  hint                — buy a hint (-50)",
      "  loot                — grab the data (after login)",
      "  help                — show commands",
      "",
      `>>> Mission: gain access and exfiltrate.`,
      "",
    ])
    setStage("recon"); setScanned({}); setAttempts(0)
  }, [target])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [lines])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return
    log(`$ ${cmd}`)
    setInput("")
    const [verb, ...rest] = cmd.toLowerCase().split(/\s+/)

    if (verb === "help") {
      log("Commands: scan <port>, crack <password>, hint, loot")
    } else if (verb === "scan") {
      const port = parseInt(rest[0])
      if (!port) return log("Usage: scan <port>")
      if (scanned[port]) return log(`Port ${port}: already scanned`)
      setScanned(s => ({ ...s, [port]: true }))
      if (t.ports.includes(port)) {
        log(`Port ${port}: OPEN — service detected`,
          port === 22 ? "  └─ SSH banner: 'Welcome to the Gibson'" :
          port === 80 || port === 8080 ? "  └─ HTTP 200 OK — login form found" :
          `  └─ banner leaks: hint='${HINT(t.password)}'`)
        setStage("crack")
        setScore(s => s + 25)
      } else {
        log(`Port ${port}: closed`)
      }
    } else if (verb === "crack") {
      if (stage === "recon") return log("[-] No open services found yet. Try `scan <port>`.")
      const guess = rest.join(" ").toUpperCase()
      setAttempts(a => a + 1)
      if (guess === t.password) {
        log(`[+] ACCESS GRANTED — root@${t.host}`, "    type `loot` to exfiltrate")
        setStage("loot")
        setScore(s => s + Math.max(100, 500 - attempts * 50))
      } else {
        log(`[-] Login failed (${guess})`)
      }
    } else if (verb === "hint") {
      log(`[hint] password matches: ${HINT(t.password)}`)
      setScore(s => Math.max(0, s - 50))
    } else if (verb === "loot") {
      if (stage !== "loot") return log("[-] Not authenticated.")
      log(`[+] Exfiltrating "${t.loot}"…`, "[+] Transfer complete. HACK THE PLANET!")
      setStage("done")
    } else if (verb === "clear") {
      setLines([])
    } else {
      log(`unknown command: ${verb}`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <CyberpunkButton variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-3 w-3 mr-1" /> Back to arcade
        </CyberpunkButton>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Terminal className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">SCORE</span>
          <span className="text-primary font-bold">{score}</span>
        </div>
      </div>

      <div className="holo-card scanline p-4 font-mono text-xs bg-black/60 min-h-[420px] max-h-[60vh] overflow-y-auto">
        {lines.map((l, i) => (
          <div key={i} className={l.startsWith("[+]") ? "text-green-400" :
            l.startsWith("[-]") ? "text-red-400" :
            l.startsWith("$") ? "text-primary" :
            l.startsWith("[hint]") ? "text-yellow-400" : "text-foreground/90"}>{l || "\u00A0"}</div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <span className="font-mono text-primary text-sm">root@{t.host}:~$</span>
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent border-b border-primary/40 outline-none font-mono text-sm text-foreground"
          placeholder="scan 22"
        />
      </form>

      {stage === "done" && (
        <div className="flex gap-2">
          <CyberpunkButton variant="neon" size="sm" onClick={() => setTarget((target + 1) % TARGETS.length)}>
            Next target →
          </CyberpunkButton>
        </div>
      )}
    </div>
  )
}
