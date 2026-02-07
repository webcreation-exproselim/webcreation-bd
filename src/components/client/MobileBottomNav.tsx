import { Package, FileText, MessageCircle, Shield, User, Search } from "lucide-react";
import { motion } from "framer-motion";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "couriercheck" | "profile";

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveSubscription?: boolean;
  hasPendingOrder?: boolean;
}

const tabs = [
  { id: "orders" as TabType, label: "অর্ডার", icon: Package },
  { id: "invoices" as TabType, label: "বিল", icon: FileText },
  { id: "chat" as TabType, label: "চ্যাট", icon: MessageCircle },
  { id: "fraudguard" as TabType, label: "Guard", icon: Shield },
  { id: "couriercheck" as TabType, label: "Courier", icon: Search },
  { id: "profile" as TabType, label: "আমি", icon: User },
];

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  hasActiveSubscription,
  hasPendingOrder,
}: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 safe-area-pb">
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
                className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
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
              </motion.div>
              <motion.span
                animate={{ opacity: isActive ? 1 : 0.7 }}
                className={`text-[11px] font-bengali mt-0.5 transition-colors ${
                  isActive ? "text-blue-600 font-bold" : "text-gray-600"
                }`}
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
