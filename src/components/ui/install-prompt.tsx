import { Download, X, Smartphone, Monitor } from "lucide-react"
import { CyberpunkButton } from "./cyberpunk-button"
import { Card } from "./card"
import { usePWA } from "@/hooks/usePWA"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog"

const DISMISSED_KEY = "pwa-install-dismissed"
const DISMISSED_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [showModal, setShowModal] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop")

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (/android/.test(userAgent)) {
      setPlatform("android")
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios")
    } else {
      setPlatform("desktop")
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISSED_DURATION) return
    }

    // Auto-show after short delay if installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => setShowModal(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setShowModal(false)
  }

  const handleInstall = async () => {
    await installApp()
    setShowModal(false)
  }

  if (!isInstallable || isInstalled) return null

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="glass-morphism border-primary/50 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {platform === "android" ? (
              <Smartphone className="h-8 w-8 text-primary animate-pulse" />
            ) : (
              <Monitor className="h-8 w-8 text-primary animate-pulse" />
            )}
            <DialogTitle className="font-mono text-xl text-primary">
              Install PANTHEON PROTOCOL
            </DialogTitle>
          </div>
          <DialogDescription className="font-mono text-muted-foreground">
            {platform === "android" 
              ? "Add to your home screen for instant access, offline mode, and app-like experience."
              : "Install on your desktop for quick access, offline support, and enhanced performance."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Offline Access
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Faster Loading
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Home Screen Icon
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Full Screen Mode
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <CyberpunkButton
              variant="cyber"
              className="flex-1 font-mono"
              onClick={handleInstall}
            >
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </CyberpunkButton>
            <CyberpunkButton
              variant="ghost"
              onClick={handleDismiss}
            >
              Later
            </CyberpunkButton>
          </div>

          {platform === "ios" && (
            <p className="text-xs text-muted-foreground font-mono text-center border-t border-border/30 pt-3">
              iOS: Tap <span className="text-primary">Share</span> → <span className="text-primary">Add to Home Screen</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}