import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { Moon, Sun, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isAppRoute = location.pathname.startsWith("/app");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotificationCount();
      // Refresh notification count every 30 seconds
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotificationCount = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.getNotifications(true); // Only get unread count
      setNotificationCount(response.unreadCount);
    } catch (error) {
      // Silently fail for notification count
      console.error("Failed to load notification count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const languages = [
    { code: "en" as const, label: "English" },
    { code: "fr" as const, label: "Français" },
    { code: "ar" as const, label: "العربية" },
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="/enazeda.svg" 
              alt="enazeda" 
              className="h-6 sm:h-7 w-auto"
            />
          </Link>
          
          <nav className="flex items-center gap-3 sm:gap-4">
            {!isAppRoute && (
              <>
                <Link 
                  to="/app" 
                  className="hidden sm:block text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {t("nav.map")}
                </Link>
                <Link 
                  to="/app/report" 
                  className="hidden sm:block text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {t("nav.report")}
                </Link>
              </>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-card"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-foreground/70 hover:text-foreground transition-colors px-2 py-1">
                  {languages.find(l => l.code === language)?.label || "EN"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/app/profile/notifications" 
                  className="relative p-2 text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-card"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Link>
                <Link 
                  to="/app/profile" 
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {user?.email || (user?.phone ? `+216 ${user.phone}` : "") || t("nav.profile")}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {t("nav.signout")}
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                {t("nav.signin")}
              </Link>
            )}
            {!isAppRoute && !isAuthenticated && (
              <Link to="/app">
                <button className="hidden sm:inline-flex items-center justify-center h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {t("nav.getstarted")}
                </button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
