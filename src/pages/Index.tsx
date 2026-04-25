import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopUtilityBar } from "@/components/layout/TopUtilityBar"
import { StatusBar } from "@/components/dashboard/StatusBar"
import { InstructorRail } from "@/components/dashboard/InstructorRail"
import { AcademyModulesRail } from "@/components/dashboard/AcademyModulesRail"
import { WorkspacePanel } from "@/components/dashboard/WorkspacePanel"
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel"
import { ImageGeneration } from "@/components/features/ImageGeneration"
import { UserAvatar } from "@/components/features/UserAvatar"
import { AppSettings } from "@/components/features/AppSettings"
import { VoiceAssistant } from "@/components/features/VoiceAssistant"
import { ClassroomDashboard } from "@/components/classroom/ClassroomDashboard"
import { HackerNewsFeed } from "@/components/features/HackerNewsFeed"
import { GameLauncher } from "@/components/features/GameLauncher"
import { UnlockableAvatars } from "@/components/features/UnlockableAvatars"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner"
import { CourseLibrary } from "@/components/training/CourseLibrary"
import { CourseViewer } from "@/components/training/CourseViewer"
import { ProgressTracker } from "@/components/training/ProgressTracker"
import { ToolkitBrowser } from "@/components/training/ToolkitBrowser"
import { ExerciseRunner } from "@/components/training/ExerciseRunner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CyberpunkButton } from "@/components/ui/cyberpunk-button"
import { MessageSquare, Image, User, Settings, Mic, ExternalLink, GraduationCap, BookOpen, Wrench, Trophy, Code, Users, Newspaper, Gamepad2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Course } from "@/hooks/useCourses"
import type { AssistantKey } from "@/lib/assistants"

