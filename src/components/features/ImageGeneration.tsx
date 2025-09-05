import { useState } from "react"
import { Wand2, Download, Settings, Upload } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export const ImageGeneration = () => {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("sdxl-1.0")
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
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">SDXL Image Creation Studio</h2>
        <p className="text-muted-foreground font-mono">Generate cyberpunk artwork with advanced AI models</p>
      </div>

      {/* Generation Panel */}
      <Card className="glass-morphism border-card-border p-6">
        <div className="space-y-4">
          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">SDXL Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select SDXL model" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="sdxl-1.0">SDXL 1.0 (Stable)</SelectItem>
                  <SelectItem value="sdxl-turbo">SDXL Turbo (Fast)</SelectItem>
                  <SelectItem value="sdxl-refiner">SDXL Refiner (High Quality)</SelectItem>
                  <SelectItem value="sdxl-custom">Custom LoRA Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-mono text-foreground mb-2">LoRA Training</label>
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
              placeholder="Describe your cyberpunk image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input border-border text-foreground font-mono min-h-20"
            />
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Steps</label>
              <CyberInput variant="terminal" placeholder="50" />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">CFG Scale</label>
              <CyberInput variant="terminal" placeholder="7.5" />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Width</label>
              <CyberInput variant="terminal" placeholder="1024" />
            </div>
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Height</label>
              <CyberInput variant="terminal" placeholder="1024" />
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
                Generate Image
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