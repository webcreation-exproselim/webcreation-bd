import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  FileText,
  Code,
  Download,
  Globe,
  ShoppingCart,
  Truck,
  UserCheck,
  AlertCircle,
} from "lucide-react";

export type FraudTab =
  | "settings"
  | "blacklist"
  | "logs"
  | "integration"
  | "plugin"
  | "remote"
  | "abandoned"
  | "incomplete"
  | "courier"
  | "trust-score";

interface FraudProtectionSidebarProps {
  activeTab: FraudTab;
  onTabChange: (tab: FraudTab) => void;
}

const navItems: { id: FraudTab; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: "settings", label: "Settings", icon: Settings, gradient: "from-cyan-500 to-blue-500" },
  { id: "blacklist", label: "Blacklist", icon: Shield, gradient: "from-red-500 to-rose-500" },
  { id: "logs", label: "API Logs", icon: FileText, gradient: "from-amber-500 to-orange-500" },
  { id: "integration", label: "Integration", icon: Code, gradient: "from-violet-500 to-purple-500" },
  { id: "plugin", label: "Plugin", icon: Download, gradient: "from-emerald-500 to-teal-500" },
  { id: "remote", label: "Remote Config", icon: Globe, gradient: "from-blue-500 to-indigo-500" },
  { id: "abandoned", label: "Abandoned Carts", icon: ShoppingCart, gradient: "from-pink-500 to-rose-500" },
  { id: "incomplete", label: "Incomplete Orders", icon: AlertCircle, gradient: "from-yellow-500 to-amber-500" },
  { id: "courier", label: "Courier", icon: Truck, gradient: "from-teal-500 to-cyan-500" },
  { id: "trust-score", label: "Trust Score", icon: UserCheck, gradient: "from-indigo-500 to-violet-500" },
];

export function FraudProtectionSidebar({ activeTab, onTabChange }: FraudProtectionSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0">
        <div className="sticky top-[73px] space-y-1.5 pr-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 25 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="fraud-sidebar-active"
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="relative z-10 truncate">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 ml-auto w-2 h-2 rounded-full bg-white/60"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Horizontal Scroll Nav */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <div className="flex gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}
