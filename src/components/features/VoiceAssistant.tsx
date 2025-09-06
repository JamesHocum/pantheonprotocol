import { useState, useEffect } from "react"
import { Mic, MicOff, Phone, PhoneCall, Search, Zap } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VoiceCommand {
  command: string
  action: string
  timestamp: Date
}

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    
    if (!isListening) {
      // Simulate voice activation
      setTimeout(() => {
        const newCommand: VoiceCommand = {
          command: "Hey DarkBERT, search for cybersecurity trends",
          action: "Web Search Initiated",
          timestamp: new Date()
        }
        setRecentCommands(prev => [newCommand, ...prev.slice(0, 4)])
      }, 2000)
    }
  }

  const handlePhoneCall = () => {
    setIsOnCall(!isOnCall)
  }

  const professionalActions = [
    { icon: Search, label: "Web Search", action: "search" },
    { icon: Phone, label: "Make Call", action: "call" },
    { icon: Zap, label: "Quick Action", action: "quick" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">Voice Assistant</h2>
        <p className="text-muted-foreground font-mono">Professional AI secretary and automation</p>
      </div>

      {/* Voice Control Panel */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <CyberpunkButton
              variant={isListening ? "cyber" : "ghost"}
              size="lg"
              className="w-20 h-20 rounded-full"
              onClick={handleVoiceToggle}
            >
              {isListening ? (
                <Mic className="h-8 w-8" />
              ) : (
                <MicOff className="h-8 w-8" />
              )}
            </CyberpunkButton>
            <p className="text-xs font-mono mt-2">
              {isListening ? "LISTENING..." : "TAP TO ACTIVATE"}
            </p>
          </div>

          <div className="text-center">
            <CyberpunkButton
              variant={isOnCall ? "neon" : "ghost"}
              size="lg"
              className="w-20 h-20 rounded-full"
              onClick={handlePhoneCall}
            >
              {isOnCall ? (
                <PhoneCall className="h-8 w-8" />
              ) : (
                <Phone className="h-8 w-8" />
              )}
            </CyberpunkButton>
            <p className="text-xs font-mono mt-2">
              {isOnCall ? "ON CALL" : "PHONE READY"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center mt-4">
          <Badge variant={isListening ? "default" : "secondary"} className="font-mono">
            {isListening ? "VOICE ACTIVE" : "STANDBY MODE"}
          </Badge>
        </div>
      </Card>

      {/* Professional Actions */}
      <Card className="glass-morphism border-card-border p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Quick Professional Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {professionalActions.map((action, index) => (
            <CyberpunkButton
              key={index}
              variant="ghost"
              className="flex flex-col items-center p-4 h-auto"
            >
              <action.icon className="h-6 w-6 mb-2" />
              <span className="text-xs">{action.label}</span>
            </CyberpunkButton>
          ))}
        </div>
      </Card>

      {/* Recent Commands */}
      <Card className="glass-morphism border-card-border p-6">
        <h3 className="text-lg font-bold text-secondary mb-4">Recent Voice Commands</h3>
        <div className="space-y-3">
          {recentCommands.length > 0 ? (
            recentCommands.map((cmd, index) => (
              <div key={index} className="p-3 bg-card/30 rounded border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">{cmd.action}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {cmd.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm font-mono">{cmd.command}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground font-mono text-center py-4">
              No voice commands yet. Activate voice assistant to begin.
            </p>
          )}
        </div>
      </Card>

      {/* Wake Word Settings */}
      <Card className="glass-morphism border-card-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground">Wake Word</h4>
            <p className="text-xs text-muted-foreground">"Hey DarkBERT" or "Assistant"</p>
          </div>
          <Badge variant="secondary" className="font-mono">ACTIVE</Badge>
        </div>
      </Card>
    </div>
  )
}