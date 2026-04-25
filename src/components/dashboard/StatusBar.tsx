import { useEffect, useState } from "react"
import { Cpu, Activity, Wifi } from "lucide-react"

const VERSION = "v1.0.0"

export const StatusBar = () => {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  // pseudo telemetry — purely cosmetic
  const seed = tick + 1
  const sys = 30 + ((seed * 17) % 60)
  const cpu = 20 + ((seed * 23) % 70)
  const net = 40 + ((seed * 11) % 55)

  return (
    <footer className="holo-card mx-3 mb-3 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="text-primary/80 font-bold">PANTHEON PROTOCOL</span>
        <span>{VERSION}</span>
        <span className="hidden md:inline">— For Educational Purposes Only</span>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <Telemetry icon={Activity} label="SYS" value={sys} tone="text-secondary" />
        <Telemetry icon={Cpu}      label="CPU" value={cpu} tone="text-primary" />
        <Telemetry icon={Wifi}     label="NET" value={net} tone="text-accent" />
      </div>
    </footer>
  )
}

const Telemetry = ({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) => (
  <div className="flex items-center gap-1.5">
    <Icon className={`h-3 w-3 ${tone}`} />
    <span>{label}</span>
    <span className={`${tone} tabular-nums`}>{value.toString().padStart(2, "0")}%</span>
  </div>
)
