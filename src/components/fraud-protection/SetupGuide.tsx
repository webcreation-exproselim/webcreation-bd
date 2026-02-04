import { useState } from "react";
import { Download, Upload, Settings, Key, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APIKeySection } from "./APIKeySection";
import { downloadPluginFile } from "@/utils/pluginGenerator";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SetupGuideProps {
  apiKey: string;
  isActive: boolean;
  onPurchase: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Plugin ডাউনলোড করুন",
    description: "নিচের Download বাটনে ক্লিক করে wcbd-fraud-guard.php ফাইল ডাউনলোড করুন।",
    icon: <Download className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "WordPress-এ আপলোড করুন",
    description: "WordPress Admin → Plugins → Add New → Upload Plugin → Choose File → wcbd-fraud-guard.php সিলেক্ট করুন → Install Now ক্লিক করুন।",
    icon: <Upload className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Plugin Activate করুন",
    description: "Install হওয়ার পর 'Activate Plugin' বাটনে ক্লিক করুন। Left sidebar-এ 'Fraud Guard' মেনু দেখতে পাবেন।",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "API Key সেট করুন",
    description: "Fraud Guard → Settings → API Key field-এ আপনার API Key paste করুন → Save Settings ক্লিক করুন।",
    icon: <Key className="w-5 h-5" />,
  },
];

export function SetupGuide({ apiKey, isActive, onPurchase }: SetupGuideProps) {
  const [openSteps, setOpenSteps] = useState<number[]>([1]);
  const { toast } = useToast();

  const toggleStep = (stepId: number) => {
    setOpenSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleDownload = () => {
    // Download with placeholder if inactive, real key if active
    const keyToUse = isActive ? apiKey : "YOUR_API_KEY_HERE";
    downloadPluginFile(keyToUse);

    if (!isActive) {
      toast({
        title: "⚠️ Plugin ডাউনলোড হয়েছে",
        description: "Plugin কাজ করতে Plan কিনে API Key সেট করুন",
      });
    } else {
      toast({
        title: "✅ Plugin ডাউনলোড হয়েছে",
        description: "আপনার API Key সহ Plugin ready",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Plugin Download Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 font-bengali mb-1">
              WCBD Fraud Guard Plugin v3.0
            </h3>
            <p className="text-sm text-gray-600 font-bengali mb-4">
              WordPress/WooCommerce-এর জন্য Anti-Fraud Protection Plugin - Timer, Custom Messages, Contact Info সহ
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 rounded-xl shadow-lg shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                <span className="font-bengali">Plugin ডাউনলোড করুন</span>
              </Button>
            </div>

            {!isActive && (
              <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 font-bengali">
                  Plugin কাজ করতে Plan কিনতে হবে এবং API Key সেট করতে হবে
                </p>
              </div>
            )}

            {isActive && (
              <div className="flex items-start gap-2 mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 font-bengali">
                  আপনার Plan সক্রিয়! Plugin-এ API Key সেট করে ব্যবহার শুরু করুন
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <APIKeySection apiKey={apiKey} isActive={isActive} onPurchase={onPurchase} />

      {/* Step-by-Step Guide */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 font-bengali">📚 ইন্সটলেশন গাইড</h3>
          <p className="text-sm text-gray-500 font-bengali">ধাপে ধাপে Plugin সেটআপ করুন</p>
        </div>

        <div className="divide-y divide-gray-100">
          {steps.map((step) => (
            <Collapsible
              key={step.id}
              open={openSteps.includes(step.id)}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    openSteps.includes(step.id)
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 font-bengali">
                    Step {step.id}: {step.title}
                  </p>
                </div>
                {openSteps.includes(step.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-4">
                <div className="ml-14 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-bengali leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
