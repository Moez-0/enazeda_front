import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettings {
  profileVisible: boolean;
  locationSharing: boolean;
  anonymousReports: boolean;
  dataCollection: boolean;
}

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisible: false,
    locationSharing: true,
    anonymousReports: true,
    dataCollection: true,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("enazeda_privacy");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("enazeda_privacy", JSON.stringify(newSettings));
  };

  const handleDownloadData = () => {
    // Simulate data download
    const userData = {
      user,
      contacts: JSON.parse(
        localStorage.getItem("enazeda_emergency_contacts") || "[]"
      ),
      guardians: JSON.parse(localStorage.getItem("enazeda_guardians") || "[]"),
      reports: JSON.parse(localStorage.getItem("enazeda_reports") || "[]"),
      walks: JSON.parse(localStorage.getItem("enazeda_walks") || "[]"),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enazeda-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("privacy.download.title"),
      description: t("privacy.download.desc"),
    });
  };

  const handleDeleteAccount = () => {
    if (
      !confirm(
        t("privacy.delete.confirm") ||
          "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    // Clear all user data
    localStorage.removeItem("enazeda_user");
    localStorage.removeItem("enazeda_emergency_contacts");
    localStorage.removeItem("enazeda_guardians");
    localStorage.removeItem("enazeda_reports");
    localStorage.removeItem("enazeda_walks");
    localStorage.removeItem("enazeda_notifications");
    localStorage.removeItem("enazeda_privacy");

    logout();
    navigate("/");
    toast({
      title: t("privacy.delete.title"),
      description: t("privacy.delete.desc"),
    });
  };

  const privacyOptions = [
    {
      key: "profileVisible" as keyof PrivacySettings,
      label: t("privacy.profile.title"),
      desc: t("privacy.profile.desc"),
      icon: Eye,
    },
    {
      key: "locationSharing" as keyof PrivacySettings,
      label: t("privacy.location.title"),
      desc: t("privacy.location.desc"),
      icon: Eye,
    },
    {
      key: "anonymousReports" as keyof PrivacySettings,
      label: t("privacy.anonymous.title"),
      desc: t("privacy.anonymous.desc"),
      icon: EyeOff,
    },
    {
      key: "dataCollection" as keyof PrivacySettings,
      label: t("privacy.data.title"),
      desc: t("privacy.data.desc"),
      icon: Eye,
    },
  ];

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/app/profile")}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-foreground">
              {t("profile.privacy")}
            </h1>
            <p className="text-xs text-foreground/80 mt-1">
              {t("profile.privacy.desc")}
            </p>
          </div>
        </div>

        <div className="space-y-0 border border-border/30 divide-y divide-border/30 bg-card rounded-lg overflow-hidden mb-6">
          {privacyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="w-4 h-4 text-foreground/60" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {option.label}
                    </p>
                    <p className="text-xs text-foreground/80 mt-1">
                      {option.desc}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={(e) =>
                    updateSetting(option.key, e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border/30 bg-background text-primary focus:ring-primary"
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleDownloadData}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("privacy.download.button")}
          </Button>

          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("privacy.delete.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
