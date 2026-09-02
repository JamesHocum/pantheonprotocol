import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DemoTourProvider } from "@/contexts/DemoTourContext";
import { DemoTour } from "@/components/features/DemoTour";
import "@/styles/era-themes.css";
import "@/styles/acquisition-print.css";
import MatrixRain from "./components/effects/MatrixRain";
import { AcquisitionProvider } from "@/acquisition/store";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AcquisitionHub from "./pages/acquisition/AcquisitionHub";
import AcquisitionBrief from "./pages/acquisition/AcquisitionBrief";
import AcquisitionAdmin from "./pages/acquisition/AcquisitionAdmin";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <DemoTourProvider>
            <AcquisitionProvider>
              <TooltipProvider>
                <MatrixRain />
                <Toaster />
                <Sonner />
                <DemoTour />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/acquire" element={<AcquisitionHub />} />
                  <Route path="/acquire/brief" element={<AcquisitionBrief />} />
                  <Route path="/acquire/admin" element={<AcquisitionAdmin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </AcquisitionProvider>
          </DemoTourProvider>

        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
