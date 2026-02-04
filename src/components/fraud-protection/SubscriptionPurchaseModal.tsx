import { useState, useEffect } from "react";
import { X, Copy, Check, Upload, Loader2 } from "lucide-react";
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

interface SubscriptionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'monthly' | 'yearly';
  merchantId: string;
  onSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  method: string;
  account_number: string;
  account_name: string | null;
}

export function SubscriptionPurchaseModal({
  isOpen,
  onClose,
  planType,
  merchantId,
  onSuccess,
}: SubscriptionPurchaseModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();

  const amount = planType === 'monthly' ? 100 : 699;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true);
      
      if (data) {
        setPaymentMethods(data);
        if (data.length > 0) {
          setSelectedMethod(data[0].method);
        }
      }
    };

    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!transactionId.trim() || !senderNumber.trim() || !websiteDomain.trim()) {
      toast({
        title: "সব তথ্য দিন",
        description: "Transaction ID, Sender Number এবং Website Domain আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshotFile) {
        setUploading(true);
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `subscription-${merchantId}-${Date.now()}.${fileExt}`;
        const filePath = `subscription-screenshots/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(filePath, screenshotFile);

        if (uploadError) {
          throw new Error('Screenshot upload failed');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(filePath);

        screenshotUrl = publicUrl;
        setUploading(false);
      }

      // Update merchant's website_url
      await supabase
        .from('merchants')
        .update({ website_url: websiteDomain.trim() })
        .eq('id', merchantId);

      // Create subscription order
      const { error } = await supabase
        .from('subscription_orders')
        .insert({
          merchant_id: merchantId,
          plan_type: planType,
          amount,
          payment_method: selectedMethod,
          transaction_id: transactionId.trim(),
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
      
      // Reset form
      setTransactionId("");
      setSenderNumber("");
      setWebsiteDomain("");
      setScreenshotFile(null);
    } catch (error) {
      console.error('Error submitting order:', error);
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
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bengali flex items-center justify-between">
            <span>
              কিনুন: {planType === 'monthly' ? 'Monthly' : 'Yearly'} Plan - ৳{amount}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Payment Methods */}
          <div>
            <Label className="text-white/80 font-bengali mb-3 block">
              Step 1: পেমেন্ট পাঠান
            </Label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.method)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMethod === method.method
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="font-medium capitalize">{method.method}</div>
                    <div className="text-sm text-white/60">{method.account_number}</div>
                    {method.account_name && (
                      <div className="text-xs text-white/40">{method.account_name}</div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyNumber(method.account_number);
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedNumber === method.account_number ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            {selectedPayment && (
              <p className="text-sm text-white/50 mt-2 font-bengali">
                ৳{amount} পাঠান: {selectedPayment.account_number}
              </p>
            )}
          </div>

          {/* Step 2: Transaction Details */}
          <div>
            <Label className="text-white/80 font-bengali mb-3 block">
              Step 2: তথ্য দিন
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="txn" className="text-sm text-white/60">Transaction ID</Label>
                <Input
                  id="txn"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="ABC123XYZ"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="sender" className="text-sm text-white/60">Sender Number</Label>
                <Input
                  id="sender"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="domain" className="text-sm text-white/60">
                  Website Domain <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="domain"
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomain(e.target.value)}
                  placeholder="example.com"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-white/40 mt-1">
                  যে ডোমেইনে plugin ব্যবহার করবেন সেটা দিন
                </p>
              </div>
              <div>
                <Label htmlFor="screenshot" className="text-sm text-white/60">
                  স্ক্রিনশট (optional)
                </Label>
                <div className="relative">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-slate-800 border-slate-600 text-white file:bg-slate-700 file:text-white file:border-0"
                  />
                  {screenshotFile && (
                    <div className="text-xs text-green-400 mt-1">
                      ✓ {screenshotFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bengali"
          >
            {submitting || uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                জমা হচ্ছে...
              </>
            ) : (
              'পেমেন্ট জমা দিন'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}