import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, AlertTriangle, MapPin, Footprints, Settings, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Notification {
  id: string;
  type: "panic" | "walk_started" | "walk_ended" | "check_in" | "report" | "system";
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    location?: { lat: number; lng: number };
    userName?: string;
    walkSessionId?: string;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
  walkId?: string;
}

interface NotificationSettings {
  reports: boolean;
  walks: boolean;
  safeSpaces: boolean;
  emergency: boolean;
  community: boolean;
  updates: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    reports: true,
    walks: true,
    safeSpaces: true,
    emergency: true,
    community: false,
    updates: true,
  });

  useEffect(() => {
    if (isAuthenticated && activeTab === "notifications") {
      loadNotifications();
      // Refresh notifications every 10 seconds
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("enazeda_notifications");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const loadNotifications = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast({
        title: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "panic":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "walk_started":
      case "walk_ended":
        return <Footprints className="w-5 h-5 text-primary" />;
      case "check_in":
        return <MapPin className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-foreground/60" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === "panic" && notification.metadata?.walkSessionId) {
      navigate(`/app/guardian`);
    } else if (notification.walkId) {
      navigate(`/app/guardian`);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("enazeda_notifications", JSON.stringify(newSettings));
  };

  const notificationOptions = [
    {
      key: "reports" as keyof NotificationSettings,
      label: t("notifications.reports.title"),
      desc: t("notifications.reports.desc"),
    },
    {
      key: "walks" as keyof NotificationSettings,
      label: t("notifications.walks.title"),
      desc: t("notifications.walks.desc"),
    },
    {
      key: "safeSpaces" as keyof NotificationSettings,
      label: t("notifications.safeSpaces.title"),
      desc: t("notifications.safeSpaces.desc"),
    },
    {
      key: "emergency" as keyof NotificationSettings,
      label: t("notifications.emergency.title"),
      desc: t("notifications.emergency.desc"),
    },
    {
      key: "community" as keyof NotificationSettings,
      label: t("notifications.community.title"),
      desc: t("notifications.community.desc"),
    },
    {
      key: "updates" as keyof NotificationSettings,
      label: t("notifications.updates.title"),
      desc: t("notifications.updates.desc"),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <p className="text-sm text-foreground/80 mb-2">
              Please log in to view notifications
            </p>
            <Button onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/app/profile")}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-medium text-foreground">
              {t("profile.notifications")}
            </h1>
            <p className="text-xs text-foreground/80 mt-1">
              {t("profile.notifications.desc")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors relative ${
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/30 text-foreground/70 hover:text-foreground"
            }`}
          >
            Notifications
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/30 text-foreground/70 hover:text-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "notifications" ? (
          <>
            {unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-2" />
                  Mark all as read
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
                <p className="text-sm text-foreground/80">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
                <Bell className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-foreground/80 mb-2">
                  No notifications
                </p>
                <p className="text-xs text-foreground/60">
                  Your notifications will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`border border-border/30 p-4 bg-card rounded-lg cursor-pointer transition-colors ${
                      !notification.isRead
                        ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.isRead ? "text-foreground" : "text-foreground/80"}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-foreground/70 mt-1">
                              {notification.message}
                            </p>
                            {notification.metadata?.location && (
                              <p className="text-xs text-foreground/60 mt-1">
                                Location: {notification.metadata.location.lat.toFixed(4)}, {notification.metadata.location.lng.toFixed(4)}
                              </p>
                            )}
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-foreground/60">
                            {formatTime(notification.createdAt)}
                          </p>
                          {notification.isRead ? (
                            <Check className="w-3 h-3 text-foreground/40" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-0 border border-border/30 divide-y divide-border/30 bg-card rounded-lg overflow-hidden">
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {option.label}
                  </p>
                  <p className="text-xs text-foreground/80 mt-1">
                    {option.desc}
                  </p>
                </div>
                <Switch
                  checked={settings[option.key]}
                  onCheckedChange={(checked) =>
                    updateSetting(option.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
