import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { path: "/app", label: t("bottomnav.map") },
    { path: "/app/report", label: t("bottomnav.report") },
    { path: "/app/walk", label: t("bottomnav.walk") },
    { path: "/app/safe-spaces", label: t("bottomnav.places") },
    { path: "/app/profile", label: t("bottomnav.account") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/20">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/app" && location.pathname === "/app/map");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`py-4 px-3 text-xs tracking-wide transition-colors ${
                isActive 
                  ? "text-foreground font-medium" 
                  : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
