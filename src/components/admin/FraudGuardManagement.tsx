import { useState } from "react";
import { Shield, Users, FileText, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { FraudGuardCharts } from "./FraudGuardCharts";
import { MerchantManagement } from "./MerchantManagement";
import { FraudLogsAdmin } from "./FraudLogsAdmin";
import { FraudSubscriptionManagement } from "./FraudSubscriptionManagement";

type FraudGuardTab = "overview" | "merchants" | "logs" | "subscriptions";

export function FraudGuardManagement() {
  const [activeTab, setActiveTab] = useState<FraudGuardTab>("overview");

  const tabs = [
    { id: "overview" as FraudGuardTab, label: "Overview", icon: BarChart3, color: "from-cyan-500 to-blue-500" },
    { id: "merchants" as FraudGuardTab, label: "Merchants", icon: Users, color: "from-purple-500 to-violet-500" },
    { id: "logs" as FraudGuardTab, label: "API Logs", icon: FileText, color: "from-amber-500 to-orange-500" },
    { id: "subscriptions" as FraudGuardTab, label: "Subscriptions", icon: Shield, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-cyan-500/10`
                  : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && <FraudGuardCharts />}
        {activeTab === "merchants" && <MerchantManagement />}
        {activeTab === "logs" && <FraudLogsAdmin />}
        {activeTab === "subscriptions" && <FraudSubscriptionManagement />}
      </motion.div>
    </div>
  );
}
