import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Signal {
  id: string;
  ticker: string;
  type: "bullish" | "bearish" | "neutral";
  score: number;
  confidence: number;
  action: string;
  timestamp: string;
  evidenceCount: number;
}

interface SignalsCardProps {
  signals: Signal[];
  onExplainSignal: (signal: Signal) => void;
}

const signalIcons = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
};

const signalColors = {
  bullish: "text-bullish",
  bearish: "text-bearish", 
  neutral: "text-neutral",
};

export const SignalsCard = ({ signals, onExplainSignal }: SignalsCardProps) => {
  const sortedSignals = signals.sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-card border-card-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Signals
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {signals.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSignals.map((signal) => {
          const SignalIcon = signalIcons[signal.type];
          const iconColor = signalColors[signal.type];
          
          return (
            <div key={signal.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <SignalIcon className={`w-4 h-4 ${iconColor}`} />
                  <span className="font-mono font-semibold text-sm">{signal.ticker}</span>
                  <Badge className={`sentiment-badge sentiment-${signal.type} px-1 py-0 text-xs`}>
                    {signal.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExplainSignal(signal)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Info className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-mono font-semibold">{signal.score.toFixed(2)}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-mono">{Math.round(signal.confidence * 100)}%</span>
                  </div>
                  <Progress value={signal.confidence * 100} className="h-1" />
                </div>

                <p className="text-xs text-muted-foreground mt-2">{signal.action}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>{signal.evidenceCount} evidence points</span>
                  <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {signals.length === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No active signals</p>
            <p className="text-xs text-muted-foreground mt-1">Signals will appear when thresholds are met</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};