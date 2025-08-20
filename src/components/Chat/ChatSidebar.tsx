import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WatchlistCard } from "@/components/Watchlist/WatchlistCard";
import { mockTickers, mockSignals } from "@/data/mockData";
import { TrendingUp, TrendingDown, Minus, Eye, Archive } from "lucide-react";

const signalIcons = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
};

export const ChatSidebar = () => {
  const topSignals = mockSignals.slice(0, 3);

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      {/* Current Watchlist Snapshot */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Current Watchlist</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {mockTickers.slice(0, 4).map((ticker) => (
              <div key={ticker.symbol} className="flex items-center justify-between text-xs">
                <span className="font-mono">{ticker.symbol}</span>
                <div className="flex items-center gap-1">
                  <span className={ticker.change >= 0 ? "text-bullish" : "text-bearish"}>
                    {ticker.change >= 0 ? "+" : ""}{ticker.change.toFixed(2)}
                  </span>
                  <Badge
                    className={`sentiment-badge sentiment-${ticker.lastSignal.type} text-xs`}
                    variant="outline"
                  >
                    {ticker.lastSignal.type}
                  </Badge>
                </div>
              </div>
            ))}
            {mockTickers.length > 4 && (
              <div className="text-xs text-muted-foreground text-center pt-1">
                +{mockTickers.length - 4} more
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Signals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Top Signals</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {topSignals.map((signal) => {
              const SignalIcon = signalIcons[signal.type];
              return (
                <div key={signal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">{signal.ticker}</span>
                      <SignalIcon className={`w-3 h-3 ${
                        signal.type === 'bullish' ? 'text-bullish' : 
                        signal.type === 'bearish' ? 'text-bearish' : 'text-neutral'
                      }`} />
                    </div>
                    <span className="text-xs font-mono">{(signal.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{signal.action}</p>
                  {signal !== topSignals[topSignals.length - 1] && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Saved Analyses */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Saved Analyses</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Archive className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium">Tech Sector Analysis</p>
              <p className="text-xs text-muted-foreground">3 buy signals, 1 hold</p>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <p className="text-xs font-medium">Policy Impact Review</p>
              <p className="text-xs text-muted-foreground">Mixed signals detected</p>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-xs font-medium">Earnings Preview</p>
              <p className="text-xs text-muted-foreground">4 strong buy signals</p>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full text-xs">
          <Eye className="w-3 h-3 mr-1" />
          View All Alerts
        </Button>
        <Button variant="outline" size="sm" className="w-full text-xs">
          <Archive className="w-3 h-3 mr-1" />
          Export History
        </Button>
      </div>
    </div>
  );
};