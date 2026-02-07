import { Package, FileText, MessageCircle, Shield, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "profile";

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveSubscription?: boolean;
  hasPendingOrder?: boolean;
}

const tabs = [
  { id: "orders" as TabType, label: "অর্ডার", icon: Package, color: "from-cyan-400 to-blue-500" },
  { id: "invoices" as TabType, label: "বিল", icon: FileText, color: "from-amber-400 to-orange-500" },
  { id: "chat" as TabType, label: "চ্যাট", icon: MessageCircle, color: "from-emerald-400 to-teal-500" },
  { id: "fraudguard" as TabType, label: "Guard", icon: Shield, color: "from-purple-400 to-violet-500" },
  { id: "profile" as TabType, label: "আমি", icon: User, color: "from-pink-400 to-rose-500" },
];

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  hasActiveSubscription,
  hasPendingOrder,
}: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFraudGuard = tab.id === "fraudguard";

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-2 flex-1 max-w-[72px]"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.9,
                  y: isActive ? -4 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "relative p-2.5 rounded-2xl transition-all duration-200",
                  isActive
                    ? `bg-gradient-to-r ${tab.color} shadow-lg`
                    : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-slate-500"
                  )}
                />
                {/* Fraud Guard status indicator */}
                {isFraudGuard && (hasActiveSubscription || hasPendingOrder) && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                      hasActiveSubscription ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                )}
              </motion.div>
              <motion.span
                animate={{ opacity: isActive ? 1 : 0.5 }}
                className={cn(
                  "text-[11px] font-bengali mt-0.5 transition-colors",
                  isActive ? "text-cyan-400 font-bold" : "text-slate-500"
                )}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
