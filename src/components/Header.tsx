import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "ফেসবুক অ্যাডস", href: "#facebook-ads" },
  { label: "ওয়েব ডেভেলপমেন্ট", href: "#web-development" },
  { label: "গ্রাফিক্স ডিজাইন", href: "#graphics-design" },
  { label: "ভিডিও এডিটিং", href: "#video-editing" },
  { label: "মোশন গ্রাফিক্স", href: "#motion-graphics" },
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
            ? "glassmorphism-solid shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <span className="text-black font-bold text-xl font-bengali">ড</span>
                </div>
                <span className="text-gradient-gold font-bengali text-xl font-bold hidden sm:block">
                  ডিজিটাল এজেন্সি
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
                    className="relative px-3 py-2 text-sm text-white/80 font-bengali font-medium transition-all duration-300 hover:text-yellow-400 group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
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
                  className="border-yellow-500 bg-transparent text-yellow-400 font-bengali font-medium hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-yellow-300 transition-all duration-300"
                >
                  লগইন
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bengali font-semibold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-yellow-500/30"
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
                className="lg:hidden text-yellow-400 hover:bg-yellow-500/10"
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
