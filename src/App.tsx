import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FacebookAdsPage from "./pages/FacebookAdsPage";
import WebDevelopmentPage from "./pages/WebDevelopmentPage";
import GraphicsDesignPage from "./pages/GraphicsDesignPage";
import VideoEditingPage from "./pages/VideoEditingPage";
import MotionGraphicsPage from "./pages/MotionGraphicsPage";
import LandingPageDesignPage from "./pages/LandingPageDesignPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/facebook-ads" element={<FacebookAdsPage />} />
          <Route path="/web-development" element={<WebDevelopmentPage />} />
          <Route path="/graphics-design" element={<GraphicsDesignPage />} />
          <Route path="/video-editing" element={<VideoEditingPage />} />
          <Route path="/motion-graphics" element={<MotionGraphicsPage />} />
          <Route path="/landing-page" element={<LandingPageDesignPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
