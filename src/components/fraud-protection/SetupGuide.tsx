import { useState } from "react";
import { Download, Upload, Settings, Key, Check, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APIKeySection } from "./APIKeySection";
import { downloadPluginFile } from "@/utils/pluginGenerator";
import { useToast } from "@/hooks/use-toast";
import { PLUGIN_CONFIG, getVersionString } from "@/config/pluginConfig";

interface SetupGuideProps {
  apiKey: string;
  isActive: boolean;
  merchantId?: string;
  onPurchaseSuccess?: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  tip?: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Plan কিনুন ও Plugin ডাউনলোড করুন",
    description: "প্রথমে একটি Subscription Plan কিনুন (Monthly/Yearly)। Admin আপনার Plan approve করার পর উপরে নীল 'Plugin ডাউনলোড করুন' বাটনে ক্লিক করুন। আপনার নিজস্ব API Key এবং Domain সহ একটি wcbd-fraud-guard.zip ফাইল automatically generate হয়ে download হবে।",
    icon: <Download className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-500",
    tip: "💡 ZIP ফাইলটি unzip করবেন না — WordPress এ সরাসরি .zip আকারে আপলোড করতে হবে। প্রতিটি Domain এর জন্য আলাদা Plan ও আলাদা Plugin ডাউনলোড করতে হবে।",
  },
  {
    id: 2,
    title: "WordPress এ Plugin Install করুন",
    description: "আপনার WordPress Admin Dashboard এ লগইন করুন → বাম পাশের menu থেকে 'Plugins' → 'Add New Plugin' এ ক্লিক করুন → উপরে 'Upload Plugin' বাটনে ক্লিক করুন → 'Choose File' দিয়ে download করা wcbd-fraud-guard.zip ফাইলটি সিলেক্ট করুন → 'Install Now' বাটনে ক্লিক করুন।",
    icon: <Upload className="w-5 h-5" />,
    gradient: "from-purple-500 to-pink-500",
    tip: "⚠️ যদি আগে থেকে পুরোনো version install করা থাকে: প্রথমে সেটি Deactivate করুন → Delete করুন → তারপর নতুন ZIP আপলোড করুন। একই plugin দুইবার install হবে না।",
  },
  {
    id: 3,
    title: "Plugin Activate করুন",
    description: "Install শেষ হলে 'Activate Plugin' বাটনে ক্লিক করুন। Activate হওয়ার সাথে সাথে WordPress Admin এর বাম sidebar এ 'WCBD Fraud Guard' নামে নতুন একটি menu চলে আসবে। সেখানে ক্লিক করে Settings page এ যান।",
    icon: <Settings className="w-5 h-5" />,
    gradient: "from-amber-500 to-orange-500",
    tip: "🔒 আপনার API Key ও Domain plugin এর ভিতরে আগে থেকেই embed করা আছে — manually কিছু paste করতে হবে না।",
  },
  {
    id: 4,
    title: "Connection Test করুন ও Protection চালু করুন",
    description: "WCBD Fraud Guard → Settings পেজে গিয়ে 'Test Connection' বাটনে ক্লিক করুন। সফল হলে সবুজ '✅ Connected' message দেখাবে। তারপর 'Enable Fraud Protection' toggle চালু করুন এবং Save করুন। ব্যাস — আপনার Checkout পেজ এখন থেকে fraud order থেকে protected!",
    icon: <Key className="w-5 h-5" />,
    gradient: "from-emerald-500 to-green-500",
    tip: "✅ Test order দিয়ে check করুন: একই phone number দিয়ে দ্রুত ২ বার order করার চেষ্টা করুন — দ্বিতীয়বার block হবে। Logs এই Dashboard এ real-time দেখতে পাবেন।",
  },
];

export function SetupGuide({ apiKey, isActive, merchantId, onPurchaseSuccess }: SetupGuideProps) {
  const [activeStep, setActiveStep] = useState(1);
  const { toast } = useToast();

  const handleDownload = async () => {
    const keyToUse = isActive ? apiKey : "YOUR_API_KEY_HERE";
    await downloadPluginFile(keyToUse);

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
      {/* Plugin Download Card - Vibrant */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-blue-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white font-bengali">
                  {PLUGIN_CONFIG.name} Plugin
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                  {getVersionString()}
                </span>
              </div>
              <p className="text-sm text-white/70 font-bengali mb-4">
                Anti-Fraud Protection — {PLUGIN_CONFIG.versionHighlight} সহ
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-white hover:bg-gray-50 text-blue-700 font-bold gap-2 rounded-xl shadow-lg shadow-black/20"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-bengali">Plugin ডাউনলোড করুন</span>
                </Button>
              </div>

              {!isActive && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-400/30">
                  <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-100 font-bengali">
                    Plugin কাজ করতে Plan কিনতে হবে এবং API Key সেট করতে হবে
                  </p>
                </div>
              )}

              {isActive && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-emerald-500/20 backdrop-blur-sm rounded-xl border border-emerald-400/30">
                  <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-100 font-bengali">
                    আপনার Plan সক্রিয়! Plugin-এ API Key automatically সেট হবে
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Key Section */}
      <APIKeySection apiKey={apiKey} isActive={isActive} merchantId={merchantId} onPurchaseSuccess={onPurchaseSuccess} />

      {/* Step-by-Step Guide - Interactive Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-bengali">ইন্সটলেশন গাইড</h3>
              <p className="text-sm text-gray-500 font-bengali">মাত্র ৪ ধাপে সেটআপ সম্পন্ন করুন</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 mb-1">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center gap-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  activeStep >= step.id 
                    ? `bg-gradient-to-r ${step.gradient}` 
                    : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right font-bengali">ধাপ {activeStep} / {steps.length}</p>
        </div>

        {/* Steps */}
        <div className="p-4 space-y-3">
          {steps.map((step) => (
            <motion.button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`w-full text-left rounded-xl p-4 transition-all duration-300 border-2 ${
                activeStep === step.id
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md shadow-blue-100/50'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
              layout
            >
              <div className="flex items-start gap-4">
                {/* Step Number Circle */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  activeStep === step.id
                    ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                    : activeStep > step.id
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {activeStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeStep === step.id
                        ? `bg-gradient-to-r ${step.gradient} text-white`
                        : activeStep > step.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {activeStep > step.id ? '✓' : `Step ${step.id}`}
                    </span>
                  </div>
                  <p className={`font-semibold font-bengali transition-colors ${
                    activeStep === step.id ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {activeStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-gray-500 font-bengali mt-2 leading-relaxed">
                          {step.description}
                        </p>
                        {step.tip && (
                          <div className="mt-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-600 font-bengali">
                            {step.tip}
                          </div>
                        )}
                        {step.id < steps.length && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStep(step.id + 1);
                            }}
                            size="sm"
                            className={`mt-3 bg-gradient-to-r ${step.gradient} hover:opacity-90 text-white rounded-lg gap-1 text-xs`}
                          >
                            পরবর্তী ধাপ
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
