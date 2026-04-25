import { useState, useEffect } from "react"
import { Bell, Mail, LogIn, Shield, Zap, Sparkles, Wifi, WifiOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { XPDisplay } from "@/components/features/XPDisplay"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import cafeSign from "@/assets/cafe-neon-sign.jpg"

export const TopUtilityBar = () => {
  const { user, profile } = useAuth()
  const { neonIntensity, setNeonIntensity } = useTheme()
  const navigate = useNavigate()
  const [secureLink, setSecureLink] = useState(true)
  const [torEnabled, setTorEnabled] = useState(false)
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  useEffect(() => {
    const handle = () => setOnline(navigator.onLine)
    window.addEventListener("online", handle)
    window.addEventListener("offline", handle)
    return () => {
      window.removeEventListener("online", handle)
      window.removeEventListener("offline", handle)
    }
  }, [])

  return (
    <header className="holo-card mx-3 mt-3 px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      {/* Left cluster: trigger + brand + status */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <SidebarTrigger className="text-muted-foreground hover:text-primary" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary status-dot" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">PROTOCOL</span>
          </div>
          <h1 className="text-base md:text-lg font-bold tracking-[0.18em] uppercase gradient-text-holo whitespace-nowrap">
            Pantheon Protocol
          </h1>
        </div>

        {/* Status pills */}
        <div className="hidden xl:flex items-center gap-2 ml-2">
          <StatusPill
            icon={online ? Wifi : WifiOff}
            label={online ? "SECURE LINK" : "OFFLINE"}
            tone={online ? "secondary" : "destructive"}
            active={secureLink}
            onClick={() => setSecureLink((v) => !v)}
          />
          <StatusPill
            icon={Shield}
            label="TOR"
            tone="primary"
            active={torEnabled}
            onClick={() => setTorEnabled((v) => !v)}
          />
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-widest border-border/60 text-muted-foreground"
          >
            {torEnabled ? "ANON" : "EXPOSED"}
          </Badge>
        </div>
      </div>

      {/* Center: neon café sign */}
      <div className="hidden lg:flex items-center justify-center shrink-0">
        <img
          src={cafeSign}
          alt="Lady Violet's Cyberpunk Café"
          className="h-10 w-auto object-contain animate-neon-pulse opacity-90"
        />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 lg:justify-end flex-wrap">
        {user && <XPDisplay compact />}

        {/* Neon Intensity */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full holo-card holo-card-hover"
          title={`Neon intensity: ${neonIntensity}%`}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <Slider
            value={[neonIntensity]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => setNeonIntensity(v[0])}
            className="w-[110px]"
            aria-label="Neon intensity"
          />
          <Zap className="h-3.5 w-3.5 text-secondary" />
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-primary/60 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-cyberpunk flex items-center justify-center border border-primary/60">
                <span className="text-xs font-bold">
                  {profile?.display_name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <Badge variant="secondary" className="hidden sm:inline-flex font-mono text-[10px] tracking-widest">
              {profile?.display_name?.toUpperCase() || "AGENT"}
            </Badge>
            <CyberpunkButton variant="ghost" size="iconSm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="iconSm" aria-label="Messages">
              <Mail className="h-4 w-4" />
            </CyberpunkButton>
          </div>
        ) : (
          <CyberpunkButton variant="neon" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="h-4 w-4" />
            Sign In
          </CyberpunkButton>
        )}
      </div>
    </header>
  )
}

interface StatusPillProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone: "primary" | "secondary" | "destructive"
  active?: boolean
  onClick?: () => void
}

const StatusPill = ({ icon: Icon, label, tone, active, onClick }: StatusPillProps) => {
  const toneClass =
    tone === "destructive"
      ? "text-destructive border-destructive/40"
      : tone === "primary"
      ? "text-primary border-primary/40"
      : "text-secondary border-secondary/40"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-card/40 text-[10px] font-mono tracking-widest uppercase transition-all hover:bg-card/70 ${toneClass} ${
        active ? "shadow-[0_0_calc(8px*var(--neon-intensity))_currentColor]" : "opacity-70"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
      <span className="w-1.5 h-1.5 rounded-full bg-current status-dot" />
    </button>
  )
}
