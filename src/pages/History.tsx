import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, MapPin, Clock, FileText, Footprints } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "report" | "walk";
  title: string;
  date: string;
  location?: string;
  duration?: string;
  details?: string;
}

const History = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "report" | "walk">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [t, isAuthenticated]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      let reports: any[] = [];
      let walks: any[] = [];

      if (isAuthenticated) {
        // Load from backend
        try {
          const [reportsRes, walksRes] = await Promise.all([
            api.getMyReports().catch((err) => {
              console.error("Error loading reports:", err);
              return { reports: [] };
            }),
            api.getWalkHistory().catch((err) => {
              console.error("Error loading walks:", err);
              return { walks: [] };
            }),
          ]);
          reports = reportsRes?.reports || [];
          walks = walksRes?.walks || [];
          console.log(`Loaded ${reports.length} reports and ${walks.length} walks from backend`);
        } catch (error) {
          console.error("Failed to load history from backend:", error);
          reports = [];
          walks = [];
        }
      } else {
        // Fallback to localStorage
        reports = JSON.parse(localStorage.getItem("enazeda_reports") || "[]");
        walks = JSON.parse(localStorage.getItem("enazeda_walks") || "[]");
      }

      const historyItems: HistoryItem[] = [
        ...reports.map((r: any) => ({
          id: (r.id || r._id || Date.now()).toString(),
          type: "report" as const,
          title: t(`report.${r.type}`) || r.type || "Incident Report",
          date: r.createdAt || r.date || new Date().toISOString(),
          location: typeof r.location === "string" 
            ? r.location 
            : r.location?.address || (r.location ? `${r.location.lat?.toFixed(4)}, ${r.location.lng?.toFixed(4)}` : undefined),
          details: r.description,
        })),
        ...walks
          .filter((w: any) => !w.isActive) // Only show completed walks
          .map((w: any) => {
            const modeKey = w.mode === "friend" ? "walk.modes.friend" : 
                           w.mode === "guardian" ? "walk.modes.guardian" :
                           w.mode === "safe-place" ? "walk.modes.safe_place" : "walk.title";
            return {
              id: (w.id || w._id || Date.now()).toString(),
              type: "walk" as const,
              title: t(modeKey) || "Walk",
              date: w.startTime || new Date().toISOString(),
              duration: w.duration,
              location: typeof w.endLocation === "string" 
                ? w.endLocation 
                : w.endLocation?.address || (w.endLocation ? `${w.endLocation.lat?.toFixed(4)}, ${w.endLocation.lng?.toFixed(4)}` : undefined),
            };
          }),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setHistory(historyItems);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory =
    filter === "all"
      ? history
      : history.filter((item) => item.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              {t("profile.history")}
            </h1>
            <p className="text-xs text-foreground/80 mt-1">
              {t("profile.history.desc")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/30 text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("history.filter.all")}
          </button>
          <button
            onClick={() => setFilter("report")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "report"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/30 text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("history.filter.reports")}
          </button>
          <button
            onClick={() => setFilter("walk")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === "walk"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/30 text-foreground/70 hover:text-foreground"
            }`}
          >
            {t("history.filter.walks")}
          </button>
        </div>

        {isLoading ? (
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <p className="text-sm text-foreground/80">Loading...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <FileText className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
            <p className="text-sm text-foreground/80 mb-2">
              {t("history.empty.title")}
            </p>
            <p className="text-xs text-foreground/60">
              {t("history.empty.desc")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="border border-border/30 p-4 bg-card rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.type === "report"
                        ? "bg-primary/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {item.type === "report" ? (
                      <MapPin className="w-4 h-4 text-primary" />
                    ) : (
                      <Footprints className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-foreground/60" />
                      <p className="text-xs text-foreground/60">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-foreground/60" />
                        <p className="text-xs text-foreground/60">
                          {item.location}
                        </p>
                      </div>
                    )}
                    {item.duration && (
                      <p className="text-xs text-foreground/60 mt-1">
                        {t("walk.duration")}: {item.duration}
                      </p>
                    )}
                    {item.details && (
                      <p className="text-xs text-foreground/80 mt-2 line-clamp-2">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
