import { Link } from "react-router-dom";
import { Home, RefreshCw, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onRefresh, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="text-white font-bold text-lg">W</span>
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
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 hover:bg-red-50 font-bengali">
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </div>
      </div>
    </header>
  );
}
