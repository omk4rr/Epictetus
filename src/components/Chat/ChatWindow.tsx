import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatMessage } from "@/pages/AIChat";
import { Send, Paperclip, AlertTriangle } from "lucide-react";
import { mockTickers } from "@/data/mockData";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string, watchlistId?: string, webSearch?: boolean) => void;
  onViewEvidence: (evidence: any[]) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const QUICK_PROMPTS = [
  "Which of my 6 stocks might surge tomorrow?",
  "Any takeover rumors for my watchlist?",
  "Which stock should I short based on recent policy changes?",
  "Recent Indian Government announcements affecting my stocks?",
];

export const ChatWindow = ({
  messages,
  isLoading,
  onSendMessage,
  onViewEvidence,
  messagesEndRef,
}: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>();
  const [searchMode, setSearchMode] = useState<string>("web"); // 'web' | 'local'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim(), selectedWatchlist, searchMode === "web");
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt, selectedWatchlist, searchMode === "web");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Disclaimer Banner */}
      <Alert className="m-4 border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Research-only outputs — not financial advice.</strong> Use at your own risk.
        </AlertDescription>
      </Alert>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary-foreground rounded-lg" />
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to AI Chat</h3>
              <p className="text-muted-foreground mb-6">
                Ask questions about stocks, companies, news, and market analysis.
              </p>
              
              {/* Quick Prompts */}
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left h-auto p-3 whitespace-normal"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              onViewEvidence={onViewEvidence}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="ml-2 text-sm">Processing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-card-border p-4 space-y-3">
        {/* Watchlist Selector + Mode */}
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Attach watchlist (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Watchlist ({mockTickers.length} tickers)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={searchMode} onValueChange={setSearchMode}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">LLM + Web Search</SelectItem>
              <SelectItem value="local">LLM (Local RAG only)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, companies, news, or market analysis..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Tip: Attach a watchlist to give the assistant context (max 6 tickers).
        </p>
      </div>
    </div>
  );
};