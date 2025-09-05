import { useState } from "react"
import { CyberHeader } from "@/components/layout/CyberHeader"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ImageGeneration } from "@/components/features/ImageGeneration"
import { UserAvatar } from "@/components/features/UserAvatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Image, User, Brain } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <CyberHeader />
        
        <div className="glass-morphism rounded-xl border border-card-border p-6 h-[calc(100vh-240px)]">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-card-border">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                DarkBERT Chat
              </TabsTrigger>
              <TabsTrigger 
                value="images"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Image className="h-4 w-4 mr-2" />
                SDXL Studio
              </TabsTrigger>
              <TabsTrigger 
                value="avatar"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <User className="h-4 w-4 mr-2" />
                Avatar
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-6">
              <TabsContent value="chat" className="h-full mt-0">
                <ChatInterface />
              </TabsContent>
              
              <TabsContent value="images" className="h-full mt-0 overflow-y-auto">
                <ImageGeneration />
              </TabsContent>
              
              <TabsContent value="avatar" className="h-full mt-0 overflow-y-auto">
                <div className="max-w-md mx-auto">
                  <UserAvatar />
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="h-full mt-0 overflow-y-auto">
                <div className="text-center text-muted-foreground font-mono">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                  <h3 className="text-xl mb-2">AI Configuration Panel</h3>
                  <p>Advanced DarkBERT settings and capabilities coming soon...</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
