import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