const Index = () => {
  const { loading } = useAuth()
  const [showTorPrompt, setShowTorPrompt] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [academyTab, setAcademyTab] = useState("courses")
  const [mainTab, setMainTab] = useState("chat")
  const [activeAssistant, setActiveAssistant] = useState<AssistantKey>("violet")
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(undefined)

  useEffect(() => {
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    const hasSeenTorPrompt = localStorage.getItem("tor-prompt-seen")
    if (isInstalled && !hasSeenTorPrompt) setShowTorPrompt(true)
  }, [])

  const handleTorDownload = () => {
    window.open("https://www.torproject.org/download/", "_blank")
    localStorage.setItem("tor-prompt-seen", "true")
    setShowTorPrompt(false)
  }
  const dismissTorPrompt = () => {
    localStorage.setItem("tor-prompt-seen", "true")
    setShowTorPrompt(false)
  }

  const openAcademy = (subTab?: string) => {
    setMainTab("academy")
    if (subTab) setAcademyTab(subTab)
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar onSelectTab={setMainTab} activeTab={mainTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <TopUtilityBar />

          {showTorPrompt && (
            <div className="holo-card mx-3 mt-3 p-4 flex items-center justify-between border border-secondary/40">
              <div>
                <h4 className="text-secondary font-bold font-mono text-sm tracking-wider uppercase">
                  Enhance Privacy with Tor
                </h4>
                <p className="text-xs text-muted-foreground font-mono">
                  Download Tor Browser for enhanced anonymity when using Tor mode.
                </p>
              </div>
              <div className="flex gap-2">
                <CyberpunkButton variant="ghost" size="sm" onClick={dismissTorPrompt}>Later</CyberpunkButton>
                <CyberpunkButton variant="neon" size="sm" onClick={handleTorDownload}>
                  <ExternalLink className="h-4 w-4" />Download Tor
                </CyberpunkButton>
              </div>
            </div>
          )}

          {/* Tabs */}
          <main className="flex-1 px-3 pt-3 pb-1 min-h-0 overflow-hidden">
            <Tabs value={mainTab} onValueChange={setMainTab} className="h-full flex flex-col">
              <TabsList className="holo-card grid grid-cols-9 w-full p-1 h-auto bg-transparent">
                {[
                  { v: "chat",      icon: MessageSquare, label: "Chat" },
                  { v: "academy",   icon: GraduationCap, label: "Academy" },
                  { v: "classroom", icon: Users,         label: "Classroom" },
                  { v: "images",    icon: Image,         label: "Studio" },
                  { v: "news",      icon: Newspaper,     label: "News" },
                  { v: "games",     icon: Gamepad2,      label: "Games" },
                  { v: "voice",     icon: Mic,           label: "Voice" },
                  { v: "avatar",    icon: User,          label: "Profile" },
                  { v: "settings",  icon: Settings,      label: "Settings" },
                ].map(({ v, icon: Icon, label }) => (
                  <TabsTrigger
                    key={v}
                    value={v}
                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)] rounded-md text-xs tracking-wider uppercase font-mono"
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    <span className="hidden md:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 mt-3 min-h-0 overflow-hidden">
                {/* CHAT — new dashboard composition */}
                <TabsContent value="chat" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col gap-3 overflow-y-auto pb-3">
                  <InstructorRail active={activeAssistant} onSelect={setActiveAssistant} />
                  <AcademyModulesRail onOpenAcademy={openAcademy} />
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 flex-1 min-h-[520px]">
                    <WorkspacePanel
                      active={activeAssistant}
                      onAssistantChange={setActiveAssistant}
                      pendingPrompt={pendingPrompt}
                      onPromptConsumed={() => setPendingPrompt(undefined)}
                    />
                    <QuickActionsPanel active={activeAssistant} onSelect={(p) => setPendingPrompt(p)} />
                  </div>
                </TabsContent>

                <TabsContent value="academy" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  {selectedCourse ? (
                    <CourseViewer course={selectedCourse} onBack={() => setSelectedCourse(null)} />
                  ) : (
                    <Tabs value={academyTab} onValueChange={setAcademyTab} className="h-full">
                      <TabsList className="mb-4 bg-card/30 border border-border/30">
                        <TabsTrigger value="courses" className="data-[state=active]:bg-primary/20"><BookOpen className="h-4 w-4 mr-2" />Courses</TabsTrigger>
                        <TabsTrigger value="exercises" className="data-[state=active]:bg-primary/20"><Code className="h-4 w-4 mr-2" />Exercises</TabsTrigger>
                        <TabsTrigger value="toolkits" className="data-[state=active]:bg-primary/20"><Wrench className="h-4 w-4 mr-2" />Toolkits</TabsTrigger>
                        <TabsTrigger value="progress" className="data-[state=active]:bg-primary/20"><Trophy className="h-4 w-4 mr-2" />My Progress</TabsTrigger>
                      </TabsList>
                      <TabsContent value="courses" className="mt-0"><CourseLibrary onSelectCourse={setSelectedCourse} /></TabsContent>
                      <TabsContent value="exercises" className="mt-0"><ExerciseRunner /></TabsContent>
                      <TabsContent value="toolkits" className="mt-0"><ToolkitBrowser /></TabsContent>
                      <TabsContent value="progress" className="mt-0"><ProgressTracker onSelectCourse={setSelectedCourse} /></TabsContent>
                    </Tabs>
                  )}
                </TabsContent>

                <TabsContent value="classroom" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <ClassroomDashboard />
                </TabsContent>

                <TabsContent value="images" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <ImageGeneration />
                </TabsContent>

                <TabsContent value="news" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <HackerNewsFeed embedded />
                </TabsContent>

                <TabsContent value="games" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <GameLauncher />
                </TabsContent>

                <TabsContent value="voice" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <VoiceAssistant />
                </TabsContent>

                <TabsContent value="avatar" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <div className="max-w-md mx-auto space-y-6">
                    <UserAvatar />
                    <UnlockableAvatars />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="h-full mt-0 overflow-y-auto holo-card p-4">
                  <AppSettings />
                </TabsContent>
              </div>
            </Tabs>
          </main>

          <StatusBar />
        </div>

        <InstallPrompt />
        <PWAInstallBanner />
      </div>
    </SidebarProvider>
  )
}

export default Index
