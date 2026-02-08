import { useState, useEffect } from "react";
import { Copy, Check, Upload, Loader2, CreditCard, Phone, Image, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourierCheckPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  userId: string;
  planType: 'monthly' | 'yearly';
  onSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  method: string;
  account_number: string;
  account_name: string | null;
}

export function CourierCheckPurchaseModal({
  isOpen,
  onClose,
  subscriptionId,
  userId,
  planType,
  onSuccess,
}: CourierCheckPurchaseModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true);

      if (data) {
        setPaymentMethods(data);
        if (data.length > 0) setSelectedMethod(data[0].method);
      }
    };

    if (isOpen) fetchPaymentMethods();
  }, [isOpen]);

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshotFile(file);
  };

  const handleSubmit = async () => {
    if (!senderNumber.trim() || !websiteDomain.trim()) {
      toast({
        title: "সব তথ্য দিন",
        description: "Sender Number এবং Website Domain আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let screenshotUrl = null;

      if (screenshotFile) {
        setUploading(true);
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `courier-check-${subscriptionId}-${Date.now()}.${fileExt}`;
        const filePath = `courier-check-screenshots/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(filePath, screenshotFile);

        if (uploadError) throw new Error('Screenshot upload failed');

        const { data: { publicUrl } } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(filePath);

        screenshotUrl = publicUrl;
        setUploading(false);
      }

      // Update website_url on subscription
      await supabase
        .from('courier_check_subscriptions')
        .update({ website_url: websiteDomain.trim() })
        .eq('id', subscriptionId);

      // Create order
          const { error } = await supabase
        .from('courier_check_orders')
        .insert({
          subscription_id: subscriptionId,
          user_id: userId,
          amount: planType === 'monthly' ? 249 : 499,
          payment_method: selectedMethod,
          sender_number: senderNumber.trim(),
          payment_screenshot_url: screenshotUrl,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "✅ পেমেন্ট জমা হয়েছে",
        description: "আপনার পেমেন্ট ২-৪ ঘন্টার মধ্যে যাচাই করা হবে",
      });

      onSuccess();
      onClose();
      setSenderNumber("");
      setWebsiteDomain("");
      setScreenshotFile(null);
    } catch (error) {
      console.error('Error submitting courier check order:', error);
      toast({
        title: "সমস্যা হয়েছে",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const selectedPayment = paymentMethods.find(p => p.method === selectedMethod);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-white border-gray-200 text-gray-900 ${isMobile ? 'max-w-[95vw] p-4' : 'max-w-md p-6'} rounded-3xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold font-bengali flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block">Courier Check Payment</span>
              <span className="text-sm font-normal text-gray-500">Monthly ৳249 | Yearly ৳499</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Step 1: Payment Methods */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">1</div>
              <Label className="text-gray-700 font-semibold font-bengali">টাকা পাঠান এই নম্বরে</Label>
            </div>

            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.method)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMethod === method.method
                      ? 'border-cyan-500 bg-white shadow-md shadow-cyan-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                      method.method.toLowerCase() === 'bkash' ? 'bg-pink-500' :
                      method.method.toLowerCase() === 'nagad' ? 'bg-orange-500' :
                      method.method.toLowerCase() === 'rocket' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      {method.method.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold capitalize text-gray-900">{method.method}</div>
                      <div className="text-sm text-gray-600">{method.account_number}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); copyNumber(method.account_number); }}
                    className={`rounded-lg ${copiedNumber === method.account_number ? 'text-emerald-600 bg-emerald-50' : 'text-cyan-600 hover:bg-cyan-50'}`}
                  >
                    {copiedNumber === method.account_number ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>

            {selectedPayment && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-700 font-bengali text-center">
                  <strong>৳{planType === 'monthly' ? '249' : '499'}</strong> পাঠান: <strong>{selectedPayment.account_number}</strong> ({selectedPayment.method})
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Transaction Details */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">2</div>
              <Label className="text-gray-700 font-semibold font-bengali">তথ্য দিন</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cc-sender" className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Sender Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cc-sender"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-12 rounded-xl border-gray-200 bg-white focus:border-cyan-500 focus:ring-cyan-500"
                />
                <p className="text-xs text-gray-400">যে নম্বর থেকে টাকা পাঠিয়েছেন</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cc-domain" className="text-sm text-gray-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website Domain <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cc-domain"
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomain(e.target.value)}
                  placeholder="example.com"
                  className="h-12 rounded-xl border-gray-200 bg-white focus:border-cyan-500 focus:ring-cyan-500"
                />
                <p className="text-xs text-gray-400">যে ওয়েবসাইটে Plugin ব্যবহার করবেন</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cc-screenshot" className="text-sm text-gray-600 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Payment Screenshot
                </Label>
                <div className="relative">
                  <label
                    htmlFor="cc-screenshot"
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      screenshotFile
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 bg-white hover:border-cyan-400 text-gray-500'
                    }`}
                  >
                    {screenshotFile ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{screenshotFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">স্ক্রিনশট আপলোড করুন</span>
                      </>
                    )}
                  </label>
                  <Input
                    id="cc-screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading || !senderNumber.trim() || !websiteDomain.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-base font-bengali shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                জমা হচ্ছে...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                পেমেন্ট জমা দিন
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-bengali"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            বাতিল করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
