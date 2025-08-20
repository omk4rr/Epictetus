import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

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

interface ExplainSignalModalProps {
  signal: Signal | null;
  isOpen: boolean;
  onClose: () => void;
}

const signalIcons = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
};

const mockExplanation = {
  summary: "Strong bullish signal detected based on positive earnings momentum, institutional buying patterns, and favorable sentiment across multiple sources.",
  eventType: "earnings_momentum",
  topSentences: [
    "Apple Inc. exceeded analyst expectations with robust iPhone sales in Q4, driven by strong demand for the iPhone 15 series.",
    "Institutional investors have increased their positions by 15% over the past week according to SEC filings.",
    "Social sentiment analysis shows 78% positive mentions across Twitter, Reddit, and financial news sources."
  ],
  ensembleScores: {
    finbert: 0.82,
    llm: 0.89,
    lexicon: 0.74
  },
  sourceTrust: {
    highTrust: 8,
    mediumTrust: 3,
    lowTrust: 1
  },
  evidenceLinks: [
    { title: "Apple Q4 Earnings Beat", url: "https://example.com/1", source: "Reuters" },
    { title: "Institutional Buying Activity", url: "https://example.com/2", source: "SEC Filings" },
    { title: "Analyst Upgrade to Buy", url: "https://example.com/3", source: "Goldman Sachs" }
  ]
};

export const ExplainSignalModal = ({ signal, isOpen, onClose }: ExplainSignalModalProps) => {
  if (!signal) return null;

  const SignalIcon = signalIcons[signal.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SignalIcon className={`w-5 h-5 ${
              signal.type === 'bullish' ? 'text-bullish' : 
              signal.type === 'bearish' ? 'text-bearish' : 'text-neutral'
            }`} />
            <span>Signal Explanation - {signal.ticker}</span>
            <Badge className={`sentiment-badge sentiment-${signal.type}`}>
              {signal.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Analysis Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">LLM Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mockExplanation.summary}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Ensemble Scores</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">FinBERT</span>
                    <span className="text-sm font-mono">{mockExplanation.ensembleScores.finbert}</span>
                  </div>
                  <Progress value={mockExplanation.ensembleScores.finbert * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">LLM Score</span>
                    <span className="text-sm font-mono">{mockExplanation.ensembleScores.llm}</span>
                  </div>
                  <Progress value={mockExplanation.ensembleScores.llm * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Lexicon</span>
                    <span className="text-sm font-mono">{mockExplanation.ensembleScores.lexicon}</span>
                  </div>
                  <Progress value={mockExplanation.ensembleScores.lexicon * 100} className="h-2" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Source Trust Breakdown</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-trust-high/20">
                  <div className="font-mono text-sm">{mockExplanation.sourceTrust.highTrust}</div>
                  <div className="text-xs text-muted-foreground">High Trust</div>
                </div>
                <div className="p-2 rounded bg-trust-medium/20">
                  <div className="font-mono text-sm">{mockExplanation.sourceTrust.mediumTrust}</div>
                  <div className="text-xs text-muted-foreground">Medium Trust</div>
                </div>
                <div className="p-2 rounded bg-trust-low/20">
                  <div className="font-mono text-sm">{mockExplanation.sourceTrust.lowTrust}</div>
                  <div className="text-xs text-muted-foreground">Low Trust</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Evidence & Key Sentences */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Top Contributing Sentences</h3>
              <div className="space-y-2">
                {mockExplanation.topSentences.map((sentence, index) => (
                  <div key={index} className="p-3 rounded bg-muted/30 text-sm">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <p className="mt-1">{sentence}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Evidence Sources</h3>
              <div className="space-y-2">
                {mockExplanation.evidenceLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{link.title}</p>
                      <p className="text-xs text-muted-foreground">{link.source}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded bg-muted/30 text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This analysis is for research purposes only and does not constitute financial advice. 
              Always conduct your own research before making investment decisions.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};