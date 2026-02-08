import { useState } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

import pathaoLogo from "@/assets/courier-logos/pathao.png";
import steadfastLogo from "@/assets/courier-logos/steadfast.png";
import carrybeeLogo from "@/assets/courier-logos/carrybee.png";
import redxLogo from "@/assets/courier-logos/redx.svg";

const COURIER_LOGOS: Record<string, string> = {
  pathao: pathaoLogo,
  steadfast: steadfastLogo,
  carrybee: carrybeeLogo,
  redx: redxLogo,
  "red x": redxLogo,
  "carry bee": carrybeeLogo,
};

interface CourierData {
  name: string;
  orders: number;
  delivered: number;
  returned: number;
  rate: number;
}

interface CheckResult {
  phone: string;
  success_rate: number;
  total_orders: number;
  total_delivered: number;
  total_returned: number;
  risk_label: string;
  risk_message: string;
  couriers: CourierData[];
}

interface CourierCheckerDashboardProps {
  apiKey: string;
}

const ALLOWED_COURIERS = ["pathao", "steadfast", "carrybee", "carry bee", "redx", "red x", "redx logistics", "red x logistics"];

// Always show these 4 couriers in results, even if data is 0
const DEFAULT_COURIERS: { name: string; logoKey: string }[] = [
  { name: "Pathao", logoKey: "pathao" },
  { name: "Steadfast", logoKey: "steadfast" },
  { name: "CarryBee", logoKey: "carrybee" },
  { name: "RedX", logoKey: "redx" },
];

const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trusted: { bg: "bg-emerald-500", text: "text-white", label: "✅ বিশ্বস্ত কাস্টমার" },
  moderate: { bg: "bg-amber-500", text: "text-white", label: "⚠️ মাঝারি ঝুঁকি" },
  risky: { bg: "bg-red-500", text: "text-white", label: "🚫 উচ্চ ঝুঁকি" },
  new_customer: { bg: "bg-blue-500", text: "text-white", label: "🆕 নতুন কাস্টমার" },
};

export function CourierCheckerDashboard({ apiKey }: CourierCheckerDashboardProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async (searchPhone?: string) => {
    const target = searchPhone || phone;
    let cleanPhone = target.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }
    if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '0' + cleanPhone;
    }
    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      toast({
        title: "ভুল নম্বর",
        description: "সঠিক বাংলাদেশী ফোন নম্বর দিন (01XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-courier-check', {
        body: { phone: cleanPhone, api_key: apiKey },
      });

      if (error) throw error;

      if (data?.success) {
        setResult(data.data);
      } else {
        toast({
          title: "সমস্যা হয়েছে",
          description: data?.error || "ডেটা পাওয়া যায়নি",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Courier check error:', error);
      toast({
        title: "সমস্যা হয়েছে",
        description: "সার্ভারে সমস্যা। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const riskInfo = result ? RISK_STYLES[result.risk_label] || RISK_STYLES.new_customer : null;

  return (
    <div className="space-y-6">
      {/* Search Bar - Always on top */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-600" />
          ফোন নম্বর দিয়ে চেক করুন
        </h3>
        <div className="flex gap-3">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="h-12 rounded-xl border-gray-200 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bengali"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />চেক করুন</>}
          </Button>
        </div>
      </div>

      {/* Supported Couriers Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs text-gray-500 font-bengali mb-3">সাপোর্টেড কুরিয়ার সার্ভিস</p>
        <div className="flex items-center gap-6 flex-wrap">
          <img src={pathaoLogo} alt="Pathao" className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
          <img src={steadfastLogo} alt="Steadfast" className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
          <img src={carrybeeLogo} alt="CarryBee" className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
          <img src={redxLogo} alt="RedX" className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Risk Label Badge */}
          {riskInfo && (
            <div className={`${riskInfo.bg} rounded-xl px-5 py-3 flex items-center justify-between`}>
              <span className={`text-lg font-bold ${riskInfo.text} font-bengali`}>
                {riskInfo.label}
              </span>
              <span className={`text-sm ${riskInfo.text} font-bengali opacity-90`}>
                Success Rate: {result.success_rate}%
              </span>
            </div>
          )}

          {/* Stats Cards - মোট অর্ডার, মোট ডেলিভারি, মোট বাতিল */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
              <span className="block text-2xl font-bold text-cyan-600">{result.total_orders}</span>
              <span className="text-sm text-gray-600 font-bengali">মোট অর্ডার</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
              <span className="block text-2xl font-bold text-emerald-600">{result.total_delivered}</span>
              <span className="text-sm text-gray-600 font-bengali">মোট ডেলিভারি</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
              <span className="block text-2xl font-bold text-red-500">{result.total_returned}</span>
              <span className="text-sm text-gray-600 font-bengali">মোট বাতিল</span>
            </div>
          </div>

          {/* Courier Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900 font-bengali">Courier Details</h4>
              <Button
                onClick={() => handleSearch(result.phone)}
                disabled={loading}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bengali text-xs h-9 px-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                রিফ্রেশ কুরিয়ার ডেটা
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <th className="px-5 py-3 text-left text-sm font-bold text-white font-bengali">কুরিয়ার</th>
                    <th className="px-5 py-3 text-center text-sm font-bold text-white font-bengali">মোট</th>
                    <th className="px-5 py-3 text-center text-sm font-bold text-white font-bengali">সফল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DEFAULT_COURIERS.map((dc, i) => {
                    // Find matching courier data from results
                    const matched = result.couriers.find(c =>
                      c.name.toLowerCase().includes(dc.logoKey) ||
                      (dc.logoKey === "carrybee" && c.name.toLowerCase().includes("carry bee")) ||
                      (dc.logoKey === "redx" && (c.name.toLowerCase().includes("red x") || c.name.toLowerCase().includes("redx")))
                    );
                    const orders = matched?.orders || 0;
                    const delivered = matched?.delivered || 0;
                    const logo = COURIER_LOGOS[dc.logoKey];
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          {logo ? (
                            <img src={logo} alt={dc.name} className="h-8 w-auto max-w-[120px] object-contain" />
                          ) : (
                            <span className="font-semibold text-gray-900 text-sm">{dc.name}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-gray-700 text-sm">{orders}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold text-sm ${delivered > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {delivered}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Total Row */}
                <tfoot>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <td className="px-5 py-3 text-left text-sm font-bold text-white font-bengali">মোট</td>
                    <td className="px-5 py-3 text-center text-sm font-bold text-white">{result.total_orders}</td>
                    <td className="px-5 py-3 text-center text-sm font-bold text-white">{result.total_delivered}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* No data message */}
          {result.total_orders === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <h4 className="text-base font-bold text-blue-800 font-bengali mb-1">কোনো রেকর্ড পাওয়া যায়নি</h4>
              <p className="text-sm text-blue-600 font-bengali">এই ফোন নম্বরে কোনো courier delivery history নেই।</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
