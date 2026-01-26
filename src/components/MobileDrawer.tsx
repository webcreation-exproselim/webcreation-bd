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
        className="w-80 bg-agency-green border-l-agency-green-dark"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="px-4 py-3 text-white font-medium transition-colors duration-200 hover:text-agency-red hover:bg-white/10 rounded-md"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8 px-4">
          <Button
            variant="outline"
            onClick={onLoginClick}
            className="w-full border-white/30 bg-transparent text-white hover:bg-agency-green-dark hover:text-white"
          >
            Login
          </Button>
          <Button
            onClick={onSignupClick}
            className="w-full bg-agency-red text-white hover:bg-agency-red-dark"
          >
            Sign Up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
