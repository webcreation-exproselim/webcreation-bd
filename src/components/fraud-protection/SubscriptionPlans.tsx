import { Clock, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionPlansProps {
  onSelectPlan: (planType: 'monthly' | 'yearly') => void;
}

export function SubscriptionPlans({ onSelectPlan }: SubscriptionPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Plan */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium text-sm">Monthly</span>
          </div>
          
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">৳১০০</span>
            <span className="text-white/50 text-sm">/মাস</span>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>1,000 API requests</span>
            </li>
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>Unlimited blacklist</span>
            </li>
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>Real-time logs</span>
            </li>
          </ul>
          
          <Button 
            onClick={() => onSelectPlan('monthly')}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            কিনুন
          </Button>
        </div>
      </div>

      {/* Yearly Plan */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
        <div className="absolute -top-1 right-4">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-b-lg">
            42% সেভ!
          </span>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium text-sm">Yearly</span>
          </div>
          
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">৳৬৯৯</span>
            <span className="text-white/50 text-sm">/বছর</span>
            <div className="text-xs text-white/40 line-through">৳১,২০০/বছর</div>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>15,000 API requests</span>
            </li>
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>Unlimited blacklist</span>
            </li>
            <li className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>
          
          <Button 
            onClick={() => onSelectPlan('yearly')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            কিনুন
          </Button>
        </div>
      </div>
    </div>
  );
}