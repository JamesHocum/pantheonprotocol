import { useState, useRef, useEffect } from "react"
import { Send, Image, Zap, Brain, Upload, Download, Wifi, WifiOff, Settings2, Trash2, Shield, Search } from "lucide-react"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { CyberInput } from "@/components/ui/cyber-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { initializeOfflineModel, generateOfflineResponse, isOfflineModelReady, isOfflineModelLoading } from "@/lib/offlineAI"
import { assistants, type AssistantKey } from "@/lib/assistants"
import { MountRushmoreSelector } from "./MountRushmoreSelector"
import { AIAvatar } from "./AIAvatars"
import { AgentSettings } from "@/components/features/AgentSettings"
import { CodeCanvas } from "@/components/features/CodeCanvas"
import { ConversationSidebar } from "./ConversationSidebar"
import { ConversationStarters } from "./ConversationStarters"
import { useAuth } from "@/contexts/AuthContext"
import { useChatHistory } from "@/hooks/useChatHistory"
import { useAgentSettings } from "@/hooks/useAgentSettings"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Message {
  id: string
  type: "user" | "darkbert"
  content: string
  timestamp: Date
  avatar?: string
  assistantKey?: AssistantKey
  isWebSearch?: boolean
}

export const ChatInterface = () => {
  const { user, profile } = useAuth()
  const [assistantKey, setAssistantKey] = useState<AssistantKey>("violet")
  const { messages: savedMessages, addMessage, clearHistory, loading: historyLoading } = useChatHistory(assistantKey)
  const { settings: agentSettings } = useAgentSettings(assistantKey)
  
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
  const [webSearchMode, setWebSearchMode] = useState(false)
  const [modelLoadProgress, setModelLoadProgress] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load saved messages when authenticated
  useEffect(() => {
    if (!historyLoading && savedMessages.length > 0 && user) {
      const loadedMessages: Message[] = savedMessages.map(m => ({
        id: m.id,
        type: m.role === "user" ? "user" : "darkbert",
        content: m.content,
        timestamp: new Date(m.created_at),
        assistantKey: m.assistant_key as AssistantKey
      }))
      setMessages([messages[0], ...loadedMessages])
    }
  }, [savedMessages, historyLoading, user])

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

  const handleWebSearch = async (query: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("web-search", {
        body: { query, torMode: agentSettings?.tor_enabled },
      })

      if (error) throw error
      return data.result
    } catch (error: any) {
      console.error("Web search error:", error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      isWebSearch: webSearchMode,
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputMessage
    setInputMessage("")
    setIsTyping(true)

    // Save user message if authenticated
    if (user) {
      await addMessage("user", messageContent)
    }

    try {
      let responseContent = ""
      
      // Handle web search mode
      if (webSearchMode) {
        const searchResult = await handleWebSearch(messageContent)
        responseContent = `🔍 **Web Search Results:**\n\n${searchResult}`
        
        const searchResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "darkbert",
          assistantKey,
          content: responseContent,
          timestamp: new Date(),
          isWebSearch: true,
        }
        setMessages(prev => [...prev, searchResponse])
        
        if (user) {
          await addMessage("assistant", responseContent)
        }
        setIsTyping(false)
        return
      }
      
      // Build system prompt with custom instructions
      let systemPrompt = assistants[assistantKey].systemPrompt
      if (agentSettings?.custom_instructions) {
        systemPrompt += `\n\nAdditional user instructions: ${agentSettings.custom_instructions}`
      }
      
      // Add Tor context if enabled
      if (agentSettings?.tor_enabled) {
        systemPrompt += "\n\nNote: User has enabled Tor network mode. When searching or providing resources, prioritize .onion links and privacy-focused alternatives where appropriate."
      }
      
      if (offlineMode && isOfflineModelReady()) {
        responseContent = await generateOfflineResponse(messageContent, {
          systemPrompt,
        })
        
        const darkbertResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "darkbert",
          assistantKey,
          content: responseContent,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, darkbertResponse])
        
        if (user) {
          await addMessage("assistant", responseContent)
        }
      } else {
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: messageContent }
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
        
        // Save assistant response if authenticated
        if (user && responseContent) {
          await addMessage("assistant", responseContent)
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

  const handleClearHistory = async () => {
    if (user) {
      await clearHistory()
    }
    setMessages([messages[0]])
    toast.success("Chat history cleared")
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Conversation Sidebar */}
      <ConversationSidebar 
        currentAssistant={assistantKey} 
        onNewConversation={handleClearHistory}
      />
      
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
                  {message.type === "user" ? (profile?.display_name || "USER") : (assistants[message.assistantKey ?? "darkbert"].name)}
                </Badge>
                {message.isWebSearch && (
                  <Badge variant="outline" className="text-xs">
                    <Search className="h-3 w-3 mr-1" />
                    Web
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground font-mono">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">{message.content}</p>
            </Card>

            {message.type === "user" && (
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-primary shadow-glow-cyber object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-cyberpunk flex items-center justify-center border-2 border-primary shadow-glow-cyber">
                    <span className="text-xs font-bold">{profile?.display_name?.[0] || "U"}</span>
                  </div>
                )}
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
                    webSearchMode ? "Searching the web..." :
                    offlineMode ? `${assistants[assistantKey].name} processing offline...` : `${assistants[assistantKey].name} is processing...`
                  }
                </span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Conversation Starters - show when conversation is new */}
      {messages.length <= 1 && !isTyping && (
        <div className="px-4 pb-2">
          <ConversationStarters 
            assistantKey={assistantKey} 
            onSelectStarter={(message) => {
              setInputMessage(message)
            }}
          />
        </div>
      )}

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
            {webSearchMode && (
              <Badge variant="default" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                WEB SEARCH
              </Badge>
            )}
            {agentSettings?.tor_enabled && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                TOR
              </Badge>
            )}
            {user && (
              <Badge variant="outline" className="text-xs">
                Synced
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!offlineMode && !isOfflineModelLoading() && (
              <CyberpunkButton variant="ghost" size="sm" onClick={handleDownloadModel}>
                <Download className="h-3 w-3 mr-1" />
                Download Neural Net
              </CyberpunkButton>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="flex gap-1">
            <CyberpunkButton 
              variant={webSearchMode ? "cyber" : "ghost"} 
              size="icon"
              onClick={() => setWebSearchMode(!webSearchMode)}
              title="Web Search Mode"
            >
              <Search className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Upload className="h-4 w-4" />
            </CyberpunkButton>
            <CyberpunkButton variant="ghost" size="icon">
              <Image className="h-4 w-4" />
            </CyberpunkButton>
            
            {/* Agent Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <CyberpunkButton variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </CyberpunkButton>
              </DialogTrigger>
              <DialogContent className="bg-card border-card-border max-w-lg">
                <AgentSettings assistantKey={assistantKey} onClose={() => setShowSettings(false)} />
              </DialogContent>
            </Dialog>
            
            {/* Code Canvas Dialog */}
            <Dialog open={showCanvas} onOpenChange={setShowCanvas}>
              <DialogTrigger asChild>
                <CyberpunkButton variant="ghost" size="icon">
                  <Zap className="h-4 w-4" />
                </CyberpunkButton>
              </DialogTrigger>
              <DialogContent className="bg-card border-card-border max-w-2xl">
                <CodeCanvas assistantKey={assistantKey} />
              </DialogContent>
            </Dialog>
            
            {user && (
              <CyberpunkButton variant="ghost" size="icon" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4" />
              </CyberpunkButton>
            )}
          </div>
          
          <div className="flex-1">
            <CyberInput
              variant="terminal"
              placeholder={webSearchMode ? "Search the web..." : `Enter your query for ${assistants[assistantKey].name}...`}
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
