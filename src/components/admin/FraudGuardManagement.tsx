import { useState } from "react";
import { Shield, Users, FileText, BarChart3 } from "lucide-react";
import { FraudGuardCharts } from "./FraudGuardCharts";
import { MerchantManagement } from "./MerchantManagement";
import { FraudLogsAdmin } from "./FraudLogsAdmin";
import { FraudSubscriptionManagement } from "./FraudSubscriptionManagement";

type FraudGuardTab = "overview" | "merchants" | "logs" | "subscriptions";

export function FraudGuardManagement() {
  const [activeTab, setActiveTab] = useState<FraudGuardTab>("overview");

  const tabs = [
    { id: "overview" as FraudGuardTab, label: "Overview", icon: BarChart3 },
    { id: "merchants" as FraudGuardTab, label: "Merchants", icon: Users },
    { id: "logs" as FraudGuardTab, label: "API Logs", icon: FileText },
    { id: "subscriptions" as FraudGuardTab, label: "Subscriptions", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <FraudGuardCharts />}
      {activeTab === "merchants" && <MerchantManagement />}
      {activeTab === "logs" && <FraudLogsAdmin />}
      {activeTab === "subscriptions" && <FraudSubscriptionManagement />}
    </div>
  );
}
