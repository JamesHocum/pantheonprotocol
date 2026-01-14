import { useState, useEffect } from "react"
import { Wand2, Download, Settings, Video, Image as ImageIcon, Trash2 } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useImageGallery, GeneratedImage } from "@/hooks/useImageGallery"

export const ImageGeneration = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { images: savedImages, saveImageUrl, deleteImage, loading: galleryLoading } = useImageGallery()
  
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk")
  const [contentMode, setContentMode] = useState("image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionImages, setSessionImages] = useState<GeneratedImage[]>([])

  // Combine saved images with session images (for non-logged in users)
  const allImages = user ? savedImages : sessionImages

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, style: selectedStyle },
      })

      if (error) throw error

      if (data.imageUrl) {
        // Save to database if user is logged in
        if (user) {
          const { error: saveError } = await saveImageUrl(data.imageUrl, data.prompt, data.style)
          if (saveError) {
            console.error("Failed to save image:", saveError)
          }
        } else {
          // Add to session images for non-logged in users
          setSessionImages(prev => [{
            id: Date.now().toString(),
            image_url: data.imageUrl,
            prompt: data.prompt,
            style: data.style,
            created_at: new Date().toISOString(),
          }, ...prev])
        }
        toast({ title: "Image generated successfully!" })
      }
    } catch (error: any) {
      console.error("Image generation error:", error)
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `cybercafe-gen-${index}.png`
    link.click()
  }

  const handleDelete = async (imageId: string) => {
    if (!user) {
      setSessionImages(prev => prev.filter(img => img.id !== imageId))
      return
    }
    
    const { error } = await deleteImage(imageId)
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Image deleted" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">AI Content Creation Studio</h2>
        <p className="text-muted-foreground font-mono">Generate images with advanced AI models and style presets</p>
      </div>

      {/* Generation Panel */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          {/* Style Selection (LoRA presets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Style Preset (LoRA)</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="cyberpunk">🌃 Cyberpunk</SelectItem>
                  <SelectItem value="anime">🎌 Anime</SelectItem>
                  <SelectItem value="photorealistic">📷 Photorealistic</SelectItem>
                  <SelectItem value="darkweb">💀 Dark Web Aesthetic</SelectItem>
                  <SelectItem value="synthwave">🌅 Synthwave</SelectItem>
                  <SelectItem value="glitch">📺 Glitch Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Content Type</label>
              <div className="flex gap-2">
                <CyberpunkButton
                  variant={contentMode === "image" ? "cyber" : "ghost"}
                  onClick={() => setContentMode("image")}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </CyberpunkButton>
                <CyberpunkButton
                  variant={contentMode === "video" ? "cyber" : "ghost"}
                  onClick={() => setContentMode("video")}
                  className="flex-1"
                  disabled
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video (Soon)
                </CyberpunkButton>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-mono text-foreground mb-2">Generation Prompt</label>
            <Textarea
              placeholder="Describe your cyberpunk masterpiece..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input border-border text-foreground font-mono min-h-20"
            />
            <p className="text-xs text-accent mt-1 font-mono">
              Style Active: {selectedStyle.toUpperCase()}
            </p>
          </div>

          {/* Generate Button */}
          <CyberpunkButton 
            variant="cyber" 
            className="w-full" 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Image
              </>
            )}
          </CyberpunkButton>
        </div>
      </Card>

      {/* Loading State */}
      {isGenerating && allImages.length === 0 && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-primary font-mono">Generating your artwork...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Images Gallery */}
      {allImages.length > 0 && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary neon-text">
                {user ? "Your Gallery" : "Generated Artwork"}
              </h3>
              <Badge variant="secondary" className="font-mono">
                {allImages.length} images
              </Badge>
            </div>
            
            <ScrollArea className="h-80">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt={img.prompt}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-primary/30 group-hover:border-primary transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <CyberpunkButton
                        variant="neon"
                        size="icon"
                        onClick={() => handleDownload(img.image_url, idx)}
                      >
                        <Download className="h-4 w-4" />
                      </CyberpunkButton>
                      <CyberpunkButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(img.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </CyberpunkButton>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2 text-xs font-mono"
                    >
                      {img.style}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {!user && allImages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center font-mono">
                Sign in to save your images permanently
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
