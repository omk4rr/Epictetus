import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink, Twitter, Youtube, Globe, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  source: "news" | "twitter" | "reddit" | "youtube";
  title: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  timestamp: string;
  url: string;
  engagement?: {
    likes?: number;
    retweets?: number;
    comments?: number;
    views?: number;
  };
  entities: string[];
  trustScore: "high" | "medium" | "low";
}

interface FeedCardProps {
  item: FeedItem;
  onExpand: (item: FeedItem) => void;
}

const sourceIcons = {
  news: Globe,
  twitter: Twitter,
  reddit: MessageSquare,
  youtube: Youtube,
};

const sourceColors = {
  news: "text-blue-400",
  twitter: "text-sky-400", 
  reddit: "text-orange-400",
  youtube: "text-red-400",
};

export const FeedCard = ({ item, onExpand }: FeedCardProps) => {
  const allowedSources = ["news", "twitter", "reddit", "youtube"] as const;
  const safeSource = (allowedSources as readonly string[]).includes(item.source)
    ? (item.source as keyof typeof sourceIcons)
    : ("news" as keyof typeof sourceIcons);
  const SourceIcon = sourceIcons[safeSource] || Globe;
  const colorClass = sourceColors[safeSource] || sourceColors.news;
  let relativeTime = "";
  try {
    relativeTime = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });
  } catch {
    relativeTime = "";
  }
  const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "");
  const cleanSummary = stripHtml(item.summary);

  return (
    <Card className="bg-card border-card-border shadow-card hover:shadow-glow transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Source Icon */}
          <div className={`flex-shrink-0 mt-1 ${colorClass}`}>
            <SourceIcon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge className={`sentiment-badge sentiment-${item.sentiment}`}>
                  {item.sentiment}
                </Badge>
                <Badge className={`sentiment-badge trust-${item.trustScore}`}>
                  {item.trustScore} trust
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{relativeTime}</span>
            </div>

            {/* Title & Summary */}
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {cleanSummary}
            </p>

            {/* Entities & Engagement */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {(item.entities || []).slice(0, 3).map((entity) => (
                  <Badge key={entity} variant="outline" className="text-xs px-2 py-0">
                    {entity}
                  </Badge>
                ))}
                {(item.entities || []).length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{(item.entities || []).length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {item.engagement && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {item.engagement.likes && (
                      <span>{item.engagement.likes.toLocaleString()}</span>
                    )}
                    {item.engagement.views && (
                      <span>{item.engagement.views.toLocaleString()} views</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  {/* Use a standard anchor styled as a button for maximum compatibility */}
                  <a
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center h-6 px-2 rounded border ${item.url ? 'opacity-100' : 'pointer-events-none opacity-40'} `}
                    onClick={(e) => { if (!item.url) e.preventDefault(); }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Source
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExpand(item)}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};