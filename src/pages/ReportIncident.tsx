import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const ReportIncident = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to Tunis coordinates if geolocation fails
          setLocation({ lat: 36.8065, lng: 10.1815 });
        }
      );
    } else {
      setLocation({ lat: 36.8065, lng: 10.1815 });
    }
  }, []);
  
  const incidentTypes = [
    { id: "verbal", label: t("report.verbal"), description: t("report.verbal.desc") },
    { id: "physical", label: t("report.physical"), description: t("report.physical.desc") },
    { id: "stalking", label: t("report.stalking"), description: t("report.stalking.desc") },
    { id: "assault", label: t("report.assault"), description: t("report.assault.desc") },
  ];

  const handleSubmit = async () => {
    if (!selectedType) {
      toast({
        title: t("report.select"),
        description: t("report.select.desc"),
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please enable location services to submit a report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isAuthenticated) {
        // Submit to backend
        await api.createReport({
          type: selectedType as "verbal" | "physical" | "stalking" | "assault",
          location,
          description: note || undefined,
          isAnonymous: true,
        });
      } else {
        // Fallback to localStorage if not authenticated
        const reports = JSON.parse(localStorage.getItem("enazeda_reports") || "[]");
        reports.push({
          id: Date.now().toString(),
          type: selectedType,
          description: note,
          location: { lat: location.lat, lng: location.lng },
          date: new Date().toISOString(),
        });
        localStorage.setItem("enazeda_reports", JSON.stringify(reports));
      }

      setIsSubmitted(true);
      toast({
        title: t("report.submitted"),
        description: t("report.thankyou.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-foreground/80 mb-2">{t("report.submitted")}</p>
          <h2 className="text-xl font-medium mb-4 text-foreground">{t("report.thankyou")}</h2>
          <p className="text-sm text-foreground/90 mb-8">
            {t("report.thankyou.desc")}
          </p>
          <Button
            variant="hero"
            onClick={() => {
              setIsSubmitted(false);
              setSelectedType(null);
              setNote("");
            }}
          >
            {t("report.another")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-xs text-foreground/80 mb-1">{t("report.title")}</p>
          <h1 className="text-xl font-medium text-foreground">{t("report.what")}</h1>
        </div>

        <div className="space-y-2 mb-8">
          {incidentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`w-full text-left p-4 border transition-colors ${
                selectedType === type.id
                  ? "border-foreground bg-secondary"
                  : "border-border/30 hover:border-foreground/50 bg-card"
              }`}
            >
              <p className="text-sm font-medium mb-0.5 text-foreground">{type.label}</p>
              <p className="text-xs text-foreground/80">{type.description}</p>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-foreground/80">{t("report.location")}</p>
            <p className="text-xs text-foreground">{t("report.using")}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/80">{t("report.time")}</p>
            <p className="text-xs text-foreground">{new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-foreground/80 mb-2">{t("report.details")}</p>
          <Textarea
            placeholder={t("report.placeholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] bg-secondary border-border resize-none text-sm"
          />
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("report.submitting") : t("report.submit")}
        </Button>

        <p className="text-center text-xs text-foreground/80 mt-4">
          {t("report.anonymous")}
        </p>
      </div>
    </div>
  );
};

export default ReportIncident;
