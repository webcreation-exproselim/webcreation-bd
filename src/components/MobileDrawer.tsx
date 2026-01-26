import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: { label: string; href: string }[];
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 bg-white border-l border-gray-200"
      >
        <SheetHeader>
          <SheetTitle className="text-red-600 text-left font-bengali font-bold text-xl">Web Creation BD</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="px-4 py-3 text-gray-700 font-bengali font-medium transition-all duration-300 hover:text-red-600 hover:bg-red-50 rounded-lg group relative"
            >
              {item.label}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-red-500 to-red-700 rounded-full transition-all duration-300 group-hover:h-6" />
            </a>
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
