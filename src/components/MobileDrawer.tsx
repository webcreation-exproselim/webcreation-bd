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
        className="w-80 bg-black/95 backdrop-blur-xl border-l border-yellow-500/20"
      >
        <SheetHeader>
          <SheetTitle className="text-gradient-gold text-left font-bengali font-bold text-xl">মেনু</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="px-4 py-3 text-white/80 font-bengali font-medium transition-all duration-300 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg group relative"
            >
              {item.label}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full transition-all duration-300 group-hover:h-6" />
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8 px-4">
          <Button
            variant="outline"
            onClick={onLoginClick}
            className="w-full border-yellow-500 bg-transparent text-yellow-400 font-bengali font-medium hover:bg-yellow-500/10 hover:border-yellow-400"
          >
            লগইন
          </Button>
          <Button
            onClick={onSignupClick}
            className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bengali font-semibold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500"
          >
            সাইন আপ
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
