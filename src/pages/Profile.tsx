import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
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
  
  const menuItems = [
    { 
      label: t("profile.contacts"), 
      description: t("profile.contacts.desc"),
      path: "/app/profile/contacts"
    },
    { 
      label: t("profile.guardians"), 
      description: t("profile.guardians.desc"),
      path: "/app/profile/guardians"
    },
    { 
      label: "Monitor Active Walks", 
      description: "View and monitor walks where you're a guardian",
      path: "/app/guardian"
    },
    { 
      label: t("profile.history"), 
      description: t("profile.history.desc"),
      path: "/app/profile/history"
    },
    { 
      label: t("profile.notifications"), 
      description: t("profile.notifications.desc"),
      path: "/app/profile/notifications",
      badge: notificationCount > 0 ? notificationCount : undefined,
    },
    { 
      label: t("profile.language"), 
      description: language === "en" ? "English" : language === "fr" ? "Français" : "العربية",
      path: null,
      onClick: () => {
        // Language toggle logic can be added here if needed
      }
    },
    { 
      label: t("profile.privacy"), 
      description: t("profile.privacy.desc"),
      path: "/app/profile/privacy"
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <p className="text-xs text-foreground/80 mb-1">{t("profile.title")}</p>
            <h1 className="text-xl font-medium text-foreground">{t("profile.notsigned")}</h1>
          </div>

          <Link to="/auth">
            <Button variant="hero" size="lg" className="w-full mb-8">
              {t("profile.signin")}
            </Button>
          </Link>

        <div className="border border-border/30 p-4 mb-8 bg-card rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">{t("profile.trust")}</p>
            <span className="text-foreground/60">—</span>
          </div>
          <p className="text-xs text-foreground/80">
            {t("profile.trust.desc")}
          </p>
        </div>

        <div className="space-y-0 border border-border/30 divide-y divide-border/30 bg-card">
          {menuItems.map((item) => (
            item.path ? (
              <Link
                key={item.label}
                to={item.path}
                className="w-full text-left p-4 hover:bg-secondary transition-colors flex items-center justify-between block"
              >
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-foreground/80">{item.description}</p>
                </div>
                <span className="text-foreground/60">→</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full text-left p-4 hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-foreground/80">{item.description}</p>
                </div>
                <span className="text-foreground/60">→</span>
              </button>
            )
          ))}
        </div>

        <p className="text-center text-xs text-foreground/80 mt-12">
          EnaZeda v1.0
        </p>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-xs text-foreground/80 mb-1">{t("profile.title")}</p>
          <h1 className="text-xl font-medium text-foreground">
            {user?.email || (user?.phone ? `+216 ${user.phone}` : "") || user?.name || t("nav.profile")}
          </h1>
        </div>

        <div className="border border-border/30 p-4 mb-8 bg-card rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">{t("profile.trust")}</p>
            <span className="text-primary font-semibold">—</span>
          </div>
          <p className="text-xs text-foreground/80">
            {t("profile.trust.desc")}
          </p>
        </div>

        <div className="space-y-0 border border-border/30 divide-y divide-border/30 bg-card rounded-lg overflow-hidden">
          {menuItems.map((item) => (
            item.path ? (
              <Link
                key={item.label}
                to={item.path}
                className="w-full text-left p-4 hover:bg-secondary transition-colors flex items-center justify-between block"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">{item.label}</p>
                    {(item as any).badge && (item as any).badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {(item as any).badge > 9 ? "9+" : (item as any).badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80">{item.description}</p>
                </div>
                <span className="text-foreground/60">→</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full text-left p-4 hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-foreground/80">{item.description}</p>
                </div>
                <span className="text-foreground/60">→</span>
              </button>
            )
          ))}
        </div>

        <Button 
          variant="outline" 
          size="lg" 
          className="w-full mt-8"
          onClick={handleLogout}
        >
          {t("profile.signout")}
        </Button>

        <p className="text-center text-xs text-foreground/80 mt-12">
          enazeda v1.0
        </p>
      </div>
    </div>
  );
};

export default Profile;
