import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Home, Menu, X } from "lucide-react";
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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg md:text-xl">W</span>
            </div>
            <span className="font-bengali text-base md:text-lg font-bold text-gray-900 hidden sm:block">
              Web Creation BD
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 gap-2">
                <Home className="w-4 h-4" />
                <span className="font-bengali">হোম</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
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
              <span className="font-bengali text-sm font-medium text-gray-700">
                {profile?.full_name || userEmail?.split("@")[0]}
              </span>
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              className="text-gray-500 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 space-y-2"
          >
            <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-bengali text-gray-700">
              <Home className="w-4 h-4 inline mr-2" /> হোম
            </Link>
            <div className="px-4 py-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
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
                <span className="font-bengali text-sm text-gray-700">
                  {profile?.full_name || userEmail?.split("@")[0]}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bengali"
            >
              <LogOut className="w-4 h-4 inline mr-2" /> লগআউট
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
