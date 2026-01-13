import { Wrench, ExternalLink, ChevronRight, Terminal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToolkits } from "@/hooks/useToolkits"
import type { Json } from "@/integrations/supabase/types"

interface Tool {
  name: string
  description?: string
  url?: string
}

const parseTools = (tools: Json): Tool[] => {
  if (!Array.isArray(tools)) return []
  return tools as unknown as Tool[]
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "reconnaissance": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "exploitation": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "network": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "web": return "bg-green-500/20 text-green-400 border-green-500/30"
    case "forensics": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    default: return "bg-primary/20 text-primary border-primary/30"
  }
}

export const ToolkitBrowser = () => {
  const { toolkits, loading, error } = useToolkits()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wrench className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm font-mono text-muted-foreground">Loading toolkits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p className="font-mono">Error loading toolkits: {error.message}</p>
      </div>
    )
  }

  if (toolkits.length === 0) {
    return (
      <div className="text-center p-8">
        <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-mono">No toolkits available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Wrench className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold font-mono">Hacker Toolkits</h2>
        <Badge variant="secondary" className="ml-auto">{toolkits.length} kits</Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {toolkits.map((toolkit) => {
          const tools = parseTools(toolkit.tools)

          return (
            <AccordionItem
              key={toolkit.id}
              value={toolkit.id}
              className="border-0"
            >
              <Card className="glass-morphism border-card-border overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5">
                  <div className="flex items-center gap-3 w-full">
                    <Terminal className="h-5 w-5 text-primary" />
                    <div className="flex-1 text-left">
                      <h3 className="font-mono font-bold">{toolkit.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {toolkit.description}
                      </p>
                    </div>
                    <Badge className={getCategoryColor(toolkit.category)}>
                      {toolkit.category}
                    </Badge>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {toolkit.description}
                  </p>

                  {toolkit.tutorial_content && (
                    <div className="bg-card/50 rounded-lg p-3 mb-4 border border-border/30">
                      <h4 className="text-xs font-mono font-bold text-primary mb-2">Tutorial</h4>
                      <p className="text-sm">{toolkit.tutorial_content}</p>
                    </div>
                  )}

                  {tools.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono font-bold text-muted-foreground mb-3">
                        Tools ({tools.length})
                      </h4>
                      <div className="grid gap-2">
                        {tools.map((tool, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded bg-card/30 border border-border/20"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-primary" />
                              <span className="font-mono text-sm">{tool.name}</span>
                            </div>
                            {tool.url && (
                              <a 
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </Card>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
