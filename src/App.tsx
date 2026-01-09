import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppLayout from "./components/AppLayout";
import SafetyMap from "./pages/SafetyMap";
import ReportIncident from "./pages/ReportIncident";
import WalkWithMe from "./pages/WalkWithMe";
import SafeSpaces from "./pages/SafeSpaces";
import Profile from "./pages/Profile";
import EmergencyContacts from "./pages/EmergencyContacts";
import TrustedGuardians from "./pages/TrustedGuardians";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import PrivacySettings from "./pages/PrivacySettings";
import GuardianView from "./pages/GuardianView";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* App routes with bottom navigation */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<SafetyMap />} />
                <Route path="map" element={<SafetyMap />} />
                <Route path="report" element={<ReportIncident />} />
                <Route path="walk" element={<WalkWithMe />} />
                <Route path="safe-spaces" element={<SafeSpaces />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/contacts" element={<EmergencyContacts />} />
                <Route path="profile/guardians" element={<TrustedGuardians />} />
                <Route path="profile/history" element={<History />} />
                <Route path="profile/notifications" element={<Notifications />} />
                <Route path="profile/privacy" element={<PrivacySettings />} />
                <Route path="guardian" element={<GuardianView />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
