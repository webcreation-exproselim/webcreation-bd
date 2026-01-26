import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "হোম", href: "#" },
  { label: "সার্ভিস", href: "#services" },
  { label: "পোর্টফোলিও", href: "#portfolio" },
  { label: "আমাদের সম্পর্কে", href: "#about" },
  { label: "যোগাযোগ", href: "#contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    setLoginOpen(true);
  };

  const handleSignupClick = () => {
    setSignupOpen(true);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl font-bengali">W</span>
                </div>
                <span className={`font-bengali text-xl font-bold hidden sm:block transition-colors duration-300 ${isScrolled ? 'text-red-600' : 'text-white'}`}>
                  Web Creation BD
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 group ${
                      isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-yellow-400'
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left ${
                      isScrolled ? 'bg-red-500' : 'bg-yellow-400'
                    }`} />
                  </a>
                ))}
              </nav>
            )}

            {/* Auth Buttons - Desktop */}
            {!isMobile && (
              <div className="hidden lg:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className={`font-bengali font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'border-red-500 text-red-600 hover:bg-red-50' 
                      : 'border-white/50 bg-transparent text-white hover:bg-white/10'
                  }`}
                >
                  লগইন
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bengali font-semibold hover:from-red-600 hover:to-red-800 hover:scale-[1.03] transition-all duration-300 shadow-lg"
                >
                  সাইন আপ
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(true)}
                className={`lg:hidden transition-colors ${isScrolled ? 'text-red-600 hover:bg-red-50' : 'text-white hover:bg-white/10'}`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
      <MobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        navItems={navItems}
        onLoginClick={() => {
          setDrawerOpen(false);
          setLoginOpen(true);
        }}
        onSignupClick={() => {
          setDrawerOpen(false);
          setSignupOpen(true);
        }}
      />
    </>
  );
}
