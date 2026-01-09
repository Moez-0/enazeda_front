import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">{t("notfound.title")}</h1>
          <p className="mb-4 text-xl text-foreground/90">{t("notfound.message")}</p>
          <a href="/" className="text-foreground underline hover:text-foreground/80">
            {t("notfound.home")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
