import { useState, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CartButton } from "./CartButton";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const serviceItems = [
  { label: "ফেসবুক অ্যাডস", href: "/facebook-ads" },
  { label: "ওয়েব ডেভেলপমেন্ট", href: "/web-development" },
  { label: "গ্রাফিক্স ডিজাইন", href: "/graphics-design" },
  { label: "ভিডিও এডিটিং", href: "/video-editing" },
  { label: "মোশন গ্রাফিক্স", href: "/motion-graphics" },
  { label: "ল্যান্ডিং পেজ ডিজাইন", href: "/landing-page" },
];

const navItems = [
  { label: "হোম", href: "#", hasSubmenu: false },
  { label: "সার্ভিস", href: "#services", hasSubmenu: true, submenu: serviceItems },
  { label: "Fraud Protection", href: "/fraud-guard", hasSubmenu: false, isRoute: true },
  { label: "পোর্টফোলিও", href: "#portfolio", hasSubmenu: false },
  { label: "আমাদের সম্পর্কে", href: "#about", hasSubmenu: false },
  { label: "যোগাযোগ", href: "#contact", hasSubmenu: false },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleSignupClick = () => {
    navigate("/auth");
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
            <Link to="/" className="flex-shrink-0 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1 shadow-xl ring-2 ring-white overflow-hidden">
                  <img 
                    src={logo} 
                    alt="Web Creation BD Logo" 
                    className="w-full h-full object-contain rounded-full"
                    loading="eager"
                  />
                </div>
              </div>
            </Link>

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
                        className="relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 flex items-center gap-1 text-gray-700 hover:text-blue-600"
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
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="block px-5 py-3 font-bengali text-sm transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:pl-7"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (item as any).isRoute ? (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 group text-gray-700 hover:text-blue-600"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left bg-gradient-to-r from-cyan-500 to-blue-500" />
                    </Link>
                  ) : (
                    <a
                      key={item.href}
                      href={item.href}
                      className="relative px-4 py-2 text-sm font-bengali font-medium transition-all duration-300 group text-gray-700 hover:text-blue-600"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left bg-gradient-to-r from-cyan-500 to-blue-500" />
                    </a>
                  )
                ))}
              </nav>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CartButton />
              <Button
                variant="outline"
                onClick={handleLoginClick}
                className="font-bengali font-medium transition-all duration-300 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-4"
              >
                লগইন
              </Button>
              <Button
                onClick={handleSignupClick}
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white font-bengali font-semibold hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 hover:scale-[1.03] transition-all duration-300 shadow-lg text-xs sm:text-sm px-2 sm:px-4"
              >
                সাইন আপ
              </Button>
              
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(true)}
                  className="text-blue-600 hover:bg-blue-50 ml-1"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        navItems={navItems}
        onLoginClick={() => {
          setDrawerOpen(false);
          navigate("/auth");
        }}
        onSignupClick={() => {
          setDrawerOpen(false);
          navigate("/auth");
        }}
      />
    </>
  );
}
