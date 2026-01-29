import { useState, useEffect } from "react"
import { Play, Lightbulb, Check, X, RefreshCw, Trophy, ChevronDown, ChevronUp, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useExercises, ParsedExercise } from "@/hooks/useExercises"
import { useXP, XP_REWARDS } from "@/hooks/useXP"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export const ExerciseRunner = () => {
  const { user } = useAuth()
  const { exercises, loading, error, markComplete, isCompleted, getCompletion } = useExercises()
  const { addXP, checkBadges } = useXP()
  const [selectedExercise, setSelectedExercise] = useState<ParsedExercise | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [result, setResult] = useState<"pass" | "fail" | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0])
    }
  }, [exercises, selectedExercise])

  const handleSelectExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    if (exercise) {
      setSelectedExercise(exercise)
      setUserAnswer("")
      setResult(null)
      setHintsRevealed(0)
      setShowHints(false)
    }
  }

  const handleCheck = async () => {
    if (!selectedExercise || !userAnswer.trim()) return

    setIsChecking(true)
    
    // Simulate a brief check delay for UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const expectedOutput = selectedExercise.solution?.expected_output || ""
    const normalizedAnswer = userAnswer.trim().toLowerCase()
    const normalizedExpected = expectedOutput.trim().toLowerCase()

    const passed = normalizedAnswer === normalizedExpected

    setResult(passed ? "pass" : "fail")

    if (passed && user) {
      const { error } = await markComplete(selectedExercise.id, 100)
      if (error) {
        toast.error("Failed to save progress")
      } else {
        // Award XP based on difficulty
        const xpAmount = selectedExercise.difficulty === 'advanced' 
          ? XP_REWARDS.advanced 
          : selectedExercise.difficulty === 'intermediate'
            ? XP_REWARDS.intermediate
            : XP_REWARDS.beginner
        
        await addXP(xpAmount, `Exercise: ${selectedExercise.title}`)
        await checkBadges(selectedExercise.exercise_type, selectedExercise.difficulty)
        toast.success(`🎉 Exercise completed! +${xpAmount} XP`)
      }
    }

    setIsChecking(false)
  }

  const handleRevealHint = () => {
    if (selectedExercise?.hints && hintsRevealed < selectedExercise.hints.length) {
      setHintsRevealed(prev => prev + 1)
    }
  }

  const handleReset = () => {
    setUserAnswer("")
    setResult(null)
    setHintsRevealed(0)
    setShowHints(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400 border-green-400/30 bg-green-400/10"
      case "intermediate": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
      case "advanced": return "text-red-400 border-red-400/30 bg-red-400/10"
      default: return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card className="glass-morphism border-card-border p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-primary animate-spin mr-2" />
          <span className="text-muted-foreground font-mono">Loading exercises...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-morphism border-card-border p-8">
        <div className="text-center text-destructive font-mono">
          Failed to load exercises: {error.message}
        </div>
      </Card>
    )
  }

  if (exercises.length === 0) {
    return (
      <Card className="glass-morphism border-card-border p-8">
        <div className="text-center text-muted-foreground font-mono">
          No exercises available yet. Check back soon!
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary neon-text mb-2">Practice Lab</h2>
        <p className="text-muted-foreground font-mono">CTF-style exercises to sharpen your skills</p>
      </div>

      {/* Exercise Selector */}
      <Card className="glass-morphism border-card-border p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-mono text-foreground whitespace-nowrap">Select Exercise:</label>
          <Select value={selectedExercise?.id} onValueChange={handleSelectExercise}>
            <SelectTrigger className="bg-input border-border flex-1">
              <SelectValue placeholder="Choose an exercise" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {exercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  <div className="flex items-center gap-2">
                    {isCompleted(ex.id) && <Check className="h-4 w-4 text-green-400" />}
                    <span>{ex.title}</span>
                    <Badge className={`text-xs ${getDifficultyColor(ex.difficulty)}`}>
                      {ex.difficulty}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {exercises.filter(e => isCompleted(e.id)).length}/{exercises.length} Complete
            </Badge>
          </div>
        </div>
      </Card>

      {/* Exercise Content */}
      {selectedExercise && (
        <Card className="glass-morphism border-card-border p-6">
          <div className="space-y-6">
            {/* Exercise Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{selectedExercise.title}</h3>
                <p className="text-muted-foreground font-mono text-sm">{selectedExercise.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                  {selectedExercise.difficulty}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  {selectedExercise.exercise_type}
                </Badge>
                {isCompleted(selectedExercise.id) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>

            {/* Problem Statement */}
            <div className="bg-card/50 rounded-lg p-4 border border-border/30">
              <p className="font-mono text-sm text-foreground mb-2">
                {selectedExercise.content.instructions}
              </p>
              {selectedExercise.content.encoded && (
                <code className="block bg-black/50 p-3 rounded text-primary font-mono text-sm">
                  {selectedExercise.content.encoded}
                </code>
              )}
              {selectedExercise.content.html && (
                <pre className="bg-black/50 p-3 rounded text-primary font-mono text-xs overflow-x-auto">
                  {selectedExercise.content.html}
                </pre>
              )}
              {selectedExercise.content.encrypted && (
                <code className="block bg-black/50 p-3 rounded text-primary font-mono text-sm">
                  Ciphertext: {selectedExercise.content.encrypted}
                  {selectedExercise.content.shift && ` (Shift: ${selectedExercise.content.shift})`}
                </code>
              )}
              {selectedExercise.content.hex && (
                <code className="block bg-black/50 p-3 rounded text-primary font-mono text-sm">
                  {selectedExercise.content.hex}
                </code>
              )}
              {selectedExercise.content.binary && (
                <code className="block bg-black/50 p-3 rounded text-primary font-mono text-sm">
                  {selectedExercise.content.binary}
                </code>
              )}
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-sm font-mono text-foreground mb-2">Your Answer:</label>
              <Textarea
                placeholder="Enter your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={`bg-input border-border text-foreground font-mono min-h-20 ${
                  result === "pass" ? "border-green-400" : result === "fail" ? "border-red-400" : ""
                }`}
              />
            </div>

            {/* Result Feedback */}
            {result && (
              <div className={`rounded-lg p-4 ${
                result === "pass" 
                  ? "bg-green-500/10 border border-green-400/30" 
                  : "bg-red-500/10 border border-red-400/30"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result === "pass" ? (
                    <>
                      <Check className="h-5 w-5 text-green-400" />
                      <span className="font-bold text-green-400">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-400" />
                      <span className="font-bold text-red-400">Not quite right</span>
                    </>
                  )}
                </div>
                {result === "pass" && selectedExercise.solution?.explanation && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedExercise.solution.explanation}
                  </p>
                )}
                {result === "fail" && (
                  <p className="text-sm text-muted-foreground font-mono">
                    Try again! Check the hints if you need help.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <CyberpunkButton 
                variant="cyber" 
                onClick={handleCheck}
                disabled={!userAnswer.trim() || isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Check Answer
              </CyberpunkButton>
              
              <CyberpunkButton variant="ghost" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </CyberpunkButton>

              {selectedExercise.hints && selectedExercise.hints.length > 0 && (
                <CyberpunkButton 
                  variant="ghost" 
                  onClick={() => setShowHints(!showHints)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Hints ({hintsRevealed}/{selectedExercise.hints.length})
                </CyberpunkButton>
              )}
            </div>

            {/* Hints Section */}
            {showHints && selectedExercise.hints && selectedExercise.hints.length > 0 && (
              <Collapsible open={showHints} onOpenChange={setShowHints}>
                <CollapsibleContent>
                  <Card className="bg-card/30 border-border/30 p-4">
                    <div className="space-y-3">
                      {selectedExercise.hints.slice(0, hintsRevealed).map((hint, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                          <p className="text-sm text-muted-foreground font-mono">{hint}</p>
                        </div>
                      ))}
                      
                      {hintsRevealed < selectedExercise.hints.length && (
                        <CyberpunkButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRevealHint}
                          className="mt-2"
                        >
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Reveal Next Hint
                        </CyberpunkButton>
                      )}
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </Card>
      )}

      {/* Completion Stats */}
      {user && (
        <Card className="glass-morphism border-card-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="font-mono text-sm">Your Progress</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  {exercises.filter(e => isCompleted(e.id)).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {exercises.length}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
