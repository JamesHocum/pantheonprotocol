import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Search, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assistants, type AssistantKey } from "@/lib/assistants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  assistant_key: string;
  created_at: string;
  updated_at: string;
  preview?: string;
}

interface ConversationSidebarProps {
  currentAssistant: AssistantKey;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
}

export const ConversationSidebar = ({
  currentAssistant,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchConversations();
    }
  }, [user, isOpen, currentAssistant]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get preview for each conversation
      const convosWithPreviews = await Promise.all(
        (convos || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from("chat_messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .eq("role", "user")
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...conv,
            preview: messages?.[0]?.content?.substring(0, 50) || "New conversation",
          };
        })
      );

      setConversations(convosWithPreviews);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete messages first
      await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversationId);

      // Then delete conversation
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      toast({ title: "Conversation deleted" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.preview
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssistant = !currentAssistant || conv.assistant_key === currentAssistant;
    return matchesSearch && matchesAssistant;
  });

  const groupedConversations = filteredConversations.reduce((acc, conv) => {
    const key = conv.assistant_key as AssistantKey;
    if (!acc[key]) acc[key] = [];
    acc[key].push(conv);
    return acc;
  }, {} as Record<AssistantKey, Conversation[]>);

  if (!user) return null;

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-2 top-20 z-50 bg-background/80 backdrop-blur border border-primary/30 hover:border-primary"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background/95 backdrop-blur-xl border-r border-primary/30 z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="p-4 border-b border-primary/20">
            <h2 className="text-lg font-bold text-primary mb-3">History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-primary/30"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : Object.keys(groupedConversations).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              Object.entries(groupedConversations).map(([key, convos]) => {
                const assistant = assistants[key as AssistantKey];
                return (
                  <div key={key} className="mb-6">
                    <h3
                      className="text-sm font-semibold mb-2 flex items-center gap-2"
                      style={{ color: assistant?.avatarColor }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: assistant?.avatarColor }}
                      />
                      {assistant?.name || key}
                    </h3>
                    <div className="space-y-2">
                      {convos.map((conv) => (
                        <div
                          key={conv.id}
                          className="group flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors"
                          onClick={() => onSelectConversation?.(conv.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{conv.preview}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>

          <div className="p-4 border-t border-primary/20">
            <Button
              onClick={onNewConversation}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
