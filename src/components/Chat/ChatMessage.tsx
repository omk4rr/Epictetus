import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChatMessage as ChatMessageType } from "@/pages/AIChat";
import { User, Bot, TrendingUp, TrendingDown, Minus, Eye, Save, Bell, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  onViewEvidence: (evidence: any[]) => void;
}

const actionIcons = {
  buy: TrendingUp,
  long: TrendingUp,
  short: TrendingDown,
  hold: Minus,
};

const actionColors = {
  buy: "text-bullish",
  long: "text-bullish", 
  short: "text-bearish",
  hold: "text-neutral",
};

export const ChatMessage = ({ message, onViewEvidence }: ChatMessageProps) => {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!message.response) {
    return (
      <div className="flex justify-start">
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  const { response } = message;

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 w-full">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        
        <div className="flex-1 space-y-4">
          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">{response.summary}</p>
              
              {response.global_confidence < 0.5 && (
                <div className="mt-3 p-2 bg-warning/10 border border-warning rounded-lg">
                  <p className="text-sm text-warning font-medium">
                    Low confidence — results are exploratory.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {response.recommendations.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Trade Ideas</h4>
                <div className="space-y-3">
                  {response.recommendations.map((rec, index) => {
                    const ActionIcon = actionIcons[rec.action];
                    const actionColor = actionColors[rec.action];
                    
                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{rec.ticker}</span>
                            <Badge className={`sentiment-badge sentiment-${rec.action === 'buy' || rec.action === 'long' ? 'bullish' : rec.action === 'short' ? 'bearish' : 'neutral'}`}>
                              <ActionIcon className={`w-3 h-3 mr-1 ${actionColor}`} />
                              {rec.action.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>Score: {(rec.score * 100).toFixed(0)}%</span>
                            <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewEvidence(rec.drivers)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View Evidence ({rec.drivers.length})
                          </Button>
                          
                          {rec.drivers.some(d => !d.verified) && (
                            <Badge variant="destructive" className="text-xs">
                              <ShieldX className="w-3 h-3 mr-1" />
                              UNVERIFIED
                            </Badge>
                          )}
                          
                          {rec.drivers.some(d => d.verified) && (
                            <Badge variant="secondary" className="text-xs">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              VERIFIED
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explainability */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Analysis Breakdown</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Global Confidence</span>
                    <span>{(response.global_confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={response.global_confidence * 100} className="h-2" />
                </div>

                <Separator />

                <div>
                  <h5 className="text-sm font-medium mb-2">Ensemble Weights</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>FinBERT</span>
                      <span>{(response.explainability.ensemble.finbert * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>LLM</span>
                      <span>{(response.explainability.ensemble.llm * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lexicon</span>
                      <span>{(response.explainability.ensemble.lexicon * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {response.explainability.top_contributing_sentences.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="text-sm font-medium mb-2">Top Contributing Sentences</h5>
                      <div className="space-y-2">
                        {response.explainability.top_contributing_sentences.slice(0, 3).map((sentence, index) => (
                          <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">#{index + 1}</span>
                              <span className="font-mono">{(sentence.score * 100).toFixed(0)}%</span>
                            </div>
                            <p>{sentence.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="w-3 h-3 mr-1" />
              Save Analysis
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-3 h-3 mr-1" />
              Subscribe to Alerts
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
            {response.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};