import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Check } from "lucide-react";

interface TickerCandidate {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
}

interface AddTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicker: (ticker: TickerCandidate) => void;
  maxTickers: number;
  currentCount: number;
}

const mockCandidates: TickerCandidate[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", sector: "Communication Services" }
];

export const AddTickerModal = ({ 
  isOpen, 
  onClose, 
  onAddTicker, 
  maxTickers, 
  currentCount 
}: AddTickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<TickerCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const canAddMore = currentCount < maxTickers;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockCandidates.filter(candidate => 
        candidate.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCandidates(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleAddTicker = (ticker: TickerCandidate) => {
    onAddTicker(ticker);
    setSearchQuery("");
    setCandidates([]);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setCandidates([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Ticker to Watchlist</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {canAddMore 
              ? `Add up to ${maxTickers - currentCount} more ticker${maxTickers - currentCount !== 1 ? 's' : ''}`
              : `Watchlist is full (${currentCount}/${maxTickers})`
            }
          </p>
        </DialogHeader>

        {canAddMore ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by ticker symbol or company name</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="e.g., AAPL, Apple, Tesla..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={!searchQuery.trim() || isSearching}
                  size="sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {candidates.length > 0 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {candidates.map((candidate) => (
                    <div 
                      key={candidate.symbol}
                      className="flex items-center justify-between p-3 rounded-lg border border-card-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono font-semibold text-sm">{candidate.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {candidate.exchange}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{candidate.name}</p>
                        {candidate.sector && (
                          <p className="text-xs text-muted-foreground">{candidate.sector}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddTicker(candidate)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <strong>Tip:</strong> You can search for companies by name (e.g., "Apple") or ticker symbol (e.g., "AAPL"). 
              International stocks are supported (e.g., "RELIANCE.NS" for Indian stocks).
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your watchlist is full. Remove a ticker to add a new one.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};