import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "./Sparkline";

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparklineData: number[];
  lastSignal?: {
    type: "bullish" | "bearish" | "neutral";
    confidence: number;
    timestamp: string;
  };
}

interface WatchlistCardProps {
  tickers: Ticker[];
  onAddTicker: () => void;
  onRemoveTicker: (symbol: string) => void;
}

export const WatchlistCard = ({ tickers, onAddTicker, onRemoveTicker }: WatchlistCardProps) => {
  const maxTickers = 6;
  const canAddMore = tickers.length < maxTickers;

  return (
    <Card className="bg-card border-card-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Watchlist ({tickers.length}/{maxTickers})
          </CardTitle>
          {canAddMore && (
            <Button variant="ghost" size="sm" onClick={onAddTicker} className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="group relative">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-mono font-semibold text-sm">{ticker.symbol}</span>
                  {ticker.lastSignal && (
                    <Badge 
                      variant="outline" 
                      className={`sentiment-badge sentiment-${ticker.lastSignal.type} px-1 py-0 text-xs`}
                    >
                      {ticker.lastSignal.type}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{ticker.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-sm font-semibold">
                    ${ticker.price.toFixed(2)}
                  </span>
                  <div className={`flex items-center text-xs ${
                    ticker.change >= 0 ? 'text-bullish' : 'text-bearish'
                  }`}>
                    {ticker.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {ticker.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="ml-3 flex flex-col items-end">
                <Sparkline 
                  data={ticker.sparklineData} 
                  width={60} 
                  height={24}
                  color={ticker.change >= 0 ? "bullish" : "bearish"}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTicker(ticker.symbol)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 mt-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {tickers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-3">No tickers in your watchlist</p>
            <Button variant="outline" onClick={onAddTicker} className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Ticker
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};