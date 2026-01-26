import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import { MobileDrawer } from "./MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "Facebook Ads", href: "#facebook-ads" },
  { label: "Web Development", href: "#web-development" },
  { label: "Graphics Design", href: "#graphics-design" },
  { label: "Video Editing", href: "#video-editing" },
  { label: "Motion Graphics", href: "#motion-graphics" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#contact" },
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "bg-agency-green shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <div className="w-32 h-10 bg-white/20 rounded flex items-center justify-center">
                <span className="text-white font-semibold text-sm">LOGO</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="relative px-3 py-2 text-sm text-white font-medium transition-colors duration-200 hover:text-agency-red group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-agency-red scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
                  </a>
                ))}
              </nav>
            )}

            {/* Auth Buttons - Desktop */}
            {!isMobile && (
              <div className="hidden lg:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLoginOpen(true)}
                  className="border-agency-green bg-transparent text-white hover:bg-agency-green-dark hover:text-white transition-all duration-200"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setSignupOpen(true)}
                  className="bg-agency-red text-white hover:bg-agency-red-dark hover:scale-[1.03] transition-all duration-200"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden text-white hover:bg-white/10"
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
