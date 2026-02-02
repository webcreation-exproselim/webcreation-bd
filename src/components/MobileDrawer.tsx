import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";

const serviceItems = [
  { label: "ফেসবুক অ্যাডস", href: "/facebook-ads" },
  { label: "ওয়েব ডেভেলপমেন্ট", href: "/web-development" },
  { label: "গ্রাফিক্স ডিজাইন", href: "/graphics-design" },
  { label: "ভিডিও এডিটিং", href: "/video-editing" },
  { label: "মোশন গ্রাফিক্স", href: "/motion-graphics" },
  { label: "ল্যান্ডিং পেজ ডিজাইন", href: "/landing-page" },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: { label: string; href: string; hasSubmenu?: boolean }[];
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function MobileDrawer({
  open,
  onOpenChange,
  navItems,
  onLoginClick,
  onSignupClick,
}: MobileDrawerProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    onOpenChange(false);
    if (href.startsWith("#")) {
      // For hash links on the same page
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href === "#") {
      navigate("/");
    } else {
      navigate(href);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 bg-white border-l border-gray-200 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-80" />
              <div className="relative w-14 h-14 rounded-full bg-white p-1 shadow-xl ring-2 ring-white overflow-hidden">
                <img 
                  src={logo} 
                  alt="Web Creation BD" 
                  className="w-full h-full object-contain rounded-full"
                  loading="lazy"
                />
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            item.hasSubmenu ? (
              <div key={item.href}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="w-full px-4 py-3 text-gray-700 font-bengali font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                >
                  {item.label}
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Submenu */}
                <div className={`overflow-hidden transition-all duration-300 ${servicesOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="pl-4 py-2 space-y-1">
                    {serviceItems.map((subItem) => (
                      <button
                        key={subItem.href}
                        onClick={() => handleNavClick(subItem.href)}
                        className="block w-full text-left px-4 py-2.5 text-gray-600 font-bengali text-sm transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg hover:pl-6"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-3 text-left text-gray-700 font-bengali font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg group relative"
              >
                {item.label}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full transition-all duration-300 group-hover:h-6" />
              </button>
            )
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8 px-4">
          <Button
            variant="outline"
            onClick={onLoginClick}
            className="w-full border-blue-500 text-blue-600 font-bengali font-medium hover:bg-blue-50"
          >
            লগইন
          </Button>
          <Button
            onClick={onSignupClick}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white font-bengali font-semibold hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500"
          >
            সাইন আপ
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
