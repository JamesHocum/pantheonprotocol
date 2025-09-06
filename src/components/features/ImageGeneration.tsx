import { useState } from "react"
import { Wand2, Download, Settings, Upload, Video, Image } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export const ImageGeneration = () => {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("sdxl-1.0")
  const [selectedLora, setSelectedLora] = useState("none")
  const [contentMode, setContentMode] = useState("image") // "image" or "video"
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // Simulate image generation
    setTimeout(() => {
      setGeneratedImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&fit=crop")
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">AI Content Creation Studio</h2>
        <p className="text-muted-foreground font-mono">Generate images and videos with advanced AI models and custom LoRAs</p>
        
        {/* Content Type Toggle */}
        <div className="flex justify-center gap-2 mt-4">
          <CyberpunkButton
            variant={contentMode === "image" ? "cyber" : "ghost"}
            onClick={() => setContentMode("image")}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Images
          </CyberpunkButton>
          <CyberpunkButton
            variant={contentMode === "video" ? "cyber" : "ghost"}
            onClick={() => setContentMode("video")}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Videos
          </CyberpunkButton>
        </div>
      </div>

      {/* Generation Panel */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">
                {contentMode === "image" ? "Image Model" : "Video Model"}
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder={`Select ${contentMode} model`} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {contentMode === "image" ? (
                    <>
                      <SelectItem value="sdxl-1.0">SDXL 1.0 (Stable)</SelectItem>
                      <SelectItem value="sdxl-turbo">SDXL Turbo (Fast)</SelectItem>
                      <SelectItem value="sdxl-refiner">SDXL Refiner (High Quality)</SelectItem>
                      <SelectItem value="flux-dev">Flux Dev (Premium)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="stable-video">Stable Video Diffusion</SelectItem>
                      <SelectItem value="runway-gen2">Runway Gen-2</SelectItem>
                      <SelectItem value="pika-labs">Pika Labs</SelectItem>
                      <SelectItem value="zeroscope-v2">ZeroScope v2</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Custom LoRA</label>
              <Select value={selectedLora} onValueChange={setSelectedLora}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select LoRA" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">None (Base Model)</SelectItem>
                  <SelectItem value="realistic-v1">Realistic Portrait v1</SelectItem>
                  <SelectItem value="cyberpunk-v2">Cyberpunk Style v2</SelectItem>
                  <SelectItem value="anime-v3">Anime/Manga v3</SelectItem>
                  <SelectItem value="technical-v1">Technical Diagrams</SelectItem>
                  <SelectItem value="custom-upload">Upload Custom LoRA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Upload Training</label>
              <CyberpunkButton variant="ghost" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Dataset
              </CyberpunkButton>
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-mono text-foreground mb-2">Generation Prompt</label>
            <Textarea
              placeholder={contentMode === "image" ? "Describe your cyberpunk image..." : "Describe your video scene..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input border-border text-foreground font-mono min-h-20"
            />
            {selectedLora !== "none" && (
              <p className="text-xs text-accent mt-1 font-mono">
                LoRA Active: {selectedLora.replace("-", " ").toUpperCase()}
              </p>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">
                {contentMode === "image" ? "Steps" : "Frames"}
              </label>
              <CyberInput variant="terminal" placeholder={contentMode === "image" ? "50" : "24"} />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">CFG Scale</label>
              <CyberInput variant="terminal" placeholder="7.5" />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Width</label>
              <CyberInput variant="terminal" placeholder={contentMode === "image" ? "1024" : "512"} />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">
                {contentMode === "image" ? "Height" : "Duration"}
              </label>
              <CyberInput variant="terminal" placeholder={contentMode === "image" ? "1024" : "4s"} />
            </div>
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
                Generate {contentMode === "image" ? "Image" : "Video"}
              </>
            )}
          </CyberpunkButton>
        </div>
      </Card>

      {/* Generated Image Display */}
      {(generatedImage || isGenerating) && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary neon-text">Generated Artwork</h3>
              <Badge variant="secondary" className="font-mono">
                {selectedModel.toUpperCase()}
              </Badge>
            </div>
            
            <div className="relative aspect-square max-w-md mx-auto">
              {isGenerating ? (
                <div className="w-full h-full bg-gradient-dark rounded-lg flex items-center justify-center border-2 border-primary/30">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-primary font-mono">Processing...</p>
                  </div>
                </div>
              ) : generatedImage && (
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated artwork"
                    className="w-full h-full object-cover rounded-lg border-2 border-primary shadow-glow-cyber"
                  />
                  <CyberpunkButton
                    variant="neon"
                    size="icon"
                    className="absolute top-2 right-2"
                  >
                    <Download className="h-4 w-4" />
                  </CyberpunkButton>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}