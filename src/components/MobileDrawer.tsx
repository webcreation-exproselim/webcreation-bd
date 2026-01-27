import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const serviceItems = [
  { label: "ফেসবুক অ্যাডস", href: "#facebook-ads" },
  { label: "ওয়েব ডেভেলপমেন্ট", href: "#web-development" },
  { label: "গ্রাফিক্স ডিজাইন", href: "#graphics-design" },
  { label: "ভিডিও এডিটিং", href: "#video-editing" },
  { label: "মোশন গ্রাফিক্স", href: "#motion-graphics" },
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 bg-white border-l border-gray-200 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-red-600 text-left font-bengali font-bold text-xl">Web Creation BD</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            item.hasSubmenu ? (
              <div key={item.href}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="w-full px-4 py-3 text-gray-700 font-bengali font-medium transition-all duration-300 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-between"
                >
                  {item.label}
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Submenu */}
                <div className={`overflow-hidden transition-all duration-300 ${servicesOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="pl-4 py-2 space-y-1">
                    {serviceItems.map((subItem) => (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => onOpenChange(false)}
                        className="block px-4 py-2.5 text-gray-600 font-bengali text-sm transition-all duration-200 hover:text-red-600 hover:bg-red-50 rounded-lg hover:pl-6"
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="px-4 py-3 text-gray-700 font-bengali font-medium transition-all duration-300 hover:text-red-600 hover:bg-red-50 rounded-lg group relative"
              >
                {item.label}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-red-500 to-red-700 rounded-full transition-all duration-300 group-hover:h-6" />
              </a>
            )
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8 px-4">
          <Button
            variant="outline"
            onClick={onLoginClick}
            className="w-full border-red-500 text-red-600 font-bengali font-medium hover:bg-red-50"
          >
            লগইন
          </Button>
          <Button
            onClick={onSignupClick}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bengali font-semibold hover:from-red-600 hover:to-red-800"
          >
            সাইন আপ
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
