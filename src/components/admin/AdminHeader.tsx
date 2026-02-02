import { Link } from "react-router-dom";
import { Home, RefreshCw, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onRefresh, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-60 blur-sm" />
            <div className="relative w-10 h-10 rounded-full bg-white p-0.5 shadow-md overflow-hidden">
              <img 
                src={logo} 
                alt="Web Creation BD" 
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <h1 className="font-bengali font-bold text-gray-900 text-lg">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-xs text-gray-400">Web Creation BD</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <Bell className="w-5 h-5" />
          </Button>
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Button onClick={onRefresh} variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-bengali">
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </div>
      </div>
    </header>
  );
}
