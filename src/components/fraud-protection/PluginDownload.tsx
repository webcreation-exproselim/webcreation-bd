import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2, Package, CheckCircle2, ArrowRight, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { downloadPluginFile } from "@/utils/pluginGenerator";

interface PluginDownloadProps {
  apiKey: string;
}

export function PluginDownload({ apiKey }: PluginDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadPluginFile(apiKey);
      setDownloaded(true);
      toast({
        title: "ডাউনলোড সম্পন্ন! ✅",
        description: "প্লাগইন ZIP ফাইল ডাউনলোড হয়েছে",
      });
      
      setTimeout(() => setDownloaded(false), 5000);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "ডাউনলোড ব্যর্থ",
        description: "প্লাগইন ডাউনলোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Notice Banner */}
      <Card className="border-green-500/50 bg-gradient-to-r from-green-950/50 to-emerald-950/50 overflow-hidden">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20 animate-pulse">
                <Sparkles className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-400">🆕 নতুন Version 3.2 আপডেট!</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Clean Popup
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Popup থেকে logo এবং branding সরিয়ে দেওয়া হয়েছে। আরো clean এবং professional look।
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <RefreshCw className="h-3 w-3" />
              পুরোনো plugin থাকলে আপডেট করুন
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Card */}
      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl text-white">WCBD Fraud Guard Plugin</CardTitle>
                <Badge className="bg-gradient-to-r from-cyan-500 to-green-500 text-white border-0 text-xs">
                  v3.2
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs animate-pulse">
                  NEW
                </Badge>
              </div>
              <CardDescription>
                আপনার API Key সহ রেডি plugin ডাউনলোড করুন
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* What's New Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
            <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              v3.2 এ নতুন কী আছে?
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>🎨 <strong>Clean Popup</strong> - Logo এবং branding ছাড়া সুন্দর popup</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>🔒 <strong>Domain Binding</strong> - API key শুধু আপনার domain-এ কাজ করবে</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>⚡ <strong>Fixed Popup Issues</strong> - Popup আর ভাঙ্গবে না</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "WooCommerce চেকআউট ইন্টিগ্রেশন",
              "সুন্দর পপআপ নোটিফিকেশন",
              "Device Fingerprinting",
              "বাংলা/English ভাষা সাপোর্ট",
              "Admin Settings প্যানেল",
              "API Key প্রি-কনফিগার্ড",
              "⏱️ Popup Timer Control",
              "💬 Custom Block Messages",
              "📞 WhatsApp/Phone Contact",
              "🎨 Circle Logo + Branding",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-700/50">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="lg"
              className={`w-full sm:w-auto text-lg px-8 py-6 transition-all duration-300 ${
                downloaded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25"
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ডাউনলোড হচ্ছে...
                </>
              ) : downloaded ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  ডাউনলোড সম্পন্ন!
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Plugin ডাউনলোড করুন
                </>
              )}
            </Button>
            <span className="text-sm text-slate-400">
              wcbd-fraud-guard.zip (~15KB) • v3.2 (Clean Popup)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            📚 ইন্সটলেশন গাইড
          </CardTitle>
          <CardDescription>
            ধাপে ধাপে WordPress-এ plugin ইন্সটল করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              1
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Plugin ডাউনলোড করুন</h4>
              <p className="text-sm text-muted-foreground">
                উপরের "Plugin ডাউনলোড করুন" বাটনে ক্লিক করে PHP ফাইল ডাউনলোড করুন। 
                আপনার API Key অটোমেটিক plugin-এ ইনজেক্ট করা থাকবে।
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-slate-600 rotate-90" />
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              2
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">WordPress-এ আপলোড করুন</h4>
              <p className="text-sm text-muted-foreground">
                ফাইলটি আপনার WordPress সাইটের <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400">/wp-content/plugins/</code> ফোল্ডারে আপলোড করুন।
              </p>
              <p className="text-sm text-muted-foreground">
                অথবা FTP/File Manager ব্যবহার করে আপলোড করুন।
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-slate-600 rotate-90" />
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              3
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Plugin একটিভ করুন</h4>
              <p className="text-sm text-muted-foreground">
                WordPress Dashboard → Plugins → "WCBD Fraud Guard" → Activate
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-slate-600 rotate-90" />
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">সেটআপ সম্পন্ন!</h4>
              <p className="text-sm text-muted-foreground">
                Plugin এখন কাজ করবে। WooCommerce Checkout-এ অটোমেটিক Fraud Protection একটিভ হয়ে যাবে।
              </p>
              <p className="text-sm text-muted-foreground">
                <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400">Dashboard → Fraud Guard</code>
                {" "}থেকে সেটিংস পরিবর্তন করতে পারবেন।
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center gap-2">
            ⚠️ প্রয়োজনীয়তা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h5 className="font-semibold text-white mb-1">WordPress</h5>
              <p className="text-sm text-slate-400">Version 5.0+</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h5 className="font-semibold text-white mb-1">WooCommerce</h5>
              <p className="text-sm text-slate-400">Version 4.0+</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h5 className="font-semibold text-white mb-1">PHP</h5>
              <p className="text-sm text-slate-400">Version 7.4+</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-slate-700/50 bg-slate-800/30">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white">সাহায্য দরকার?</h4>
              <p className="text-sm text-muted-foreground">
                ইন্সটলেশনে সমস্যা হলে আমাদের সাথে যোগাযোগ করুন
              </p>
            </div>
            <Button variant="outline" className="border-slate-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              সাপোর্ট
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
