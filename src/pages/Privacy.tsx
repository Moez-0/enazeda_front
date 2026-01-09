import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">{t("privacy.title")}</h1>
          <p className="text-sm text-foreground/60 mb-8">{t("privacy.lastupdated")} {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.intro")}</h2>
              <p className="leading-relaxed">
                {t("privacy.intro.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.collect")}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("privacy.account")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("privacy.account.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("privacy.reports")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("privacy.reports.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{t("privacy.location")}</h3>
                  <p className="leading-relaxed text-foreground/70">
                    {t("privacy.location.desc")}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.use")}</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>{t("privacy.use.list1")}</li>
                <li>{t("privacy.use.list2")}</li>
                <li>{t("privacy.use.list3")}</li>
                <li>{t("privacy.use.list4")}</li>
                <li>{t("privacy.use.list5")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.security")}</h2>
              <p className="leading-relaxed">
                {t("privacy.security.desc")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.rights")}</h2>
              <p className="leading-relaxed mb-4">
                {t("privacy.rights.desc")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>{t("privacy.rights.list1")}</li>
                <li>{t("privacy.rights.list2")}</li>
                <li>{t("privacy.rights.list3")}</li>
                <li>{t("privacy.rights.list4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{t("privacy.contact")}</h2>
              <p className="leading-relaxed">
                {t("privacy.contact.desc")}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
