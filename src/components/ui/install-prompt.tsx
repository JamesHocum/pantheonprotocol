import { Download, X } from "lucide-react"
import { CyberpunkButton } from "./cyberpunk-button"
import { Card } from "./card"
import { usePWA } from "@/hooks/usePWA"
import { useState } from "react"

export const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(true)

  if (!isInstallable || !isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 glass-morphism border-primary/30 p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-mono text-sm font-bold text-primary mb-1">
            Install DarkBERT AI
          </h3>
          <p className="text-xs text-muted-foreground font-mono mb-3">
            Add to your device for offline access and better performance
          </p>
          <div className="flex gap-2">
            <CyberpunkButton 
              variant="cyber" 
              size="sm" 
              onClick={installApp}
              className="font-mono"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </CyberpunkButton>
            <CyberpunkButton 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
            >
              Later
            </CyberpunkButton>
          </div>
        </div>
        <CyberpunkButton
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </CyberpunkButton>
      </div>
    </Card>
  )
}