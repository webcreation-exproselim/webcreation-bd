import { useState, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const serviceItems = [
  { label: "ফেসবুক অ্যাডস", href: "#facebook-ads" },
  { label: "ওয়েব ডেভেলপমেন্ট", href: "#web-development" },
  { label: "গ্রাফিক্স ডিজাইন", href: "#graphics-design" },
  { label: "ভিডিও এডিটিং", href: "#video-editing" },
  { label: "মোশন গ্রাফিক্স", href: "#motion-graphics" },
  { label: "ল্যান্ডিং পেজ ডিজাইন", href: "#landing-page" },
];

const navItems = [
  { label: "হোম", href: "#", hasSubmenu: false },
  { label: "সার্ভিস", href: "#services", hasSubmenu: true, submenu: serviceItems },
  { label: "পোর্টফোলিও", href: "#portfolio", hasSubmenu: false },
  { label: "আমাদের সম্পর্কে", href: "#about", hasSubmenu: false },
  { label: "যোগাযোগ", href: "#contact", hasSubmenu: false },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white ${
          isScrolled
            ? "shadow-lg shadow-black/10"
            : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl font-bengali">W</span>
                </div>
                <span className="font-bengali text-xl font-bold hidden sm:block text-red-600">
                  Web Creation BD
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  item.hasSubmenu ? (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => setServiceDropdownOpen(true)}
                      onMouseLeave={() => setServiceDropdownOpen(false)}
                    >
                      <button
                        className="relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 flex items-center gap-1 text-gray-700 hover:text-red-600"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div
                        className={`absolute top-full left-0 mt-2 w-56 rounded-xl overflow-hidden transition-all duration-300 z-50 bg-white shadow-xl border border-gray-100 ${
                          serviceDropdownOpen 
                            ? 'opacity-100 visible translate-y-0' 
                            : 'opacity-0 invisible -translate-y-2'
                        }`}
                      >
                        {item.submenu?.map((subItem) => (
                          <a
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-5 py-3 font-bengali text-sm transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:pl-7"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      key={item.href}
                      href={item.href}
                      className="relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 group text-gray-700 hover:text-red-600"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left bg-red-500" />
                    </a>
                  )
                ))}
              </nav>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleLoginClick}
                className="font-bengali font-medium transition-all duration-300 border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-4"
              >
                লগইন
              </Button>
              <Button
                onClick={handleSignupClick}
                className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bengali font-semibold hover:from-red-600 hover:to-red-800 hover:scale-[1.03] transition-all duration-300 shadow-lg text-xs sm:text-sm px-2 sm:px-4"
              >
                সাইন আপ
              </Button>
              
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(true)}
                  className="text-red-600 hover:bg-red-50 ml-1"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>

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
