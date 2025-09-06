import { useState } from "react"
import { Settings, Shield, Mic, Phone, Search, Download, Smartphone, Image, Video } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface SettingsState {
  offlineMode: boolean
  voiceActivation: boolean
  overlayPermissions: boolean
  webSearch: boolean
  phoneIntegration: boolean
  autoResponder: boolean
  professionalMode: boolean
  imageGeneration: boolean
  videoGeneration: boolean
  customLoras: boolean
}

export const AppSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    offlineMode: false,
    voiceActivation: false,
    overlayPermissions: false,
    webSearch: true,
    phoneIntegration: false,
    autoResponder: false,
    professionalMode: true,
    imageGeneration: true,
    videoGeneration: false,
    customLoras: false,
  })

  const [selectedLora, setSelectedLora] = useState("realistic-v1")

  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">Assistant Configuration</h2>
        <p className="text-muted-foreground font-mono">Configure DarkBERT's capabilities and permissions</p>
      </div>

      {/* Core Assistant Features */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-primary">Core Features</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Offline AI Processing</label>
                <p className="text-xs text-muted-foreground">Run AI models locally on device</p>
              </div>
              <Switch 
                checked={settings.offlineMode}
                onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Voice Activation</label>
                <p className="text-xs text-muted-foreground">Wake word detection and voice commands</p>
              </div>
              <Switch 
                checked={settings.voiceActivation}
                onCheckedChange={(checked) => updateSetting('voiceActivation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Web Search Integration</label>
                <p className="text-xs text-muted-foreground">Real-time internet search capabilities</p>
              </div>
              <Switch 
                checked={settings.webSearch}
                onCheckedChange={(checked) => updateSetting('webSearch', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Professional Mode</label>
                <p className="text-xs text-muted-foreground">Secretary/COO assistant capabilities</p>
              </div>
              <Switch 
                checked={settings.professionalMode}
                onCheckedChange={(checked) => updateSetting('professionalMode', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Android App Features */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-bold text-secondary">Mobile Assistant</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Overlay Permissions</label>
                <p className="text-xs text-muted-foreground">Display assistant over other apps</p>
              </div>
              <Switch 
                checked={settings.overlayPermissions}
                onCheckedChange={(checked) => updateSetting('overlayPermissions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Phone Integration</label>
                <p className="text-xs text-muted-foreground">Make calls and manage contacts</p>
              </div>
              <Switch 
                checked={settings.phoneIntegration}
                onCheckedChange={(checked) => updateSetting('phoneIntegration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Auto Responder</label>
                <p className="text-xs text-muted-foreground">Automated professional responses</p>
              </div>
              <Switch 
                checked={settings.autoResponder}
                onCheckedChange={(checked) => updateSetting('autoResponder', checked)}
              />
            </div>
          </div>

          <CyberpunkButton variant="neon" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Android APK
          </CyberpunkButton>
        </div>
      </Card>

      {/* AI Content Generation */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-accent">Content Generation</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Image Generation</label>
                <p className="text-xs text-muted-foreground">AI-powered image creation</p>
              </div>
              <Switch 
                checked={settings.imageGeneration}
                onCheckedChange={(checked) => updateSetting('imageGeneration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Video Generation</label>
                <p className="text-xs text-muted-foreground">AI video synthesis (experimental)</p>
              </div>
              <Switch 
                checked={settings.videoGeneration}
                onCheckedChange={(checked) => updateSetting('videoGeneration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-mono text-foreground">Custom LoRA Models</label>
                <p className="text-xs text-muted-foreground">Specialized model fine-tuning</p>
              </div>
              <Switch 
                checked={settings.customLoras}
                onCheckedChange={(checked) => updateSetting('customLoras', checked)}
              />
            </div>

            {settings.customLoras && (
              <div className="mt-3 p-3 bg-card/30 rounded-lg border border-border/30">
                <label className="block text-sm font-mono text-foreground mb-2">Active LoRA Model</label>
                <Select value={selectedLora} onValueChange={setSelectedLora}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LoRA model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic-v1">Realistic Portrait v1</SelectItem>
                    <SelectItem value="cyberpunk-v2">Cyberpunk Style v2</SelectItem>
                    <SelectItem value="anime-v3">Anime/Manga v3</SelectItem>
                    <SelectItem value="technical-v1">Technical Diagrams v1</SelectItem>
                    <SelectItem value="custom-upload">Upload Custom LoRA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Permission Status */}
      <Card className="glass-morphism border-card-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono">Permission Status</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">MICROPHONE</Badge>
            <Badge variant="outline" className="text-xs">OVERLAY</Badge>
            <Badge variant="outline" className="text-xs">PHONE</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}