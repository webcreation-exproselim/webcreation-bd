import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Globe, Key, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FraudSettingsProps {
  merchant: {
    api_key: string;
    website_url: string | null;
    cooldown_period_minutes: number;
  } | null;
  onUpdateCooldownMinutes: (minutes: number) => void;
  onUpdateWebsite: (url: string) => void;
  onRegenerateApiKey: () => void;
}

const PRESETS = [
  { label: "5m", value: 5 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "6h", value: 360 },
  { label: "1d", value: 1440 },
  { label: "7d", value: 10080 },
  { label: "30d", value: 43200 },
];

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} মিনিট`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} ঘন্টা`;
  return `${Math.round(minutes / 1440)} দিন`;
};

export function FraudSettings({ merchant, onUpdateCooldownMinutes, onUpdateWebsite, onRegenerateApiKey }: FraudSettingsProps) {
  const [websiteUrl, setWebsiteUrl] = useState(merchant?.website_url || "");
  const [cooldownMinutes, setCooldownMinutes] = useState(merchant?.cooldown_period_minutes || 1440);
  const [customMinutes, setCustomMinutes] = useState(String(merchant?.cooldown_period_minutes || 1440));
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyApiKey = () => {
    if (merchant?.api_key) {
      navigator.clipboard.writeText(merchant.api_key);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePresetClick = (value: number) => {
    setCooldownMinutes(value);
    setCustomMinutes(String(value));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomMinutes(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCooldownMinutes(numValue);
    }
  };

  const handleCooldownSave = () => {
    onUpdateCooldownMinutes(cooldownMinutes);
  };

  const handleWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWebsite(websiteUrl);
  };

  if (!merchant) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* API Key Card */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Key className="h-5 w-5" />
            API Key
          </CardTitle>
          <CardDescription>
            Use this key to authenticate requests from your WooCommerce store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={merchant.api_key}
              readOnly
              className="font-mono text-sm bg-slate-800/50 border-slate-600"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyApiKey}
              className="shrink-0 border-cyan-500/30 hover:bg-cyan-500/10"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={onRegenerateApiKey}
            className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate API Key
          </Button>
          <p className="text-xs text-muted-foreground">
            ⚠️ Regenerating will invalidate the old key. Update your WordPress integration afterwards.
          </p>
        </CardContent>
      </Card>

      {/* Website URL Card */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Globe className="h-5 w-5" />
            Website URL
          </CardTitle>
          <CardDescription>
            Your WooCommerce store URL (for reference)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWebsiteSubmit} className="flex gap-2">
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourstore.com"
              className="bg-slate-800/50 border-slate-600"
            />
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cooldown Period Card - Minutes Based */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Clock className="h-5 w-5" />
            Cooldown Period
          </CardTitle>
          <CardDescription>
            Time before the same customer can place another order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Select Presets */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Quick Select:</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={cooldownMinutes === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                  className={cooldownMinutes === preset.value 
                    ? "bg-cyan-600 hover:bg-cyan-700" 
                    : "border-slate-600 hover:bg-slate-700"
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Or enter custom:</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="129600"
                value={customMinutes}
                onChange={handleCustomChange}
                className="w-32 bg-slate-800/50 border-slate-600"
              />
              <span className="text-muted-foreground">minutes</span>
              <span className="text-cyan-400 font-medium">= {formatMinutes(cooldownMinutes)}</span>
            </div>
          </div>

          {/* Current Display */}
          <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Current Cooldown:</span>
            <span className="text-2xl font-bold text-cyan-400">{formatMinutes(cooldownMinutes)}</span>
          </div>

          <Button onClick={handleCooldownSave} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Update Cooldown Period
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}