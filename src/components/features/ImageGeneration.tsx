import { useState, useRef, useCallback } from "react"
import { Wand2, Download, Settings, Video, Image as ImageIcon, Trash2, Upload, X, ArrowRightLeft, Layers, SlidersHorizontal, Sparkles } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useImageGallery, GeneratedImage } from "@/hooks/useImageGallery"
import { ImagePresets } from "./ImagePresets"
import { ImageModifiers } from "./ImageModifiers"

type GenerationMode = "text-to-image" | "image-to-image" | "image-to-video"

const resizeImage = (base64: string, maxSize = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxSize && height <= maxSize) { resolve(base64); return }
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

const stylePrompts: Record<string, string> = {
  cyberpunk: 'cyberpunk style, neon lights, futuristic, dark atmosphere, high tech',
  anime: 'anime style, vibrant colors, dynamic composition, Japanese animation',
  photorealistic: 'photorealistic, highly detailed, 8k resolution, professional photography',
  darkweb: 'dark web aesthetic, hacker theme, green terminal text, matrix style, glitch art',
  synthwave: 'synthwave aesthetic, retro 80s, purple and pink neons, sunset gradients',
  glitch: 'glitch art, digital distortion, vaporwave, corrupted data aesthetic',
}

export const ImageGeneration = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { images: savedImages, saveImageUrl, deleteImage } = useImageGallery()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk")
  const [mode, setMode] = useState<GenerationMode>("text-to-image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [sessionImages, setSessionImages] = useState<GeneratedImage[]>([])
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [studioTab, setStudioTab] = useState("generate")

  const allImages = user ? savedImages : sessionImages

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" }); return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" }); return
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
      } finally { setIsProcessingImage(false) }
    }
    reader.onerror = () => { setIsProcessingImage(false); toast({ title: "Failed to read image file", variant: "destructive" }) }
    reader.readAsDataURL(file)
  }, [mode, toast])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const clearSourceImage = () => {
    setSourceImage(null); setSourcePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (mode === "image-to-image") setMode("text-to-image")
  }

  const useGalleryAsSource = (imageUrl: string) => {
    setSourcePreview(imageUrl)
    setSourceImage(imageUrl)
    setMode("image-to-image")
    setStudioTab("generate")
    toast({ title: "Gallery image loaded as source" })
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (mode === "image-to-image" && !sourceImage) {
      toast({ title: "Upload a source image first", variant: "destructive" }); return
    }
    if (mode === "image-to-video") {
      toast({ title: "Video generation coming soon!", description: "Stay tuned for this feature." }); return
    }
    setIsGenerating(true)
    try {
      const body: any = { prompt, style: selectedStyle }
      if (mode === "image-to-image" && sourceImage) body.sourceImage = sourceImage
      const { data, error } = await supabase.functions.invoke("generate-image", { body })
      if (error) throw error
      if (data.imageUrl) {
        if (user) {
          const { error: saveError } = await saveImageUrl(data.imageUrl, data.prompt, data.style)
          if (saveError) console.error("Failed to save image:", saveError)
        } else {
          setSessionImages(prev => [{ id: Date.now().toString(), image_url: data.imageUrl, prompt: data.prompt, style: data.style, created_at: new Date().toISOString() }, ...prev])
        }
        toast({ title: "Image generated successfully!" })
      }
    } catch (error: any) {
      console.error("Image generation error:", error)
      const msg = error.message || "Failed to generate image"
      const description = msg.includes("payload") || msg.includes("too large") ? "Image may be too large. Try a smaller image." : msg
      toast({ title: "Generation failed", description, variant: "destructive" })
    } finally { setIsGenerating(false) }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a'); link.href = imageUrl; link.download = `cybercafe-gen-${index}.png`; link.click()
  }

  const handleDelete = async (imageId: string) => {
    if (!user) { setSessionImages(prev => prev.filter(img => img.id !== imageId)); return }
    const { error } = await deleteImage(imageId)
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" })
    else toast({ title: "Image deleted" })
  }

  const handleApplyPreset = (presetPrompt: string, style: string) => {
    setPrompt(presetPrompt)
    setSelectedStyle(style)
    setStudioTab("generate")
    toast({ title: "Preset loaded", description: "Prompt and style applied. Hit Generate!" })
  }

  const handleApplyModifier = (modifier: string) => {
    setPrompt(prev => prev ? `${prev}, ${modifier}` : modifier)
    toast({ title: "Modifier added", description: modifier })
  }

  const modeConfig = {
    "text-to-image": { icon: ImageIcon, label: "Text → Image", description: "Describe what you want" },
    "image-to-image": { icon: ArrowRightLeft, label: "Image → Image", description: "Transform an uploaded image" },
    "image-to-video": { icon: Video, label: "Image → Video", description: "Coming soon" },
  }

  return (
    <div className="space-y-4">
      {/* Studio Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl blur-xl -z-10" />
        <h2 className="text-2xl font-bold text-primary neon-text mb-1 tracking-wider">AI CONTENT STUDIO</h2>
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Generate · Transform · Create</p>
      </div>

      {/* Studio Tabs */}
      <Tabs value={studioTab} onValueChange={setStudioTab}>
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/30">
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="presets" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-xs">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="modifiers" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Modifiers
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="mt-3">
          <Card className="glass-morphism border-card-border p-4">
            <div className="space-y-3">
              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(modeConfig) as GenerationMode[]).map((m) => {
                    const cfg = modeConfig[m]; const Icon = cfg.icon
                    return (
                      <CyberpunkButton key={m} variant={mode === m ? "cyber" : "ghost"}
                        onClick={() => { setMode(m); if (m === "text-to-image") clearSourceImage() }}
                        className="flex-col h-auto py-2 text-xs" disabled={m === "image-to-video"}>
                        <Icon className="h-4 w-4 mb-0.5" />{cfg.label}
                      </CyberpunkButton>
                    )
                  })}
                </div>
              </div>

              {/* Source Image Upload (drag & drop) */}
              {mode === "image-to-image" && (
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Source Image</label>
                  {sourcePreview ? (
                    <div className="relative inline-block">
                      <img src={sourcePreview} alt="Source" className="max-h-32 rounded-lg border-2 border-primary/40" />
                      <button onClick={clearSourceImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : isProcessingImage ? (
                    <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center">
                      <Settings className="h-6 w-6 mx-auto mb-1 text-primary animate-spin" />
                      <p className="text-xs text-muted-foreground font-mono">Processing...</p>
                    </div>
                  ) : (
                    <div ref={dropZoneRef}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                        isDragging ? "border-primary bg-primary/10 shadow-glow-purple" : "border-primary/30 hover:border-primary/60"
                      }`}
                    >
                      <Upload className={`h-6 w-6 mx-auto mb-1 ${isDragging ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                      <p className="text-xs text-muted-foreground font-mono">
                        {isDragging ? "Drop image here!" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5 font-mono">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              )}

              {/* Style */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Style</label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="bg-input border-border h-8 text-xs font-mono">
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

              {/* Prompt */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                  {mode === "image-to-image" ? "Edit Instructions" : "Prompt"}
                </label>
                <Textarea
                  placeholder={mode === "image-to-image" ? "Describe how to transform..." : "Describe your vision..."}
                  value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  className="bg-input border-border text-foreground font-mono min-h-16 text-sm"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-accent font-mono">
                    {modeConfig[mode].label} · {selectedStyle.toUpperCase()}
                  </p>
                  {prompt && (
                    <button onClick={() => setPrompt("")} className="text-xs text-muted-foreground hover:text-foreground font-mono">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <CyberpunkButton variant="cyber" className="w-full" onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating || (mode === "image-to-image" && !sourceImage)}>
                {isGenerating ? (
                  <><Settings className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Wand2 className="h-4 w-4 mr-2" />{mode === "image-to-image" ? "Transform" : "Generate"}</>
                )}
              </CyberpunkButton>
            </div>
          </Card>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="mt-3">
          <Card className="glass-morphism border-card-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-mono font-bold text-foreground">Quick Presets</h3>
              <span className="text-xs text-muted-foreground font-mono">— click to apply</span>
            </div>
            <ImagePresets onApplyPreset={handleApplyPreset} />
          </Card>
        </TabsContent>

        {/* Modifiers Tab */}
        <TabsContent value="modifiers" className="mt-3">
          <Card className="glass-morphism border-card-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-mono font-bold text-foreground">Prompt Modifiers</h3>
              <span className="text-xs text-muted-foreground font-mono">— click to append to prompt</span>
            </div>
            {prompt && (
              <div className="mb-3 p-2 rounded bg-primary/5 border border-primary/20">
                <p className="text-xs font-mono text-muted-foreground">Current prompt:</p>
                <p className="text-xs font-mono text-foreground mt-0.5 line-clamp-2">{prompt}</p>
              </div>
            )}
            <ImageModifiers onApplyModifier={handleApplyModifier} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading */}
      {isGenerating && allImages.length === 0 && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Settings className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-primary font-mono text-sm">Generating your artwork...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </div>
        </Card>
      )}

      {/* Gallery */}
      {allImages.length > 0 && (
        <Card className="glass-morphism border-card-border p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary neon-text font-mono">
                {user ? "YOUR GALLERY" : "GENERATED"}
              </h3>
              <Badge variant="secondary" className="font-mono text-xs">{allImages.length}</Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allImages.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt={img.prompt} className="w-full aspect-square object-cover rounded-lg border border-primary/20 group-hover:border-primary transition-colors" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5">
                      <CyberpunkButton variant="neon" size="icon" onClick={() => handleDownload(img.image_url, idx)} title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </CyberpunkButton>
                      <CyberpunkButton variant="ghost" size="icon" onClick={() => useGalleryAsSource(img.image_url)} title="Use as source">
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </CyberpunkButton>
                      <CyberpunkButton variant="ghost" size="icon" onClick={() => handleDelete(img.id)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </CyberpunkButton>
                    </div>
                    <Badge variant="secondary" className="absolute bottom-1.5 left-1.5 text-xs font-mono py-0">{img.style}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {!user && allImages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center font-mono">Sign in to save images permanently</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
