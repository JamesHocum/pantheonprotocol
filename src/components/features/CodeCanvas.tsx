import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"
import { useCanvas } from "@/hooks/useCanvas"
import { useAuth } from "@/contexts/AuthContext"
import { Save, Play, RefreshCw, Code2, FileCode } from "lucide-react"
import { toast } from "sonner"
import type { AssistantKey } from "@/lib/assistants"

interface CodeCanvasProps {
  assistantKey: AssistantKey
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" }
]

export const CodeCanvas = ({ assistantKey }: CodeCanvasProps) => {
  const { user } = useAuth()
  const { canvas, loading, saveCanvas } = useCanvas(assistantKey)
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [saving, setSaving] = useState(false)
  const [output, setOutput] = useState<string | null>(null)

  useEffect(() => {
    if (canvas) {
      setContent(canvas.content)
      setLanguage(canvas.language)
    }
  }, [canvas])

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save your canvas")
      return
    }

    setSaving(true)
    const { error } = await saveCanvas(content, language)
    setSaving(false)

    if (error) {
      toast.error("Failed to save canvas")
    } else {
      toast.success("Canvas saved!")
    }
  }

  const handleRun = () => {
    if (language === "javascript") {
      try {
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "))
        }
        
        // eslint-disable-next-line no-eval
        eval(content)
        
        console.log = originalLog
        setOutput(logs.join("\n") || "// Code executed successfully (no output)")
        toast.success("Code executed!")
      } catch (err) {
        setOutput(`Error: ${(err as Error).message}`)
        toast.error("Execution error")
      }
    } else {
      toast.info(`Running ${language} code requires a backend compiler`)
    }
  }

  const handleClear = () => {
    setContent("")
    setOutput(null)
  }

  if (!user) {
    return (
      <Card className="glass-morphism border-card-border p-6">
        <div className="text-center py-8">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">
            Sign in to use the code canvas
          </p>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="glass-morphism border-card-border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-morphism border-card-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileCode className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-primary">Live Canvas</h3>
          <Badge variant="outline" className="font-mono text-xs">
            {language.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-card border border-card-border rounded px-2 py-1 text-sm font-mono text-foreground"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="// Write your code here..."
            className="w-full h-64 bg-background border border-card-border rounded-lg p-4 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>

        <div className="flex gap-2">
          <CyberpunkButton variant="cyber" onClick={handleRun}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </CyberpunkButton>
          <CyberpunkButton variant="neon" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </CyberpunkButton>
          <CyberpunkButton variant="ghost" onClick={handleClear}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </CyberpunkButton>
        </div>

        {output !== null && (
          <div className="bg-background border border-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">OUTPUT</Badge>
            </div>
            <pre className="font-mono text-sm text-secondary whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </Card>
  )
}
