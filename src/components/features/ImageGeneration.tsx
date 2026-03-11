import { useState, useRef } from "react"
import { Wand2, Download, Settings, Video, Image as ImageIcon, Trash2, Upload, X, ArrowRightLeft } from "lucide-react"
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

type GenerationMode = "text-to-image" | "image-to-image" | "image-to-video"

const resizeImage = (base64: string, maxSize = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxSize && height <= maxSize) {
        resolve(base64)
        return
      }
      const scale = maxSize / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas not supported")); return }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = base64
  })
}

export const ImageGeneration = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { images: savedImages, saveImageUrl, deleteImage } = useImageGallery()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk")
  const [mode, setMode] = useState<GenerationMode>("text-to-image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [sessionImages, setSessionImages] = useState<GeneratedImage[]>([])
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)

  const allImages = user ? savedImages : sessionImages

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" })
      return
    }
    setIsProcessingImage(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        setSourcePreview(base64)
        const resized = await resizeImage(base64, 1024)
        setSourceImage(resized)
        if (mode === "text-to-image") setMode("image-to-image")
      } catch {
        toast({ title: "Failed to process image", variant: "destructive" })
      } finally {
        setIsProcessingImage(false)
      }
    }
    reader.onerror = () => {
      setIsProcessingImage(false)
      toast({ title: "Failed to read image file", variant: "destructive" })
    }
    reader.readAsDataURL(file)
  }

  const clearSourceImage = () => {
    setSourceImage(null)
    setSourcePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (mode === "image-to-image") setMode("text-to-image")
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (mode === "image-to-image" && !sourceImage) {
      toast({ title: "Upload a source image first", variant: "destructive" })
      return
    }
    if (mode === "image-to-video") {
      toast({ title: "Video generation coming soon!", description: "Stay tuned for this feature." })
      return
    }

    setIsGenerating(true)
    try {
      const body: any = { prompt, style: selectedStyle }
      if (mode === "image-to-image" && sourceImage) {
        body.sourceImage = sourceImage
      }

      const { data, error } = await supabase.functions.invoke("generate-image", { body })
      if (error) throw error

      if (data.imageUrl) {
        if (user) {
          const { error: saveError } = await saveImageUrl(data.imageUrl, data.prompt, data.style)
          if (saveError) console.error("Failed to save image:", saveError)
        } else {
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
      const msg = error.message || "Failed to generate image"
      const description = msg.includes("payload") || msg.includes("too large")
        ? "Image may be too large. Try a smaller image."
        : msg
      toast({ title: "Generation failed", description, variant: "destructive" })
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
      toast({ title: "Delete failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Image deleted" })
    }
  }

  const modeConfig = {
    "text-to-image": { icon: ImageIcon, label: "Text → Image", description: "Describe what you want" },
    "image-to-image": { icon: ArrowRightLeft, label: "Image → Image", description: "Transform an uploaded image" },
    "image-to-video": { icon: Video, label: "Image → Video", description: "Coming soon" },
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">AI Content Creation Studio</h2>
        <p className="text-muted-foreground font-mono">Generate and transform images with advanced AI models</p>
      </div>

      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="block text-sm font-mono text-foreground mb-2">Generation Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(modeConfig) as GenerationMode[]).map((m) => {
                const cfg = modeConfig[m]
                const Icon = cfg.icon
                return (
                  <CyberpunkButton
                    key={m}
                    variant={mode === m ? "cyber" : "ghost"}
                    onClick={() => {
                      setMode(m)
                      if (m === "text-to-image") clearSourceImage()
                    }}
                    className="flex-col h-auto py-3 text-xs"
                    disabled={m === "image-to-video"}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    {cfg.label}
                  </CyberpunkButton>
                )
              })}
            </div>
          </div>

          {/* Source Image Upload (for image-to-image) */}
          {mode === "image-to-image" && (
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Source Image</label>
              {sourcePreview ? (
                <div className="relative inline-block">
                  <img src={sourcePreview} alt="Source" className="max-h-40 rounded-lg border-2 border-primary/40" />
                  <button
                    onClick={clearSourceImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/40 rounded-lg p-8 text-center cursor-pointer hover:border-primary/70 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-mono">Click to upload an image</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          {/* Style + Prompt */}
          <div>
            <label className="block text-sm font-mono text-foreground mb-2">Style Preset</label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="cyberpunk">🌃 Cyberpunk</SelectItem>
                <SelectItem value="anime">🎌 Anime</SelectItem>
                <SelectItem value="photorealistic">📷 Photorealistic</SelectItem>
                <SelectItem value="darkweb">💀 Dark Web</SelectItem>
                <SelectItem value="synthwave">🌅 Synthwave</SelectItem>
                <SelectItem value="glitch">📺 Glitch Art</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-mono text-foreground mb-2">
              {mode === "image-to-image" ? "Edit Instructions" : "Generation Prompt"}
            </label>
            <Textarea
              placeholder={mode === "image-to-image" ? "Describe how to transform the image..." : "Describe your cyberpunk masterpiece..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input border-border text-foreground font-mono min-h-20"
            />
            <p className="text-xs text-accent mt-1 font-mono">
              Mode: {modeConfig[mode].label} · Style: {selectedStyle.toUpperCase()}
            </p>
          </div>

          <CyberpunkButton
            variant="cyber"
            className="w-full"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || (mode === "image-to-image" && !sourceImage)}
          >
            {isGenerating ? (
              <><Settings className="h-4 w-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-2" />{mode === "image-to-image" ? "Transform Image" : "Generate Image"}</>
            )}
          </CyberpunkButton>
        </div>
      </Card>

      {/* Loading */}
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

      {/* Gallery */}
      {allImages.length > 0 && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary neon-text">
                {user ? "Your Gallery" : "Generated Artwork"}
              </h3>
              <Badge variant="secondary" className="font-mono">{allImages.length} images</Badge>
            </div>
            <ScrollArea className="h-80">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt={img.prompt} className="w-full aspect-square object-cover rounded-lg border-2 border-primary/30 group-hover:border-primary transition-colors" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <CyberpunkButton variant="neon" size="icon" onClick={() => handleDownload(img.image_url, idx)}>
                        <Download className="h-4 w-4" />
                      </CyberpunkButton>
                      <CyberpunkButton variant="ghost" size="icon" onClick={() => handleDelete(img.id)}>
                        <Trash2 className="h-4 w-4" />
                      </CyberpunkButton>
                    </div>
                    <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs font-mono">{img.style}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {!user && allImages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center font-mono">Sign in to save your images permanently</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
