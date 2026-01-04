import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Shield, Bug, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewsItem {
  headline: string;
  summary: string;
  category: string;
  source: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
}

const severityColors = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const categoryIcons: Record<string, React.ReactNode> = {
  vulnerabilities: <Bug className="h-4 w-4" />,
  breaches: <AlertTriangle className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4" />,
  research: <Shield className="h-4 w-4" />,
};

export const HackerNewsFeed = () => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");

  const fetchNews = async (cat: string = category) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("hacker-news", {
        body: { category: cat },
      });

      if (error) throw error;

      if (data.news) {
        setNews(data.news);
      }
    } catch (error: any) {
      console.error("News fetch error:", error);
      toast({
        title: "Failed to fetch news",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    fetchNews(newCategory);
  };

  const categories = ["all", "vulnerabilities", "breaches", "tools", "research"];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Collapsed state - floating button */}
      {!isExpanded && (
        <Button
          onClick={() => {
            setIsExpanded(true);
            if (news.length === 0) fetchNews();
          }}
          className="rounded-full h-12 w-12 bg-primary/20 backdrop-blur border border-primary/50 hover:bg-primary/30 shadow-lg shadow-primary/20"
        >
          <Newspaper className="h-5 w-5 text-primary" />
        </Button>
      )}

      {/* Expanded state - news feed */}
      {isExpanded && (
        <div className="w-80 max-h-[500px] bg-background/95 backdrop-blur-xl border border-primary/30 rounded-lg shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-primary/20 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">Hacker News Feed</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fetchNews()}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category filters */}
          <div className="p-2 border-b border-primary/10 flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? "default" : "outline"}
                className="cursor-pointer text-xs capitalize"
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* News list */}
          <ScrollArea className="h-80">
            {loading && news.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Fetching intel...</p>
              </div>
            ) : news.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">Click refresh to load news</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {news.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="mt-0.5">
                        {categoryIcons[item.category?.toLowerCase()] || <Newspaper className="h-4 w-4" />}
                      </div>
                      <h4 className="text-sm font-semibold leading-tight flex-1">
                        {item.headline}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", severityColors[item.severity] || severityColors.medium)}
                      >
                        {item.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
