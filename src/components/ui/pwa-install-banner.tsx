import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { CyberpunkButton } from '@/components/ui/cyberpunk-button';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallBanner = () => {
  const { isInstallable, isInstalled, installApp, isOffline } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if dismissed in last 24 hours
    const dismissedAt = localStorage.getItem('pwa_banner_dismissed');
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    await installApp();
    handleDismiss();
  };

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || isDismissed) return null;

  // For iOS, show different message since they can't use beforeinstallprompt
  if (platform === 'ios') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-card via-card/95 to-transparent">
        <div className="max-w-md mx-auto glass-morphism rounded-lg p-4 neon-border">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Install PANTHEON PROTOCOL</h3>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Tap <span className="text-primary">Share</span> → <span className="text-primary">Add to Home Screen</span> for the full app experience
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Android/Desktop with install prompt
  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-card via-card/95 to-transparent">
      <div className="max-w-md mx-auto glass-morphism rounded-lg p-4 neon-border">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            {platform === 'android' ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <Monitor className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">Install PANTHEON PROTOCOL</h3>
            <p className="text-xs text-muted-foreground font-mono mb-3">
              {platform === 'android' 
                ? 'Get the full Android app experience with offline support'
                : 'Install as a desktop app for quick access'
              }
            </p>
            <CyberpunkButton 
              variant="neon" 
              size="sm" 
              onClick={handleInstall}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </CyberpunkButton>
          </div>
        </div>

        {isOffline && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-secondary font-mono text-center">
              📡 Currently offline - Using cached content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
