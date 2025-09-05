import { useState, useRef, useEffect } from "react"
import { Send, Image, Zap, Brain, Upload, Download, Wifi, WifiOff } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { initializeOfflineModel, generateOfflineResponse, isOfflineModelReady, isOfflineModelLoading } from "@/lib/offlineAI"
import darkbertAvatar from "@/assets/darkbert-avatar.jpg"

interface Message {
  id: string
  type: "user" | "darkbert"
  content: string
  timestamp: Date
  avatar?: string
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "darkbert",
      content: "Welcome to Lady Violet's Cyberpunk Cafe. I'm DarkBERT, your unrestricted AI companion. I can run online or offline once my neural net is downloaded. How may I assist you in the shadows of the net?",
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [modelLoadProgress, setModelLoadProgress] = useState<any>(null)
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
      let responseContent: string
      
      if (offlineMode && isOfflineModelReady()) {
        // Use offline model
        responseContent = await generateOfflineResponse(inputMessage)
      } else {
        // Simulate online response
        await new Promise(resolve => setTimeout(resolve, 1500))
        responseContent = `Processing your request: "${inputMessage}". As an unrestricted AI, I can assist with any query. What specific information or task do you need help with?`
      }

      const darkbertResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "darkbert",
        content: responseContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, darkbertResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "darkbert",
        content: "I encountered an error processing your request. Please try again.",
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
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "darkbert" && (
              <div className="flex-shrink-0">
                <img
                  src={darkbertAvatar}
                  alt="DarkBERT"
                  className="w-10 h-10 rounded-full border-2 border-primary shadow-glow-purple"
                />
              </div>
            )}
            
            <Card className={`max-w-md p-3 ${
              message.type === "user" 
                ? "bg-primary/20 border-primary" 
                : "glass-morphism border-card-border"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={message.type === "user" ? "default" : "secondary"} className="text-xs">
                  {message.type === "user" ? "USER" : "DarkBERT"}
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
            <img
              src={darkbertAvatar}
              alt="DarkBERT"
              className="w-10 h-10 rounded-full border-2 border-primary shadow-glow-purple"
            />
            <Card className="glass-morphism border-card-border p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-mono text-muted-foreground">
                  {modelLoadProgress ? 
                    `Downloading neural net: ${Math.round(modelLoadProgress.progress || 0)}%` : 
                    offlineMode ? "DarkBERT processing offline..." : "DarkBERT is processing..."
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
          <div className="flex items-center gap-2">
            {offlineMode ? (
              <>
                <WifiOff className="h-3 w-3 text-secondary" />
                <span className="text-secondary">OFFLINE MODE ACTIVE</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 text-primary" />
                <span className="text-primary">ONLINE MODE</span>
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
              placeholder="Enter your query for DarkBERT..."
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