import { useState } from "react"
import { Upload, User, Save, RotateCcw } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const UserAvatar = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedAvatar(e.target?.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const presetAvatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b9e9190e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face"
  ]

  return (
    <Card className="glass-morphism border-card-border p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary neon-text mb-2">User Avatar</h3>
          <p className="text-muted-foreground font-mono text-sm">Customize your cyberpunk identity</p>
        </div>

        {/* Current Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-glow-cyber">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-cyberpunk flex items-center justify-center">
                  <User className="h-16 w-16 text-primary-foreground" />
                </div>
              )}
            </div>
            {selectedAvatar && (
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground"
              >
                ACTIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <CyberpunkButton variant="cyber" className="w-full" asChild>
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Custom Avatar"}
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

          {/* Preset Avatars */}
          <div>
            <h4 className="text-sm font-mono text-foreground mb-3">Preset Avatars</h4>
            <div className="grid grid-cols-4 gap-3">
              {presetAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all hover:border-primary hover:shadow-glow-purple ${
                    selectedAvatar === avatar 
                      ? "border-primary shadow-glow-cyber" 
                      : "border-border"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Preset avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <CyberpunkButton variant="neon" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Avatar
            </CyberpunkButton>
            <CyberpunkButton 
              variant="ghost" 
              onClick={() => setSelectedAvatar(null)}
            >
              <RotateCcw className="h-4 w-4" />
            </CyberpunkButton>
          </div>
        </div>
      </div>
    </Card>
  )
}