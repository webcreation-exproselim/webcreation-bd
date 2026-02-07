import { Link } from "react-router-dom";
import { Home, RefreshCw, LogOut, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onRefresh, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-40 blur-sm" />
            <div className="relative w-10 h-10 rounded-full bg-white p-0.5 ring-1 ring-gray-200 overflow-hidden shadow-sm">
              <img 
                src={logo} 
                alt="Web Creation BD" 
                className="w-full h-full object-contain rounded-full"
                loading="lazy"
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bengali font-bold text-gray-900 text-sm">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-[10px] text-gray-400">Web Creation BD</p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="সার্চ করুন..."
              className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl h-9 text-sm font-bengali focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-9 w-9">
            <Bell className="w-4 h-4" />
          </Button>
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-9 w-9">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          <Button onClick={onRefresh} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-9 w-9">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 hover:bg-red-50 font-bengali rounded-xl h-9 text-xs">
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
