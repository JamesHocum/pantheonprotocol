import { useState } from "react"
import { Upload, User, Save, RotateCcw, LogOut } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CyberInput } from "@/components/ui/cyber-input"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export const UserAvatar = () => {
  const { user, profile, updateProfile, uploadAvatar, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const { error } = await uploadAvatar(file)
    setIsUploading(false)

    if (error) {
      toast.error("Failed to upload avatar")
    } else {
      toast.success("Avatar updated!")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await updateProfile({ display_name: displayName })
    setIsSaving(false)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile saved!")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    navigate("/auth")
  }

  if (!user) {
    return (
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary neon-text mb-2">User Profile</h3>
            <p className="text-muted-foreground font-mono text-sm">Sign in to customize your profile</p>
          </div>

          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30">
              <div className="w-full h-full bg-gradient-cyberpunk flex items-center justify-center">
                <User className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
          </div>

          <CyberpunkButton variant="neon" className="w-full" onClick={() => navigate("/auth")}>
            Sign In / Sign Up
          </CyberpunkButton>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-morphism border-card-border p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary neon-text mb-2">User Profile</h3>
          <p className="text-muted-foreground font-mono text-sm">Customize your cyberpunk identity</p>
        </div>

        {/* Current Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-glow-cyber">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-cyberpunk flex items-center justify-center">
                  <User className="h-16 w-16 text-primary-foreground" />
                </div>
              )}
            </div>
            <Badge 
              variant="secondary" 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground"
            >
              {profile?.display_name || "USER"}
            </Badge>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-mono text-foreground">Display Name</label>
            <CyberInput
              variant="terminal"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your alias..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-foreground">Email</label>
            <CyberInput
              variant="terminal"
              value={profile?.email || ""}
              disabled
              className="opacity-60"
            />
          </div>

          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <CyberpunkButton variant="cyber" className="w-full" asChild disabled={isUploading}>
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Avatar"}
                </div>
              </CyberpunkButton>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <CyberpunkButton variant="neon" className="flex-1" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Profile"}
            </CyberpunkButton>
          </div>

          <CyberpunkButton 
            variant="ghost" 
            className="w-full text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </CyberpunkButton>
        </div>
      </div>
    </Card>
  )
}
