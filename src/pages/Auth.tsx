import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Badge } from "@/components/ui/badge"
import { LogIn, UserPlus, Mail, Lock, User, Zap } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").optional()
})

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validation = authSchema.safeParse({
        email,
        password,
        displayName: !isLogin ? displayName : undefined
      })

      if (!validation.success) {
        toast.error(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password")
          } else {
            toast.error(error.message)
          }
        } else {
          toast.success("Welcome back, operator!")
          navigate("/")
        }
      } else {
        const { error } = await signUp(email, password, displayName)
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in.")
          } else {
            toast.error(error.message)
          }
        } else {
          toast.success("Account created! Welcome to the Cyberpunk Café.")
          navigate("/")
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-morphism border-card-border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-cyberpunk flex items-center justify-center border-2 border-primary shadow-glow-cyber">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary neon-text mb-2">
            Cyberpunk Café
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            {isLogin ? "Access your neural interface" : "Create your digital identity"}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <CyberpunkButton
            variant={isLogin ? "cyber" : "ghost"}
            className="flex-1"
            onClick={() => setIsLogin(true)}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </CyberpunkButton>
          <CyberpunkButton
            variant={!isLogin ? "cyber" : "ghost"}
            className="flex-1"
            onClick={() => setIsLogin(false)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </CyberpunkButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-mono text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Display Name
              </label>
              <CyberInput
                variant="terminal"
                placeholder="Enter your alias..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-mono text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </label>
            <CyberInput
              variant="terminal"
              type="email"
              placeholder="operator@cyberpunk.cafe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Password
            </label>
            <CyberInput
              variant="terminal"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <CyberpunkButton
            type="submit"
            variant="neon"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Processing...</span>
              </span>
            ) : isLogin ? (
              "Access Terminal"
            ) : (
              "Initialize Account"
            )}
          </CyberpunkButton>
        </form>

        <div className="mt-6 text-center">
          <Badge variant="outline" className="text-xs font-mono">
            Secured by Neural Encryption
          </Badge>
        </div>
      </Card>
    </div>
  )
}

export default Auth
