import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, UserX, AlertTriangle, User, Package, Truck, Calendar, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface TrustScoreResult {
  phone: string;
  trust_score: number | null;
  status: string;
  label_bn: string;
  label_en: string;
  color: string;
  history: {
    total_orders: number;
    delivered: number;
    returned: number;
    pending: number;
  };
  total_cod_amount?: number;
  last_order_date: string | null;
  couriers: string[];
}

interface CustomerTrustLookupProps {
  apiKey: string;
}

export function CustomerTrustLookup({ apiKey }: CustomerTrustLookupProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrustScoreResult | null>(null);

  const handleSearch = async () => {
    if (!phone.trim()) {
      toast.error("ফোন নম্বর দিন");
      return;
    }

    if (!apiKey) {
      toast.error("API key not found");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("customer-trust-score", {
        body: { api_key: apiKey, phone: phone.trim() }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Customer trust score calculated!");
    } catch (error: any) {
      console.error("Trust score error:", error);
      toast.error(error.message || "Failed to fetch trust score");
    } finally {
      setLoading(false);
    }
  };

  const getScoreIcon = (status: string) => {
    switch (status) {
      case "trusted":
        return <UserCheck className="h-12 w-12 text-green-500" />;
      case "medium_risk":
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case "high_risk":
        return <UserX className="h-12 w-12 text-red-500" />;
      default:
        return <User className="h-12 w-12 text-gray-400" />;
    }
  };

  const getScoreBadgeColor = (status: string) => {
    switch (status) {
      case "trusted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium_risk":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "high_risk":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-400" />
            Customer Trust Score Lookup
          </CardTitle>
          <CardDescription className="text-slate-400">
            কাস্টমারের ফোন নম্বর দিয়ে courier delivery history থেকে trust score দেখুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <div className={`h-2 ${
            result.status === "trusted" ? "bg-green-500" :
            result.status === "medium_risk" ? "bg-yellow-500" :
            result.status === "high_risk" ? "bg-red-500" :
            "bg-gray-500"
          }`} />
          <CardContent className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className={`p-4 rounded-full ${
                result.status === "trusted" ? "bg-green-500/10" :
                result.status === "medium_risk" ? "bg-yellow-500/10" :
                result.status === "high_risk" ? "bg-red-500/10" :
                "bg-gray-500/10"
              }`}>
                {getScoreIcon(result.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">{result.phone}</h3>
                  <Badge className={`${getScoreBadgeColor(result.status)} border`}>
                    {result.label_bn}
                  </Badge>
                </div>
                {result.trust_score !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${
                      result.status === "trusted" ? "text-green-400" :
                      result.status === "medium_risk" ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {result.trust_score}%
                    </span>
                    <span className="text-slate-400">Trust Score</span>
                  </div>
                ) : (
                  <p className="text-slate-400">কোনো delivery history পাওয়া যায়নি</p>
                )}
              </div>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
                <Package className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{result.history.total_orders}</p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-green-500/30">
                <UserCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">{result.history.delivered}</p>
                <p className="text-xs text-slate-400">Delivered</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-red-500/30">
                <UserX className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-400">{result.history.returned}</p>
                <p className="text-xs text-slate-400">Returned</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-yellow-500/30">
                <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{result.history.pending}</p>
                <p className="text-xs text-slate-400">Pending</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-3 gap-4">
              {result.total_cod_amount !== undefined && result.total_cod_amount > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">Total COD Amount</span>
                  </div>
                  <p className="text-lg font-semibold text-yellow-400">৳{result.total_cod_amount.toLocaleString()}</p>
                </div>
              )}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-slate-400">Last Order</span>
                </div>
                <p className="text-lg font-semibold text-white">{formatDate(result.last_order_date)}</p>
              </div>
              {result.couriers.length > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-slate-400">Couriers Used</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {result.couriers.map((courier) => (
                      <Badge key={courier} variant="outline" className="text-cyan-400 border-cyan-500/30 capitalize">
                        {courier}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Score Explanation */}
            <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-2">📊 Trust Score Calculation</h4>
              <p className="text-xs text-slate-400">
                Trust Score = (Delivered Orders ÷ Completed Orders) × 100. 
                শুধুমাত্র Delivered এবং Returned orders গণনা করা হয়। Pending orders বাদ দেওয়া হয়।
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-400">80-100%: Trusted</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-slate-400">50-79%: Medium Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-400">0-49%: High Risk</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card className="bg-slate-800/30 border-slate-700/50 border-dashed">
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">Customer Lookup</h3>
            <p className="text-sm text-slate-500">
              ফোন নম্বর দিয়ে সার্চ করুন এবং কাস্টমারের courier delivery history দেখুন
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
