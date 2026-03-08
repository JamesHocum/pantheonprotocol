import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LogIn, BookOpen, LogOut } from "lucide-react"
import type { Classroom } from "@/hooks/useClassrooms"

interface Props {
  classrooms: Classroom[]
  loading: boolean
  onJoin: (code: string) => Promise<boolean>
  onLeave: (classroomId: string) => Promise<void>
  onSelect: (c: Classroom) => void
}

export const StudentView = ({ classrooms, loading, onJoin, onLeave, onSelect }: Props) => {
  const [inviteCode, setInviteCode] = useState("")
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setJoining(true)
    const success = await onJoin(inviteCode)
    if (success) setInviteCode("")
    setJoining(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold font-mono text-foreground">Enrolled Classrooms</h2>

      <Card className="border-primary/30 bg-card/50">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter invite code..."
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              className="bg-background/50 font-mono"
            />
            <CyberpunkButton variant="neon" size="sm" onClick={handleJoin} disabled={joining || !inviteCode.trim()}>
              <LogIn className="h-4 w-4 mr-2" />
              {joining ? "Joining..." : "Join"}
            </CyberpunkButton>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground font-mono">Loading...</p>
      ) : classrooms.length === 0 ? (
        <Card className="border-border/30 bg-card/30">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-mono text-sm">Not enrolled in any classrooms yet. Enter an invite code above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {classrooms.map(c => (
            <Card key={c.id} className="border-border/30 bg-card/50 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => onSelect(c)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{c.name}</CardTitle>
                  <div onClick={e => e.stopPropagation()}>
                    <button onClick={() => onLeave(c.id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <LogOut className="h-3 w-3" />
                      Leave
                    </button>
                  </div>
                </div>
                {c.description && <CardDescription className="font-mono text-xs">{c.description}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="secondary" className="font-mono text-xs">Student</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
