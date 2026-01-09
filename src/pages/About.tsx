import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">{t("about.title")}</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("about.mission")}</h2>
              <p className="leading-relaxed">
                {t("about.mission.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("about.movement")}</h2>
              <p className="leading-relaxed">
                {t("about.movement.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("about.how")}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("about.anonymous")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("about.anonymous.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("about.verification")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("about.verification.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("about.support")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("about.support.desc")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("about.privacy")}</h2>
              <p className="leading-relaxed">
                {t("about.privacy.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("about.involved")}</h2>
              <p className="leading-relaxed mb-4">
                {t("about.involved.desc")}
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    {t("about.create")}
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="px-6 py-2 border border-border text-foreground rounded-md hover:bg-card transition-colors">
                    {t("footer.contact")}
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
