import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Evidence } from "@/pages/AIChat";
import { ExternalLink, ShieldCheck, ShieldX, Calendar, Globe } from "lucide-react";

interface EvidenceModalProps {
  evidence: Evidence[] | null;
  isOpen: boolean;
  onClose: () => void;
}

const getSourceIcon = (source: string) => {
  switch (source.toLowerCase()) {
    case "twitter":
    case "x":
      return "𝕏";
    case "reddit":
      return "🔴";
    case "youtube":
      return "📺";
    case "gdelt":
    case "news":
      return "📰";
    case "sec":
      return "🏛️";
    default:
      return "🌐";
  }
};

const getTrustColor = (trust: number) => {
  if (trust >= 0.8) return "text-bullish";
  if (trust >= 0.6) return "text-warning";
  return "text-bearish";
};

const getTrustLabel = (trust: number) => {
  if (trust >= 0.8) return "High Trust";
  if (trust >= 0.6) return "Medium Trust";
  return "Low Trust";
};

export const EvidenceModal = ({ evidence, isOpen, onClose }: EvidenceModalProps) => {
  if (!evidence) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Supporting Evidence ({evidence.length} items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {evidence.map((item, index) => (
            <div key={item.doc_id || index} className="border rounded-lg p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSourceIcon(item.source)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.source}</span>
                      {item.verified ? (
                        <Badge variant="secondary" className="text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          VERIFIED
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldX className="w-3 h-3 mr-1" />
                          UNVERIFIED
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                      <span className={`flex items-center gap-1 ${getTrustColor(item.source_trust)}`}>
                        <Globe className="w-3 h-3" />
                        {getTrustLabel(item.source_trust)} ({(item.source_trust * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(item.url, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Source
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm leading-relaxed">{item.summary}</p>
                
                {!item.verified && (
                  <div className="p-2 bg-warning/10 border border-warning rounded text-xs">
                    <strong>UNVERIFIED:</strong> This claim is from social sources and could not be confirmed via official filings.
                  </div>
                )}
              </div>

              {index < evidence.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          {/* Footer */}
          <div className="p-3 bg-muted/30 rounded text-xs text-muted-foreground">
            <strong>Evidence Policy:</strong> Only information from official filings, exchange disclosures, 
            or verified mainstream outlets are marked as VERIFIED. Social media claims remain UNVERIFIED 
            until confirmed through official channels.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};