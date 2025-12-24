import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CyberHeader } from "@/components/layout/CyberHeader"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ImageGeneration } from "@/components/features/ImageGeneration"
import { UserAvatar } from "@/components/features/UserAvatar"
import { AppSettings } from "@/components/features/AppSettings"
import { VoiceAssistant } from "@/components/features/VoiceAssistant"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Image, User, Settings, Mic, LogIn, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const Index = () => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [showTorPrompt, setShowTorPrompt] = useState(false)

  // Check if app is installed and show Tor download prompt
  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    const hasSeenTorPrompt = localStorage.getItem("tor-prompt-seen")
    
    if (isInstalled && !hasSeenTorPrompt) {
      setShowTorPrompt(true)
    }
  }, [])

  const handleTorDownload = () => {
    window.open("https://www.torproject.org/download/", "_blank")
    localStorage.setItem("tor-prompt-seen", "true")
    setShowTorPrompt(false)
  }

  const dismissTorPrompt = () => {
    localStorage.setItem("tor-prompt-seen", "true")
    setShowTorPrompt(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <CyberHeader />
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-primary object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-cyberpunk flex items-center justify-center border-2 border-primary">
                    <span className="text-xs font-bold">{profile?.display_name?.[0] || "U"}</span>
                  </div>
                )}
                <Badge variant="secondary" className="font-mono text-xs">
                  {profile?.display_name || "User"}
                </Badge>
              </div>
            ) : (
              <CyberpunkButton variant="neon" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </CyberpunkButton>
            )}
          </div>
        </div>

        {/* Tor Download Prompt */}
        {showTorPrompt && (
          <div className="glass-morphism rounded-xl border border-secondary p-4 mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-secondary font-bold font-mono">Enhance Privacy with Tor Browser</h4>
              <p className="text-sm text-muted-foreground font-mono">
                Download Tor Browser for enhanced anonymity when using Tor mode.
              </p>
            </div>
            <div className="flex gap-2">
              <CyberpunkButton variant="ghost" size="sm" onClick={dismissTorPrompt}>
                Later
              </CyberpunkButton>
              <CyberpunkButton variant="neon" size="sm" onClick={handleTorDownload}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Download Tor
              </CyberpunkButton>
            </div>
          </div>
        )}
        
        <div className="glass-morphism rounded-xl border border-card-border p-6 h-[calc(100vh-240px)]">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-card-border">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                DarkBERT Chat
              </TabsTrigger>
              <TabsTrigger 
                value="images"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Image className="h-4 w-4 mr-2" />
                AI Studio
              </TabsTrigger>
              <TabsTrigger 
                value="voice"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice AI
              </TabsTrigger>
              <TabsTrigger 
                value="avatar"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-6">
              <TabsContent value="chat" className="h-full mt-0">
                <ChatInterface />
              </TabsContent>
              
              <TabsContent value="images" className="h-full mt-0 overflow-y-auto">
                <ImageGeneration />
              </TabsContent>
              
              <TabsContent value="voice" className="h-full mt-0 overflow-y-auto">
                <VoiceAssistant />
              </TabsContent>
              
              <TabsContent value="avatar" className="h-full mt-0 overflow-y-auto">
                <div className="max-w-md mx-auto">
                  <UserAvatar />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="h-full mt-0 overflow-y-auto">
                <AppSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <InstallPrompt />
    </div>
  )
}

export default Index
