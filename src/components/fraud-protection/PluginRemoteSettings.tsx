import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Loader2, Globe } from "lucide-react";

interface MerchantSettings {
  popup_timer_seconds: number;
  popup_language: string;
  msg_cooldown: string;
  msg_blacklist: string;
  whatsapp_number: string;
  phone_number: string;
  show_contact_buttons: boolean;
}

interface PluginRemoteSettingsProps {
  merchantId: string;
  initialSettings?: Partial<MerchantSettings>;
}

export function PluginRemoteSettings({ merchantId, initialSettings }: PluginRemoteSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<MerchantSettings>({
    popup_timer_seconds: initialSettings?.popup_timer_seconds ?? 30,
    popup_language: initialSettings?.popup_language ?? 'bn',
    msg_cooldown: initialSettings?.msg_cooldown ?? 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।',
    msg_blacklist: initialSettings?.msg_blacklist ?? 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।',
    whatsapp_number: initialSettings?.whatsapp_number ?? '',
    phone_number: initialSettings?.phone_number ?? '',
    show_contact_buttons: initialSettings?.show_contact_buttons ?? true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          popup_timer_seconds: settings.popup_timer_seconds,
          popup_language: settings.popup_language,
          msg_cooldown: settings.msg_cooldown,
          msg_blacklist: settings.msg_blacklist,
          whatsapp_number: settings.whatsapp_number,
          phone_number: settings.phone_number,
          show_contact_buttons: settings.show_contact_buttons,
          updated_at: new Date().toISOString()
        })
        .eq('id', merchantId);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "Plugin settings সেভ হয়েছে। পরবর্তী API call এ apply হবে।"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Settings সেভ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-400" />
          Plugin Remote Settings
        </CardTitle>
        <p className="text-sm text-slate-400">
          এই settings গুলো সব connected WordPress sites এ automatic apply হবে
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language & Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Language</Label>
            <Select
              value={settings.popup_language}
              onValueChange={(value) => setSettings({ ...settings, popup_language: value })}
            >
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Popup Auto-close Timer (seconds)</Label>
            <Input
              type="number"
              min="0"
              max="300"
              value={settings.popup_timer_seconds}
              onChange={(e) => setSettings({ ...settings, popup_timer_seconds: parseInt(e.target.value) || 0 })}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">0 দিলে auto-close বন্ধ থাকবে</p>
          </div>
        </div>

        {/* Custom Messages */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Cooldown Message</Label>
            <Textarea
              value={settings.msg_cooldown}
              onChange={(e) => setSettings({ ...settings, msg_cooldown: e.target.value })}
              className="bg-slate-900 border-slate-600 text-white min-h-[80px]"
              placeholder="Customer কে cooldown period এ দেখানো হবে"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Blacklist Message</Label>
            <Textarea
              value={settings.msg_blacklist}
              onChange={(e) => setSettings({ ...settings, msg_blacklist: e.target.value })}
              className="bg-slate-900 border-slate-600 text-white min-h-[80px]"
              placeholder="Blacklisted customer কে দেখানো হবে"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Show Contact Buttons</Label>
              <p className="text-xs text-slate-400">Popup এ WhatsApp/Phone বাটন দেখাবে</p>
            </div>
            <Switch
              checked={settings.show_contact_buttons}
              onCheckedChange={(checked) => setSettings({ ...settings, show_contact_buttons: checked })}
            />
          </div>

          {settings.show_contact_buttons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">WhatsApp Number</Label>
                <Input
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Phone Number</Label>
                <Input
                  value={settings.phone_number}
                  onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Remote Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
