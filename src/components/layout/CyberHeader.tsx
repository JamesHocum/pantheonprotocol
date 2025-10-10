import { useState } from "react"
import { Shield, Wifi, WifiOff, Upload, Settings, Cpu } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import cafeSign from "@/assets/cafe-neon-sign.jpg"

export const CyberHeader = () => {
  const [torEnabled, setTorEnabled] = useState(false)
  const [connected, setConnected] = useState(true)

  return (
    <header className="relative w-full">
      {/* Platform Title Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-background via-card to-background border-b-2 border-primary/30 mb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div className="relative px-6 py-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-xs font-mono tracking-wider">PROTOCOL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
            PANTHEON PROTOCOL: ROGUE AI RUSHMORE
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono tracking-wider">ACTIVE</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
        {/* Steampunk gears accent */}
        <div className="absolute top-0 left-4 w-8 h-8 border-2 border-card-border rounded-full opacity-20" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
        <div className="absolute bottom-0 right-4 w-6 h-6 border-2 border-card-border rounded-full opacity-20" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
      </div>

      {/* Neon Cafe Sign */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img 
            src={cafeSign} 
            alt="Lady Violets Cyberpunk Cafe" 
            className="h-24 w-auto object-contain animate-neon-pulse"
          />
          <div className="absolute inset-0 bg-gradient-neon opacity-30 rounded-lg blur-sm"></div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-morphism rounded-lg p-4 mb-6 neon-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <Wifi className="h-5 w-5 text-secondary animate-pulse" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <span className="text-sm font-mono">
                {connected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>

            {/* Tor VPN Toggle */}
            <div className="flex items-center gap-3 px-3 py-1 rounded-md bg-card/50 border border-card-border">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-sm font-mono text-foreground">TOR</span>
              <ToggleSwitch
                variant="tor"
                checked={torEnabled}
                onCheckedChange={setTorEnabled}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {torEnabled ? "SECURE" : "EXPOSED"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <CyberpunkButton variant="ghost" size="icon">
              <Upload className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Cpu className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </CyberpunkButton>
          </div>
        </div>
      </div>
    </header>
  )
}