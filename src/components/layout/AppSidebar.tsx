import { Home, Wrench, Gamepad2, GraduationCap, Users, Settings, BookOpen, Sparkles } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  /** Optional callback to switch the main tab (Chat/Academy/etc.) on the dashboard */
  onSelectTab?: (tab: string) => void
  activeTab?: string
}

const items = [
  { id: "chat",      label: "Workspace",  icon: Home,         tab: "chat" },
  { id: "academy",   label: "Academy",    icon: GraduationCap, tab: "academy" },
  { id: "classroom", label: "Classroom",  icon: Users,        tab: "classroom" },
  { id: "studio",    label: "AI Studio",  icon: Sparkles,     tab: "images" },
  { id: "courses",   label: "Courses",    icon: BookOpen,     tab: "academy" },
  { id: "toolkits",  label: "Toolkits",   icon: Wrench,       tab: "academy" },
  { id: "games",     label: "Games",      icon: Gamepad2,     tab: "games" },
  { id: "settings",  label: "Settings",   icon: Settings,     tab: "settings" },
]

export function AppSidebar({ onSelectTab, activeTab }: AppSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarContent className="bg-sidebar/80 backdrop-blur-xl">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 pt-3">
              {items.map((item) => {
                const isActive = activeTab === item.tab
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      className={cn(
                        "h-10 rounded-md transition-all",
                        isActive
                          ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)]"
                          : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <button
                        onClick={() => {
                          if (location.pathname !== "/") navigate("/")
                          onSelectTab?.(item.tab)
                        }}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                        {!collapsed && <span className="text-sm font-mono">{item.label}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
