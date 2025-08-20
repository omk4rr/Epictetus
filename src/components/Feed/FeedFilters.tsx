import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Twitter, MessageSquare, Youtube, Filter } from "lucide-react";

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  itemCounts: {
    all: number;
    news: number;
    twitter: number;
    reddit: number;
    youtube: number;
  };
}

const filterIcons = {
  all: Filter,
  news: Globe,
  twitter: Twitter,
  reddit: MessageSquare,
  youtube: Youtube,
};

const filterLabels = {
  all: "All",
  news: "News",
  twitter: "X/Twitter", 
  reddit: "Reddit",
  youtube: "YouTube",
};

export const FeedFilters = ({ activeFilter, onFilterChange, itemCounts }: FeedFiltersProps) => {
  const filters = ["all", "news", "twitter", "reddit", "youtube"] as const;

  return (
    <div className="flex items-center space-x-2 mb-4">
      {filters.map((filter) => {
        const Icon = filterIcons[filter];
        const count = itemCounts[filter];
        const isActive = activeFilter === filter;
        
        return (
          <Button
            key={filter}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter)}
            className={`flex items-center space-x-2 transition-all ${
              isActive ? 'bg-primary text-primary-foreground shadow-glow' : ''
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-xs">{filterLabels[filter]}</span>
            {count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};