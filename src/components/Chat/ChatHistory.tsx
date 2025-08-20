import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare } from "lucide-react";

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
}

interface ChatHistoryProps {
  chatHistory: ChatHistoryItem[];
  currentChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatHistory = ({
  chatHistory,
  currentChat,
  onSelectChat,
  onNewChat,
}: ChatHistoryProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-border">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                currentChat === chat.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {chat.preview}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};