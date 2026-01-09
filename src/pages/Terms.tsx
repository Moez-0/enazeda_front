import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">{t("terms.title")}</h1>
          <p className="text-sm text-foreground/60 mb-8">{t("terms.lastupdated")} {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.agreement")}</h2>
              <p className="leading-relaxed">
                {t("terms.agreement.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.use")}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("terms.eligibility")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("terms.eligibility.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("terms.responsibility")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("terms.responsibility.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("terms.acceptable")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("terms.acceptable.desc")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.reports")}</h2>
              <p className="leading-relaxed">
                {t("terms.reports.desc")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70 mt-4">
                <li>{t("terms.reports.list1")}</li>
                <li>{t("terms.reports.list2")}</li>
                <li>{t("terms.reports.list3")}</li>
                <li>{t("terms.reports.list4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.liability")}</h2>
              <p className="leading-relaxed">
                {t("terms.liability.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.modifications")}</h2>
              <p className="leading-relaxed">
                {t("terms.modifications.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("terms.contact")}</h2>
              <p className="leading-relaxed">
                {t("terms.contact.desc")}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
