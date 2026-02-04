import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, Globe, Key, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FraudSettingsProps {
  merchant: {
    api_key: string;
    website_url: string | null;
    cooldown_period_days: number;
  } | null;
  onUpdateCooldown: (days: number) => void;
  onUpdateWebsite: (url: string) => void;
  onRegenerateApiKey: () => void;
}

export function FraudSettings({ merchant, onUpdateCooldown, onUpdateWebsite, onRegenerateApiKey }: FraudSettingsProps) {
  const [websiteUrl, setWebsiteUrl] = useState(merchant?.website_url || "");
  const [cooldown, setCooldown] = useState(merchant?.cooldown_period_days || 30);
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

  const handleCooldownChange = (value: number[]) => {
    setCooldown(value[0]);
  };

  const handleCooldownCommit = () => {
    onUpdateCooldown(cooldown);
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

      {/* Cooldown Period Card */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Clock className="h-5 w-5" />
            Cooldown Period
          </CardTitle>
          <CardDescription>
            Days before the same customer can place another order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Current: {cooldown} days</Label>
              <span className="text-3xl font-bold text-cyan-400">{cooldown}</span>
            </div>
            <Slider
              value={[cooldown]}
              onValueChange={handleCooldownChange}
              onValueCommit={handleCooldownCommit}
              min={1}
              max={90}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 day</span>
              <span>90 days</span>
            </div>
          </div>
          <Button onClick={handleCooldownCommit} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Update Cooldown Period
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
