import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

const Landing = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
        
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-balance text-foreground">
            {t("landing.hero.title")}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                {t("landing.hero.map")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                {t("landing.hero.getstarted")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Movement Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              {t("landing.movement.title")}
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {t("landing.movement.description")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("landing.movement.data")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.movement.data.desc")}
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("landing.movement.community")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.movement.community.desc")}
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("landing.movement.spaces")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.movement.spaces.desc")}
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("landing.movement.secure")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.movement.secure.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              {t("landing.howitworks.title")}
            </h2>
            <p className="text-base text-foreground/60 max-w-2xl mx-auto">
              {t("landing.howitworks.subtitle")}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">01</div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{t("landing.howitworks.report")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.howitworks.report.desc")}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">02</div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{t("landing.howitworks.visualize")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.howitworks.visualize.desc")}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">03</div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{t("landing.howitworks.walk")}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {t("landing.howitworks.walk.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm text-foreground/60">{t("landing.stats.anonymous")}</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-sm text-foreground/60">{t("landing.stats.support")}</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm text-foreground/60">{t("landing.stats.verified")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30 bg-card/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            {t("landing.cta.title")}
          </h2>
          <p className="text-base text-foreground/70 mb-8 leading-relaxed">
            {t("landing.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                {t("landing.cta.create")}
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                {t("landing.cta.explore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            {t("landing.impact.title")}
          </h2>
          <p className="text-base text-foreground/70 mb-8 max-w-2xl mx-auto">
            {t("landing.impact.subtitle")}
          </p>
          <p className="text-sm text-foreground/60 leading-relaxed max-w-xl mx-auto">
            {t("landing.impact.desc")}
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-base text-foreground/70">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                "{t("landing.testimonials.testimonial1")}"
              </p>
              <p className="text-xs text-foreground/60">— Community Member</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                "{t("landing.testimonials.testimonial2")}"
              </p>
              <p className="text-xs text-foreground/60">— Community Member</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                "{t("landing.testimonials.testimonial3")}"
              </p>
              <p className="text-xs text-foreground/60">— Community Member</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              {t("landing.faq.title")}
            </h2>
            <p className="text-base text-foreground/70">
              {t("landing.faq.subtitle")}
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {t("landing.faq.q1")}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t("landing.faq.a1")}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {t("landing.faq.q2")}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t("landing.faq.a2")}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/30">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {t("landing.faq.q3")}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t("landing.faq.a3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <img 
                src="/enazeda.svg" 
                alt="enazeda" 
                className="h-6 w-auto mb-4"
              />
              <p className="text-xs text-foreground/60 leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("footer.resources")}</h3>
              <div className="flex flex-col gap-2 text-xs text-foreground/60">
                <Link to="/about" className="hover:text-primary transition-colors">{t("footer.about")}</Link>
                <Link to="/contact" className="hover:text-primary transition-colors">{t("footer.contact")}</Link>
                <Link to="/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("footer.resources")}</h3>
              <div className="flex flex-col gap-2 text-xs text-foreground/60">
                <Link to="/app" className="hover:text-primary transition-colors">{t("footer.safetymap")}</Link>
                <Link to="/app/report" className="hover:text-primary transition-colors">{t("footer.report")}</Link>
                <Link to="/app/safe-spaces" className="hover:text-primary transition-colors">{t("footer.safespaces")}</Link>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border/30 text-center text-xs text-foreground/50">
            <p>&copy; {new Date().getFullYear()} enazeda. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
