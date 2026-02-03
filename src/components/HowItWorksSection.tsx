import { CheckCircle, ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import happyForexTrader from "@/assets/happy-forex-trader.jpg";
import { LINKS, getExternalLinkProps } from "@/constants/links";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useI18n } from '@/i18n';

export function HowItWorksSection() {
  const { content } = useSiteContent();
  const { t } = useI18n();
  const { title, subtitle, steps } = content.howItWorks;

  return (
    <section className="py-16 lg:py-20 bg-background relative overflow-hidden content-visibility-auto">
      <div className="absolute inset-0 bg-gradient-hero opacity-15"></div>
      
      {/* Forex Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      </div>
      
      <div className="container px-4 relative">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-20">
            <h2 className="fluid-h2 mb-6">
              <span className="text-primary">{title}</span>
            </h2>
            <p className="fluid-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Timeline Steps */}
            <div className="lg:col-span-2 space-y-8">
              {steps.map((step, index) => (
                <article
                  key={index}
                  className="group relative"
                >
                  {/* Timeline Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>
                  )}
                  
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-button">
                        <span className="text-white font-bold text-lg">{step.number}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowDown className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 text-primary animate-bounce" />
                      )}
                    </div>
                    
                    <div className="flex-1 glass-card p-4 hover:shadow-elevation transition-all duration-500">
                      <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      
                      {index === 0 && (
                        <div className="mt-4">
                          <Button asChild size="sm" className="font-semibold">
                            <a
                              {...getExternalLinkProps(LINKS.exness.signup)}
                              aria-label="Create your Exness account (opens in new tab)"
                            >
                              {t('create_exness_account')}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {step.features && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t('key_benefits')}</h4>
                          <div className="grid gap-2">
                            {step.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Professional Trader Image */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <div className="glass-card p-6 text-center space-y-6">
                <div className="aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-xl shadow-elevation">
                  <img 
                    src={happyForexTrader} 
                    alt="Successful Happy Forex Trader"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    decoding="async"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {t('your_success_story')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('success_story_paragraph')}
                  </p>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="inline-flex items-center justify-center glass-card px-3 py-2 text-sm text-primary font-semibold">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      {t('free_setup')}
                    </div>
                    <div className="inline-flex items-center justify-center glass-card px-3 py-2 text-sm text-accent font-semibold">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      {t('proven_results')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
