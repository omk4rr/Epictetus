import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface BacktestData {
  equityCurve: Array<{ date: string; value: number }>;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
  };
}

interface BacktestSnapshotProps {
  data: BacktestData;
  onViewDetails: () => void;
}

export const BacktestSnapshot = ({ data, onViewDetails }: BacktestSnapshotProps) => {
  const { equityCurve, metrics } = data;
  const isPositive = metrics.totalReturn > 0;

  return (
    <Card className="bg-card border-card-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Backtest Performance
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewDetails} className="h-6 text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equity Curve */}
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <XAxis hide />
              <YAxis hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "hsl(var(--bullish))" : "hsl(var(--bearish))"} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className={`text-lg font-bold font-mono ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
              {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Total Return</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold font-mono">
              {metrics.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-mono text-bearish">
              {metrics.maxDrawdown.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Max DD</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-mono">
              {metrics.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center">
          <Badge 
            className={`sentiment-badge ${isPositive ? 'sentiment-positive' : 'sentiment-negative'}`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {isPositive ? 'Profitable' : 'Underperforming'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};