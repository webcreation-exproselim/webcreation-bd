import { useState } from "react";
import { Search, Loader2, TrendingUp, Package, CheckCircle, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

const RISK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  trusted: { bg: "bg-emerald-100", text: "text-emerald-700", label: "✅ বিশ্বস্ত" },
  moderate: { bg: "bg-amber-100", text: "text-amber-700", label: "⚠️ মাঝারি ঝুঁকি" },
  risky: { bg: "bg-red-100", text: "text-red-700", label: "🚫 উচ্চ ঝুঁকি" },
  new_customer: { bg: "bg-blue-100", text: "text-blue-700", label: "🆕 নতুন কাস্টমার" },
};

const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

export function CourierCheckerDashboard({ apiKey }: CourierCheckerDashboardProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
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

  const riskInfo = result ? RISK_COLORS[result.risk_label] || RISK_COLORS.new_customer : null;

  const radialData = result ? [{ name: "Success", value: result.success_rate, fill: result.success_rate >= 80 ? "#10b981" : result.success_rate >= 50 ? "#f59e0b" : "#ef4444" }] : [];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
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
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bengali"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />চেক করুন</>}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Success Rate - Radial */}
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col items-center">
              <p className="text-sm text-gray-500 font-bengali mb-2">Success Rate</p>
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f3f4f6' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 -mt-2">{result.success_rate}%</p>
            </div>

            {/* Stats Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-500 font-bengali">মোট অর্ডার</p>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{result.total_orders}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-gray-500 font-bengali">ডেলিভারি</p>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{result.total_delivered}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-500 font-bengali">বাতিল</p>
              </div>
              <p className="text-3xl font-extrabold text-red-500">{result.total_returned}</p>
            </div>
          </div>

          {/* Trust Label */}
          {riskInfo && (
            <div className={`${riskInfo.bg} rounded-2xl p-5 border`}>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${riskInfo.text} font-bengali`}>
                  {riskInfo.label}
                </span>
                {result.risk_message && (
                  <span className={`text-sm ${riskInfo.text} font-bengali`}>
                    — {result.risk_message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Courier Breakdown Chart */}
          {result.couriers.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 font-bengali mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-600" />
                কুরিয়ার-ভিত্তিক ব্রেকডাউন
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.couriers} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number, name: string) => [value, name === 'delivered' ? 'ডেলিভারি' : name === 'returned' ? 'বাতিল' : name]}
                    />
                    <Bar dataKey="delivered" name="ডেলিভারি" radius={[4, 4, 0, 0]}>
                      {result.couriers.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar dataKey="returned" name="বাতিল" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Courier Table */}
          {result.couriers.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 font-bengali">বিস্তারিত টেবিল</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">কুরিয়ার</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">অর্ডার</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">ডেলিভারি</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">বাতিল</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Success %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.couriers.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{c.orders}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-medium">{c.delivered}</td>
                        <td className="px-4 py-3 text-center text-red-500 font-medium">{c.returned}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            c.rate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                            c.rate >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {c.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No data message */}
          {result.total_orders === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-blue-800 font-bengali mb-1">কোনো রেকর্ড পাওয়া যায়নি</h4>
              <p className="text-sm text-blue-600 font-bengali">এই ফোন নম্বরে কোনো courier delivery history নেই।</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
