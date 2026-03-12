import { useState, useEffect, useCallback, useRef } from "react"
import { Lock, Timer, Zap, ArrowLeft, RotateCcw } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { Badge } from "@/components/ui/badge"

type Difficulty = "easy" | "medium" | "hard"

interface Guess {
  value: string
  feedback: ("correct" | "misplaced" | "wrong")[]
}

const CHAR_SETS: Record<Difficulty, string> = {
  easy: "abcdefghijklmnopqrstuvwxyz0123456789",
  medium: "abcdefghijklmnopqrstuvwxyz0123456789",
  hard: "abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*",
}

const LENGTHS: Record<Difficulty, number> = { easy: 4, medium: 6, hard: 8 }
const TIME_LIMITS: Record<Difficulty, number> = { easy: 90, medium: 60, hard: 45 }
const BASE_SCORE: Record<Difficulty, number> = { easy: 500, medium: 1000, hard: 2000 }

const generatePassword = (difficulty: Difficulty): string => {
  const chars = CHAR_SETS[difficulty]
  const len = LENGTHS[difficulty]
  let pw = ""
  for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

const getFeedback = (guess: string, target: string): ("correct" | "misplaced" | "wrong")[] => {
  const result: ("correct" | "misplaced" | "wrong")[] = []
  const targetChars = target.split("")
  const used = new Array(target.length).fill(false)

  // First pass: correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetChars[i]) {
      result[i] = "correct"
      used[i] = true
    }
  }

  // Second pass: misplaced
  for (let i = 0; i < guess.length; i++) {
    if (result[i]) continue
    const idx = targetChars.findIndex((c, j) => c === guess[i] && !used[j] && !result[j])
    if (idx !== -1) {
      result[i] = "misplaced"
      used[idx] = true
    } else {
      result[i] = "wrong"
    }
  }

  return result
}

interface CipherBreakProps {
  onBack: () => void
}

