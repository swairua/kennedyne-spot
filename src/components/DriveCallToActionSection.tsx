import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Target } from "lucide-react";
import { LINKS } from "@/constants/links";
import { useI18n } from '@/i18n';
import { Link } from "react-router-dom";

export function DriveCallToActionSection() {
  const { t } = useI18n();

  const benefits = [
    {
      icon: TrendingUp,
      title: t('drive_cta_benefit_systematic_title'),
      description: t('drive_cta_benefit_systematic_desc')
    },
    {
      icon: Shield,
      title: t('drive_cta_benefit_risk_title'),
      description: t('drive_cta_benefit_risk_desc')
    },
    {
      icon: Target,
      title: t('drive_cta_benefit_consistent_title'),
      description: t('drive_cta_benefit_consistent_desc')
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-muted/20 relative overflow-hidden" aria-labelledby="drive-cta-heading">
      <div className="absolute inset-0 bg-gradient-hero opacity-15"></div>
      <div className="container px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 id="drive-cta-heading" className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              {t('drive_cta_heading_prefix')} {" "}
              <span className="text-primary">{t('drive_cta_heading_accent')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('drive_cta_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="group text-center space-y-6 animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-button group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="hero" className="hover:scale-105 transition-transform duration-300" asChild>
              <Link to={LINKS.internal.learn}>
                {t('drive_cta_button')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
