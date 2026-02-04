import { useState } from "react";
import { Lock, Copy, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface APIKeySectionProps {
  apiKey: string;
  isActive: boolean;
  onPurchase: () => void;
}

export function APIKeySection({ apiKey, isActive, onPurchase }: APIKeySectionProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: "✅ API Key কপি হয়েছে",
        description: "Plugin settings-এ paste করুন",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "কপি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  if (!isActive) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
        {/* Locked Overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-700 font-medium font-bengali mb-4">
              API Key পেতে Plan কিনুন
            </p>
            <Button
              onClick={onPurchase}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 rounded-xl shadow-lg shadow-blue-500/25"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-bengali">Plan কিনুন</span>
            </Button>
          </div>
        </div>

        {/* Blurred Content Behind */}
        <div className="select-none pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-bengali">আপনার API Key</p>
              <p className="text-xs text-gray-300">Plugin-এ ব্যবহার করুন</p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-xl p-4 font-mono text-gray-400 text-sm blur-sm">
            xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-700 font-bengali">আপনার API Key</p>
          <p className="text-xs text-emerald-600">Plugin settings-এ এই key ব্যবহার করুন</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white rounded-xl border border-emerald-200 p-4 font-mono text-sm text-gray-800 overflow-x-auto">
          {apiKey}
        </div>
        <Button
          onClick={copyToClipboard}
          size="icon"
          className={`rounded-xl h-12 w-12 transition-all ${
            copied
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          } text-white shadow-lg`}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </Button>
      </div>

      <p className="text-xs text-emerald-600 mt-3 font-bengali">
        💡 Tip: WordPress Admin → Fraud Guard → API Key field-এ paste করুন
      </p>
    </div>
  );
}