export const CipherBreak = ({ onBack }: CipherBreakProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [target, setTarget] = useState(() => generatePassword("medium"))
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS.medium)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("cipherbreak_best") || "0")
  })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (gameState !== "playing" || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("lost")
          setStreak(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  useEffect(() => {
    inputRef.current?.focus()
  }, [guesses, gameState])

  const startNewGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setTarget(generatePassword(diff))
    setGuesses([])
    setCurrentInput("")
    setTimeLeft(TIME_LIMITS[diff])
    setGameState("playing")
  }, [])

  const handleSubmit = () => {
    if (gameState !== "playing") return
    const guess = currentInput.toLowerCase().trim()
    if (guess.length !== LENGTHS[difficulty]) return

    const feedback = getFeedback(guess, target)
    const newGuesses = [...guesses, { value: guess, feedback }]
    setGuesses(newGuesses)
    setCurrentInput("")

    if (feedback.every(f => f === "correct")) {
      const timeBonus = timeLeft * 10
      const streakMultiplier = streak + 1
      const roundScore = (BASE_SCORE[difficulty] + timeBonus) * streakMultiplier
      setScore(prev => prev + roundScore)
      setStreak(prev => prev + 1)
      setGameState("won")
      if (score + roundScore > bestScore) {
        setBestScore(score + roundScore)
        localStorage.setItem("cipherbreak_best", String(score + roundScore))
      }
    } else if (newGuesses.length >= 8) {
      setGameState("lost")
      setStreak(0)
    }
  }

  const feedbackColor = (f: "correct" | "misplaced" | "wrong") => {
    if (f === "correct") return "text-green-400 bg-green-400/20 border-green-400/50"
    if (f === "misplaced") return "text-yellow-400 bg-yellow-400/20 border-yellow-400/50"
    return "text-red-400 bg-red-400/20 border-red-400/50"
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <div className="flex flex-col items-center gap-4 h-full bg-black/80 rounded-xl border border-green-500/30 p-6 font-mono relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.05) 2px, rgba(0,255,0,0.05) 4px)" }}
      />

      {/* Header */}
      <div className="w-full max-w-lg relative z-10">
        <div className="flex items-center justify-between mb-2">
          <CyberpunkButton variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> BACK
          </CyberpunkButton>
          <div className="flex items-center gap-2 text-green-400">
            <Lock className="h-4 w-4" />
            <span className="text-lg font-bold">CIPHER_BREAK v1.0</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4 text-green-400" />
            <span className={`text-lg font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-green-400"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-green-400/70 border-b border-green-500/20 pb-2">
          <span>LEVEL: {difficulty.toUpperCase()}</span>
          <span>SCORE: {score}</span>
          <span>STREAK: {streak}x</span>
          <span>BEST: {bestScore}</span>
        </div>
      </div>

      {/* Target */}
      <div className="text-center relative z-10">
        <span className="text-xs text-green-400/50">TARGET SYSTEM PASSWORD</span>
        <div className="flex gap-1 mt-1 justify-center">
          {Array.from({ length: LENGTHS[difficulty] }).map((_, i) => (
            <div key={i} className="w-8 h-10 border border-green-500/40 rounded flex items-center justify-center text-lg font-bold text-green-400 bg-green-500/5">
              {gameState !== "playing" ? target[i] : "█"}
            </div>
          ))}
        </div>
      </div>

      {/* Guesses */}
      <div className="w-full max-w-lg flex-1 overflow-y-auto space-y-2 relative z-10 min-h-0">
        {guesses.map((g, gi) => (
          <div key={gi} className="flex items-center gap-2">
            <span className="text-green-400/40 text-xs w-6">{`>${gi + 1}`}</span>
            <div className="flex gap-1">
              {g.value.split("").map((ch, ci) => (
                <div key={ci} className={`w-8 h-8 border rounded flex items-center justify-center text-sm font-bold ${feedbackColor(g.feedback[ci])}`}>
                  {ch}
                </div>
              ))}
            </div>
          </div>
        ))}
        {gameState === "playing" && (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs w-6">{`>${guesses.length + 1}`}</span>
            <span className="text-green-400 animate-pulse">_</span>
          </div>
        )}
      </div>

      {/* Input / Results */}
      <div className="w-full max-w-lg relative z-10">
        {gameState === "playing" ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value.slice(0, LENGTHS[difficulty]))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={`Enter ${LENGTHS[difficulty]}-char guess...`}
              maxLength={LENGTHS[difficulty]}
              className="flex-1 bg-black/60 border border-green-500/40 rounded px-3 py-2 text-green-400 font-mono text-sm focus:outline-none focus:border-green-400 placeholder:text-green-400/30"
            />
            <CyberpunkButton variant="neon" size="sm" onClick={handleSubmit} disabled={currentInput.length !== LENGTHS[difficulty]}>
              <Zap className="h-4 w-4" />
            </CyberpunkButton>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className={`text-2xl font-bold ${gameState === "won" ? "text-green-400" : "text-red-400"}`}>
              {gameState === "won" ? "// ACCESS GRANTED //" : "// ACCESS DENIED //"}
            </div>
            {gameState === "won" && (
              <div className="text-green-400/70 text-sm">
                +{(BASE_SCORE[difficulty] + timeLeft * 10) * streak || BASE_SCORE[difficulty] + timeLeft * 10} points
              </div>
            )}
            <CyberpunkButton variant="neon" size="sm" onClick={() => startNewGame(difficulty)}>
              <RotateCcw className="h-4 w-4 mr-1" /> HACK AGAIN
            </CyberpunkButton>
          </div>
        )}

        {/* Difficulty selector */}
        <div className="flex gap-2 mt-3 justify-center">
          {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
            <Badge
              key={d}
              variant={difficulty === d ? "default" : "outline"}
              className={`cursor-pointer font-mono text-xs ${difficulty === d ? "bg-green-500/20 text-green-400 border-green-400" : "text-green-400/50 border-green-500/20 hover:border-green-400/50"}`}
              onClick={() => gameState !== "playing" ? startNewGame(d) : undefined}
            >
              {d.toUpperCase()}
            </Badge>
          ))}
        </div>
        <div className="text-center text-xs text-green-400/30 mt-2">
          Attempts: {guesses.length}/8 • {LENGTHS[difficulty]} chars • {gameState === "playing" ? "Type your guess" : "Select difficulty to play again"}
        </div>
      </div>
    </div>
  )
}
