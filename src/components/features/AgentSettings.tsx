import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAgentSettings } from "@/hooks/useAgentSettings"
import { useAuth } from "@/contexts/AuthContext"
import { assistants, type AssistantKey } from "@/lib/assistants"
import { Upload, Save, Settings2, Globe, Shield, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface AgentSettingsProps {
  assistantKey: AssistantKey
  onClose?: () => void
}

export const AgentSettings = ({ assistantKey, onClose }: AgentSettingsProps) => {
  const { user } = useAuth()
  const { settings, loading, updateSettings, uploadAgentAvatar } = useAgentSettings(assistantKey)
  const [customInstructions, setCustomInstructions] = useState("")
  const [torEnabled, setTorEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const assistant = assistants[assistantKey]

  useEffect(() => {
    if (settings) {
      setCustomInstructions(settings.custom_instructions || "")
      setTorEnabled(settings.tor_enabled)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateSettings({
      custom_instructions: customInstructions || null,
      tor_enabled: torEnabled
    })
    setSaving(false)

    if (error) {
      toast.error("Failed to save settings")
    } else {
      toast.success("Settings saved!")
      onClose?.()
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { url, error } = await uploadAgentAvatar(file)
    setUploading(false)

    if (error) {
      toast.error("Failed to upload avatar")
    } else {
      toast.success("Avatar uploaded!")
    }
  }

  if (!user) {
    return (
      <Card className="glass-morphism border-card-border p-6">
        <div className="text-center py-8">
          <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">
            Sign in to customize agent settings
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-morphism border-card-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-primary">
          {assistant.name} Settings
        </h3>
      </div>

      <div className="space-y-6">
        {/* Custom Avatar */}
        <div className="space-y-3">
          <label className="text-sm font-mono text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Custom Avatar
          </label>
          <div className="flex items-center gap-4">
            {settings?.custom_avatar_url ? (
              <img
                src={settings.custom_avatar_url}
                alt="Custom avatar"
                className="w-16 h-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full border-2 border-card-border flex items-center justify-center"
                style={{ backgroundColor: assistant.avatarColor + "33" }}
              >
                <span className="text-2xl font-bold" style={{ color: assistant.avatarColor }}>
                  {assistant.name[0]}
                </span>
              </div>
            )}
            <label className="cursor-pointer">
              <CyberpunkButton variant="ghost" asChild disabled={uploading}>
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </div>
              </CyberpunkButton>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-3">
          <label className="text-sm font-mono text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Custom Instructions
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add custom instructions for this agent... (e.g., 'Always respond in formal English', 'Focus on cybersecurity topics')"
            className="w-full h-32 bg-background border border-card-border rounded-lg p-3 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground font-mono">
            These instructions will be added to the agent's system prompt.
          </p>
        </div>

        {/* Tor Network Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-mono text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Tor Network Mode
            </label>
            <Switch
              checked={torEnabled}
              onCheckedChange={setTorEnabled}
            />
          </div>
          <div className="flex items-center gap-2">
            {torEnabled ? (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                TOR ENABLED
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                CLEAR WEB
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {torEnabled 
              ? "Agent will search through Tor network for .onion sites and enhanced privacy."
              : "Agent will use standard web search on the clear web."}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-4">
          <CyberpunkButton variant="neon" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </CyberpunkButton>
          {onClose && (
            <CyberpunkButton variant="ghost" onClick={onClose}>
              Cancel
            </CyberpunkButton>
          )}
        </div>
      </div>
    </Card>
  )
}
