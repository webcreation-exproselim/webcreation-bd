import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { EditModeProvider } from "@/context/EditModeContext";
import ScrollToTop from "@/components/ScrollToTop";
import { EditModeToggle } from "@/components/EditModeToggle";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FacebookAdsPage from "./pages/FacebookAdsPage";
import WebDevelopmentPage from "./pages/WebDevelopmentPage";
import GraphicsDesignPage from "./pages/GraphicsDesignPage";
import VideoEditingPage from "./pages/VideoEditingPage";
import MotionGraphicsPage from "./pages/MotionGraphicsPage";
import LandingPageDesignPage from "./pages/LandingPageDesignPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import ClientDashboard from "./pages/ClientDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import FraudProtectionPage from "./pages/FraudProtectionPage";
import FraudGuardPage from "./pages/FraudGuardPage";
import AboutPage from "./pages/AboutPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContactPage from "./pages/ContactPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <EditModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <EditModeToggle />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/facebook-ads" element={<FacebookAdsPage />} />
              <Route path="/web-development" element={<WebDevelopmentPage />} />
              <Route path="/graphics-design" element={<GraphicsDesignPage />} />
              <Route path="/video-editing" element={<VideoEditingPage />} />
              <Route path="/motion-graphics" element={<MotionGraphicsPage />} />
              <Route path="/landing-page" element={<LandingPageDesignPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/fraud-protection" element={<FraudProtectionPage />} />
              <Route path="/fraud-guard" element={<FraudGuardPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EditModeProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
