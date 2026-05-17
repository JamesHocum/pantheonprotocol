import { useEffect, useState } from "react"
import { Upload, Layers, Loader2, Hash } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  name: string
  status: string
  base_model: string
  trigger_word: string | null
  steps: number
  output_url: string | null
  error: string | null
  created_at: string
}

export const LoraTrainer = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("my-lora")
  const [trigger, setTrigger] = useState("TOK")
  const [steps, setSteps] = useState(1000)
  const [lr, setLr] = useState(0.0001)
  const [rank, setRank] = useState(16)
  const [baseModel, setBaseModel] = useState("sdxl-1.0")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])

  const loadJobs = async () => {
    if (!user) return
    const { data } = await supabase.from("lora_jobs").select("*").order("created_at", { ascending: false })
    setJobs((data as Job[]) || [])
  }
  useEffect(() => { loadJobs() }, [user])

  const startTraining = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return }
    if (!file) { toast({ title: "Upload a dataset ZIP first", variant: "destructive" }); return }
    setBusy(true)
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from("lora-datasets").upload(path, file)
      if (upErr) throw upErr

      const { data, error } = await supabase.functions.invoke("lora-train", {
        body: { name, datasetPath: path, triggerWord: trigger, steps, learningRate: lr, rank, baseModel },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      toast({ title: "Training started", description: `Job ${data.job_id}` })
      await loadJobs()
    } catch (e: any) {
      toast({ title: "Failed to start training", description: e?.message, variant: "destructive" })
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <Card className="holo-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-mono font-bold tracking-widest uppercase">Custom LoRA Trainer</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-8 font-mono text-xs" />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Trigger word</Label>
            <Input value={trigger} onChange={e => setTrigger(e.target.value)} className="h-8 font-mono text-xs" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Base model</Label>
            <Select value={baseModel} onValueChange={setBaseModel}>
              <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sdxl-1.0">SDXL 1.0</SelectItem>
                <SelectItem value="sdxl-lightning">SDXL Lightning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Steps: {steps}</Label>
            <Slider value={[steps]} onValueChange={v => setSteps(v[0])} min={200} max={4000} step={100} />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Rank: {rank}</Label>
            <Slider value={[rank]} onValueChange={v => setRank(v[0])} min={4} max={128} step={4} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Learning rate</Label>
            <Input type="number" step="0.00001" value={lr} onChange={e => setLr(parseFloat(e.target.value) || 0.0001)} className="h-8 font-mono text-xs" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Dataset (ZIP of images)</Label>
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center hover:border-primary/60 transition">
            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <input type="file" accept=".zip,application/zip"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block mx-auto text-xs font-mono" />
            {file && <p className="text-xs font-mono text-primary mt-1">{file.name} ({(file.size/1024/1024).toFixed(1)} MB)</p>}
          </div>
        </div>

        <CyberpunkButton variant="cyber" className="w-full" disabled={busy || !file} onClick={startTraining}>
          {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading & queuing…</> : <><Hash className="h-4 w-4 mr-2" />Start Training</>}
        </CyberpunkButton>
        <p className="text-[10px] font-mono text-muted-foreground">
          Training runs on Replicate. Costs depend on steps & GPU time.
        </p>
      </Card>

      {jobs.length > 0 && (
        <Card className="holo-card p-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Training Jobs</h4>
          <div className="space-y-2">
            {jobs.map(j => (
              <div key={j.id} className="flex items-center justify-between p-2 rounded border border-border/40 text-xs font-mono">
                <div>
                  <p className="font-bold">{j.name}</p>
                  <p className="text-muted-foreground text-[10px]">{j.base_model} · {j.steps} steps · {j.trigger_word || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{j.status}</Badge>
                  {j.output_url && <a href={j.output_url} className="text-primary underline" target="_blank" rel="noreferrer">weights</a>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
