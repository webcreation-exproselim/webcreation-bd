import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Home, Menu, X, Package, FileText, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  full_name?: string | null;
  avatar_url?: string | null;
}

interface DashboardHeaderProps {
  profile: Profile | null;
  userEmail?: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}

export function DashboardHeader({
  profile,
  userEmail,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bengali text-base font-bold text-gray-900">
              WCBD
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden ring-2 ring-blue-100">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pb-4"
            >
              <div className="pt-2 space-y-1">
                {/* User Info */}
                <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
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
                    <div>
                      <p className="font-bengali text-sm font-semibold text-gray-900">
                        {profile?.full_name || "গ্রাহক"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userEmail?.split("@")[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-700 font-bengali transition-colors"
                >
                  <Home className="w-5 h-5 text-gray-500" />
                  হোম পেজ
                </Link>

                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 font-bengali transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  লগআউট
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
