import { useState } from "react"
import { Wand2, Loader2, Download, Cpu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useImageGallery } from "@/hooks/useImageGallery"

export const SDXLPanel = () => {
  const { toast } = useToast()
  const { saveImageUrl } = useImageGallery()
  const [prompt, setPrompt] = useState("")
  const [negative, setNegative] = useState("blurry, low quality, distorted")
  const [model, setModel] = useState("sdxl-lightning")
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fallback, setFallback] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true); setFallback(false)
    try {
      const { data, error } = await supabase.functions.invoke("sdxl-generate", {
        body: { prompt, model, negative_prompt: negative },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      const imgs: string[] = data.images || []
      setResults(prev => [...imgs, ...prev])
      // Persist
      for (const url of imgs) await saveImageUrl(url, prompt, model)
      toast({ title: `Generated via ${model}` })
    } catch (e: any) {
      const msg = String(e?.message || "")
      // Auto-fallback to free Lovable AI image model on Replicate failure/credit issues
      if (/credit|payment|402|insufficient|REPLICATE_API_TOKEN/i.test(msg)) {
        setFallback(true)
        toast({ title: "SDXL unavailable — falling back to free model", description: msg })
        try {
          const { data: fb, error: fbErr } = await supabase.functions.invoke("generate-image", {
            body: { prompt, style: "photorealistic" },
          })
          if (fbErr || fb?.error) throw new Error(fb?.error || fbErr?.message)
          if (fb?.imageUrl) {
            setResults(prev => [fb.imageUrl, ...prev])
            await saveImageUrl(fb.imageUrl, prompt, "fallback-gemini")
          }
        } catch (fe: any) {
          toast({ title: "Fallback also failed", description: fe?.message, variant: "destructive" })
        }
      } else {
        toast({ title: "Generation failed", description: msg, variant: "destructive" })
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <Card className="holo-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-mono font-bold tracking-widest uppercase">SDXL · DarkBERT Studio</h3>
          {fallback && <Badge variant="outline" className="text-[10px]">Fallback active</Badge>}
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-input border-border h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="sdxl-1.0">SDXL 1.0 (Stability AI)</SelectItem>
              <SelectItem value="sdxl-lightning">SDXL Lightning (newest, 4-step, fast)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Prompt</label>
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="cyberpunk samurai under neon rain, cinematic, 8k…"
            className="bg-input border-border font-mono text-sm min-h-20" />
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Negative prompt</label>
          <Textarea value={negative} onChange={e => setNegative(e.target.value)}
            className="bg-input border-border font-mono text-xs min-h-12" />
        </div>

        <CyberpunkButton variant="cyber" className="w-full" disabled={loading || !prompt.trim()} onClick={generate}>
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Wand2 className="h-4 w-4 mr-2" />Generate</>}
        </CyberpunkButton>

        <p className="text-[10px] font-mono text-muted-foreground">
          Powered by Replicate · auto-falls back to free Lovable AI image model if SDXL is unavailable.
        </p>
      </Card>

      {results.length > 0 && (
        <Card className="holo-card p-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {results.map((url, i) => (
              <div key={url + i} className="relative group rounded-lg overflow-hidden border border-border/40">
                <img src={url} alt="" className="w-full h-auto" />
                <a href={url} target="_blank" rel="noreferrer" download
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border/40 opacity-0 group-hover:opacity-100 transition">
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
