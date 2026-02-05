import { Package, FileText, MessageCircle, Shield, User } from "lucide-react";
import { motion } from "framer-motion";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "profile";

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveSubscription?: boolean;
  hasPendingOrder?: boolean;
}

const tabs = [
  { id: "orders" as TabType, label: "অর্ডার", icon: Package },
  { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText },
  { id: "chat" as TabType, label: "চ্যাট", icon: MessageCircle },
  { id: "fraudguard" as TabType, label: "Guard", icon: Shield },
  { id: "profile" as TabType, label: "প্রোফাইল", icon: User },
];

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  hasActiveSubscription,
  hasPendingOrder,
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFraudGuard = tab.id === "fraudguard";
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] rounded-xl transition-all"
            >
              <div
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                {/* Fraud Guard status indicator */}
                {isFraudGuard && (hasActiveSubscription || hasPendingOrder) && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      hasActiveSubscription ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-bengali mt-1 transition-colors ${
                  isActive ? "text-blue-600 font-medium" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
