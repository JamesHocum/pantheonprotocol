import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2, Users, BookOpen } from "lucide-react"
import { toast } from "sonner"
import type { Classroom } from "@/hooks/useClassrooms"

interface Props {
  classrooms: Classroom[]
  loading: boolean
  onCreate: (name: string, description: string) => Promise<Classroom | null>
  onDelete: (id: string) => Promise<void>
  onSelect: (c: Classroom) => void
  getMemberCount: (id: string) => Promise<number>
}

export const InstructorView = ({ classrooms, loading, onCreate, onDelete, onSelect, getMemberCount }: Props) => {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    classrooms.forEach(async (c) => {
      const count = await getMemberCount(c.id)
      setMemberCounts(prev => ({ ...prev, [c.id]: count }))
    })
  }, [classrooms, getMemberCount])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    await onCreate(name.trim(), description.trim())
    setName(""); setDescription(""); setShowForm(false)
    setCreating(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Invite code copied!")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-mono text-foreground">My Classrooms</h2>
        <CyberpunkButton variant="neon" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Classroom
        </CyberpunkButton>
      </div>

      {showForm && (
        <Card className="border-primary/30 bg-card/50">
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Classroom name" value={name} onChange={e => setName(e.target.value)} className="bg-background/50" />
            <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-background/50" />
            <div className="flex gap-2">
              <CyberpunkButton variant="neon" size="sm" onClick={handleCreate} disabled={creating || !name.trim()}>
                {creating ? "Creating..." : "Create"}
              </CyberpunkButton>
              <CyberpunkButton variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</CyberpunkButton>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground font-mono">Loading...</p>
      ) : classrooms.length === 0 ? (
        <Card className="border-border/30 bg-card/30">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-mono text-sm">No classrooms yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {classrooms.map(c => (
            <Card key={c.id} className="border-border/30 bg-card/50 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => onSelect(c)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{c.name}</CardTitle>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => copyCode(c.invite_code)} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors">
                      <code className="text-xs font-mono text-primary">{c.invite_code}</code>
                      <Copy className="h-3 w-3 text-primary" />
                    </button>
                    <button onClick={() => onDelete(c.id)} className="p-1 rounded hover:bg-destructive/20 transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
                {c.description && <CardDescription className="font-mono text-xs">{c.description}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {memberCounts[c.id] ?? "..."} students
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
