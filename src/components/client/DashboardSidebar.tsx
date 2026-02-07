import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  FileText,
  MessageCircle,
  Shield,
  User,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "couriercheck" | "profile";

interface Profile {
  full_name?: string | null;
  avatar_url?: string | null;
}

interface DashboardSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: Profile | null;
  userEmail?: string;
  hasActiveSubscription?: boolean;
  hasPendingOrder?: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "orders" as TabType, label: "অর্ডার সমূহ", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
  { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
  { id: "chat" as TabType, label: "মেসেজ", icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
  { id: "fraudguard" as TabType, label: "Fraud Guard", icon: Shield, color: "text-purple-600", bg: "bg-purple-100" },
  { id: "couriercheck" as TabType, label: "Courier Check", icon: Search, color: "text-cyan-600", bg: "bg-cyan-100" },
  { id: "profile" as TabType, label: "প্রোফাইল", icon: User, color: "text-slate-600", bg: "bg-slate-100" },
];

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  profile,
  userEmail,
  hasActiveSubscription,
  hasPendingOrder,
  collapsed,
  setCollapsed,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bengali text-lg font-bold text-gray-900"
            >
              Web Creation BD
            </motion.span>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className={cn("p-4 border-b border-gray-100", collapsed ? "px-3" : "")}>
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-blue-100">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 flex-1">
              <p className="font-bengali text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || "গ্রাহক"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail?.split("@")[0]}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isFraudGuard = item.id === "fraudguard";

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "hover:bg-gray-100 text-gray-600"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                    isActive ? "bg-white/20" : item.bg
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : item.color)} />
                  {/* Fraud Guard indicator */}
                  {isFraudGuard && (hasActiveSubscription || hasPendingOrder) && (
                    <span
                      className={cn(
                        "absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                        hasActiveSubscription ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  )}
                </div>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "font-bengali text-sm font-medium flex-1 text-left",
                      isActive ? "text-white" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg font-bengali">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-4 border-t border-gray-100">
            <p className="px-3 text-xs text-gray-400 font-bengali mb-2">দ্রুত লিংক</p>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-bengali text-sm">হোম পেজ</span>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-500 mb-2 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-bengali">সাইডবার ছোট করুন</span>}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-bengali text-sm font-medium">লগআউট</span>}
        </button>
      </div>
    </aside>
  );
}
