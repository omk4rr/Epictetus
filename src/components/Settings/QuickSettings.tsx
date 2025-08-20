import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface QuickSettingsProps {
  settings: {
    finbertWeight: number;
    llmWeight: number;
    lexiconWeight: number;
    zScoreThreshold: number;
    timeWindow: string;
    alertsEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const QuickSettings = ({ settings, onSettingsChange }: QuickSettingsProps) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-card border-card-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ensemble Weights */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">
            Ensemble Weights
          </Label>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">FinBERT</span>
                <span className="text-xs font-mono">{settings.finbertWeight}</span>
              </div>
              <Slider
                value={[settings.finbertWeight]}
                onValueChange={([value]) => updateSetting('finbertWeight', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">LLM</span>
                <span className="text-xs font-mono">{settings.llmWeight}</span>
              </div>
              <Slider
                value={[settings.llmWeight]}
                onValueChange={([value]) => updateSetting('llmWeight', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Lexicon</span>
                <span className="text-xs font-mono">{settings.lexiconWeight}</span>
              </div>
              <Slider
                value={[settings.lexiconWeight]}
                onValueChange={([value]) => updateSetting('lexiconWeight', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Z-Score Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-muted-foreground">
              Z-Score Threshold
            </Label>
            <span className="text-xs font-mono">{settings.zScoreThreshold}</span>
          </div>
          <Slider
            value={[settings.zScoreThreshold]}
            onValueChange={([value]) => updateSetting('zScoreThreshold', value)}
            max={3}
            min={1}
            step={0.1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Time Window */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Time Window
          </Label>
          <Select value={settings.timeWindow} onValueChange={(value) => updateSetting('timeWindow', value)}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Alerts Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Alerts Enabled
          </Label>
          <Switch
            checked={settings.alertsEnabled}
            onCheckedChange={(checked) => updateSetting('alertsEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};