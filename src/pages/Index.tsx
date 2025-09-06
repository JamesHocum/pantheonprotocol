import { useState } from "react"
import { CyberHeader } from "@/components/layout/CyberHeader"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ImageGeneration } from "@/components/features/ImageGeneration"
import { UserAvatar } from "@/components/features/UserAvatar"
import { AppSettings } from "@/components/features/AppSettings"
import { VoiceAssistant } from "@/components/features/VoiceAssistant"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Image, User, Settings, Mic } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <CyberHeader />
        
        <div className="glass-morphism rounded-xl border border-card-border p-6 h-[calc(100vh-240px)]">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-card-border">
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
                AI Studio
              </TabsTrigger>
              <TabsTrigger 
                value="voice"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice AI
              </TabsTrigger>
              <TabsTrigger 
                value="avatar"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <User className="h-4 w-4 mr-2" />
                Avatar
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-purple"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-6">
              <TabsContent value="chat" className="h-full mt-0">
                <ChatInterface />
              </TabsContent>
              
              <TabsContent value="images" className="h-full mt-0 overflow-y-auto">
                <ImageGeneration />
              </TabsContent>
              
              <TabsContent value="voice" className="h-full mt-0 overflow-y-auto">
                <VoiceAssistant />
              </TabsContent>
              
              <TabsContent value="avatar" className="h-full mt-0 overflow-y-auto">
                <div className="max-w-md mx-auto">
                  <UserAvatar />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="h-full mt-0 overflow-y-auto">
                <AppSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <InstallPrompt />
    </div>
  );
};

export default Index;
