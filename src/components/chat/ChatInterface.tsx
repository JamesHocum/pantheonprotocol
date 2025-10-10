import { useState, useRef, useEffect } from "react"
import { Send, Image, Zap, Brain, Upload, Download, Wifi, WifiOff } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { initializeOfflineModel, generateOfflineResponse, isOfflineModelReady, isOfflineModelLoading } from "@/lib/offlineAI"
import { assistants, type AssistantKey } from "@/lib/assistants"
import { MountRushmoreSelector } from "./MountRushmoreSelector"
import { AIAvatar } from "./AIAvatars"

interface Message {
  id: string
  type: "user" | "darkbert"
  content: string
  timestamp: Date
  avatar?: string
  assistantKey?: AssistantKey
}

export const ChatInterface = () => {
const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "darkbert",
      assistantKey: "violet",
      content: "Welcome, darling — to LadyVioletGPT's Cyberpunk Café. I'm LadyVioletGPT, your host. Sip the synth-brew, lean into the neon, and tell me which of my specialists you'd like to summon. I keep curiosities, solutions, and delightful chaos on the menu. Pick an alias: DarkBERT, GhostGPT, DemonGPT (ethical red-team only), WormGPT, Venice — or ask for something custom. Your secrets are safe; your ideas are safe. Now — let us begin.",
      timestamp: new Date(),
    }
  ])
const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [modelLoadProgress, setModelLoadProgress] = useState<any>(null)
  const [assistantKey, setAssistantKey] = useState<AssistantKey>("violet")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDownloadModel = async () => {
    try {
      setIsTyping(true)
      await initializeOfflineModel((progress) => {
        setModelLoadProgress(progress)
      })
      setModelLoadProgress(null)
      setOfflineMode(true)
      
const successMessage: Message = {
        id: Date.now().toString(),
        type: "darkbert",
        assistantKey,
        content: "Neural network successfully downloaded and cached! I'm now running offline on your device. No internet required for our conversations.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "darkbert",
        content: "Failed to download offline model. Please check your connection and try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      let responseContent = ""
      
      if (offlineMode && isOfflineModelReady()) {
        // Use offline model with selected assistant system prompt
        responseContent = await generateOfflineResponse(inputMessage, {
          systemPrompt: assistants[assistantKey].systemPrompt,
        })
        
        const darkbertResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "darkbert",
          assistantKey,
          content: responseContent,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, darkbertResponse])
      } else {
        // Stream response from Lovable AI
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: assistants[assistantKey].systemPrompt },
              { role: "user", content: inputMessage }
            ],
            assistantKey,
          }),
        })

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limits exceeded, please try again later.")
          }
          if (response.status === 402) {
            throw new Error("Payment required, please add credits to continue.")
          }
          throw new Error("Failed to get AI response")
        }

        if (!response.body) throw new Error("No response body")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let textBuffer = ""
        let streamDone = false
        let assistantMessageId = (Date.now() + 1).toString()

        while (!streamDone) {
          const { done, value } = await reader.read()
          if (done) break
          textBuffer += decoder.decode(value, { stream: true })

          let newlineIndex: number
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex)
            textBuffer = textBuffer.slice(newlineIndex + 1)

            if (line.endsWith("\r")) line = line.slice(0, -1)
            if (line.startsWith(":") || line.trim() === "") continue
            if (!line.startsWith("data: ")) continue

            const jsonStr = line.slice(6).trim()
            if (jsonStr === "[DONE]") {
              streamDone = true
              break
            }

            try {
              const parsed = JSON.parse(jsonStr)
              const content = parsed.choices?.[0]?.delta?.content as string | undefined
              if (content) {
                responseContent += content
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1]
                  if (lastMsg?.id === assistantMessageId && lastMsg?.type === "darkbert") {
                    return prev.map((m, i) => 
                      i === prev.length - 1 
                        ? { ...m, content: responseContent }
                        : m
                    )
                  }
                  return [...prev, {
                    id: assistantMessageId,
                    type: "darkbert" as const,
                    assistantKey,
                    content: responseContent,
                    timestamp: new Date(),
                  }]
                })
              }
            } catch {
              textBuffer = line + "\n" + textBuffer
              break
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "darkbert",
        content: error instanceof Error ? error.message : "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mount Rushmore Selector */}
      <MountRushmoreSelector selectedAssistant={assistantKey} onSelectAssistant={setAssistantKey} />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "darkbert" && (
              <div className="flex-shrink-0">
                <AIAvatar assistantKey={message.assistantKey ?? "darkbert"} />
              </div>
            )}
            
            <Card className={`max-w-md p-3 ${
              message.type === "user" 
                ? "bg-primary/20 border-primary" 
                : "glass-morphism border-card-border"
            }`}>
              <div className="flex items-center gap-2 mb-1">
<Badge variant={message.type === "user" ? "default" : "secondary"} className="text-xs">
                  {message.type === "user" ? "USER" : (assistants[message.assistantKey ?? "darkbert"].name)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed font-mono">{message.content}</p>
            </Card>

            {message.type === "user" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-cyberpunk flex items-center justify-center border-2 border-primary shadow-glow-cyber">
                  <span className="text-xs font-bold">U</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <AIAvatar assistantKey={assistantKey} />
            <Card className="glass-morphism border-card-border p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-mono text-muted-foreground">
{modelLoadProgress ? 
                    `Downloading neural net: ${Math.round(modelLoadProgress.progress || 0)}%` : 
                    offlineMode ? `${assistants[assistantKey].name} processing offline...` : `${assistants[assistantKey].name} is processing...`
                  }
                </span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30 bg-card/20">
{/* Status Bar */}
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            {offlineMode ? (
              <>
                <WifiOff className="h-3 w-3 text-secondary" />
                <span className="text-secondary">OFFLINE MODE</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 text-primary" />
                <span className="text-primary">ONLINE • Free Gemini</span>
              </>
            )}
          </div>
          {!offlineMode && !isOfflineModelLoading() && (
            <CyberpunkButton variant="ghost" size="sm" onClick={handleDownloadModel}>
              <Download className="h-3 w-3 mr-1" />
              Download Neural Net
            </CyberpunkButton>
          )}
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="flex gap-1">
            <CyberpunkButton variant="ghost" size="icon">
              <Upload className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Image className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Zap className="h-4 w-4" />
            </CyberpunkButton>
          </div>
          
          <div className="flex-1">
<CyberInput
              variant="terminal"
              placeholder={`Enter your query for ${assistants[assistantKey].name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          
          <CyberpunkButton 
            variant="cyber" 
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </CyberpunkButton>
        </div>
      </div>
    </div>
  )
}