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