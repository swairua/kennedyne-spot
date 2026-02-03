import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { LINKS, getExternalLinkProps } from "@/constants/links";
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  ChevronDown,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useI18n } from '@/i18n';

const WhyExnessSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { content } = useSiteContent();
  const { t } = useI18n();

  const benefits = [
    {
      icon: Shield,
      title: t('why_exness_benefit1_title'),
      description: t('why_exness_benefit1_desc'),
      highlight: t('why_exness_benefit1_highlight')
    },
    {
      icon: CreditCard,
      title: t('why_exness_benefit2_title'),
      description: t('why_exness_benefit2_desc'),
      highlight: t('why_exness_benefit2_highlight')
    },
    {
      icon: TrendingUp,
      title: t('why_exness_benefit3_title'),
      description: t('why_exness_benefit3_desc'),
      highlight: t('why_exness_benefit3_highlight')
    }
  ];

  const comparisonData = [
    { feature: "Regulation", exness: "Multi-jurisdiction (FCA, CySEC, FSCA, FSC, CMA)", others: "Varies by broker", advantage: true },
    { feature: "Account Types", exness: "5+ options (Standard, Cent, Pro, Zero, Raw)", others: "Usually 2–3", advantage: true },
    { feature: "Minimum Deposit", exness: "From $10", others: "Often higher (from $100+)", advantage: true },
    { feature: "Spreads & Fees", exness: "From 0.0 pip + low commission", others: "May have wider spreads", advantage: true },
    { feature: "Withdrawals", exness: "Instant, no fees", others: "May involve delays/charges", advantage: true },
    { feature: "Leverage", exness: "Flexible up to 1:2000*", others: "Often capped 1:30–1:500", advantage: true },
    { feature: "Trading Platforms", exness: "MT4, MT5, Web, Mobile, VPS, Copy Trading", others: "Limited options", advantage: true },
    { feature: "Customer Support", exness: "24/7 multilingual support", others: "Limited availability", advantage: true },
    { feature: "Education Resources", exness: "Advanced learning materials", others: "Basic resources", advantage: true },
    { feature: "Account Fees", exness: "No inactivity or funding fees", others: "Extra charges may apply", advantage: true }
  ];

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden section-optimize">
      {/* Theme-aligned backdrop */}
      <div className="absolute inset-0 bg-muted/20"></div>
      <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
      
      <div className="container px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16 lg:mb-20 animate-fade-in-up">
            <Badge className="mb-6 px-6 py-3 text-sm font-semibold bg-primary/10 border-primary/20 text-primary shadow-sm">
              {t('why_exness_badge')}
            </Badge>
            <h2 className="fluid-h2 mb-8 text-balance font-display">
              {t('why_exness_heading_prefix')}{" "}
              <span className="text-primary font-bold text-shadow-hero">
                {t('why_exness_heading_accent')}
              </span>
            </h2>
            <p className="fluid-body max-w-3xl mx-auto text-muted-foreground/90 leading-relaxed">
              {t('why_exness_intro')}
            </p>
          </div>

          {/* Enhanced Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 lg:mb-20">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group hover-scale glass-card border-border/30 shadow-professional relative overflow-hidden animate-fade-in-up backdrop-blur-sm"
                style={{ "--stagger": index } as React.CSSProperties}
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-8 text-center relative">
                  {/* Enhanced icon with ring */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/15 transition-all duration-300 shadow-lg">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 transition-colors"></div>
                    <benefit.icon className="w-10 h-10 text-primary transition-colors" />
                  </div>
                  
                  {/* Premium chip */}
                  <Badge variant="secondary" className="mb-6 font-semibold px-4 py-1.5 text-xs uppercase tracking-wide shadow-sm">
                    {benefit.highlight}
                  </Badge>
                  
                  <h3 className="fluid-h4 mb-4 text-foreground font-display font-semibold transition-colors">{benefit.title}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Comparison Table */}
          <div className="animate-fade-in-up" style={{ "--stagger": 3 } as React.CSSProperties}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className="text-center mb-10">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="glass" 
                    size="lg"
                    className="group px-10 py-5 h-auto bg-card/30 border-primary/20 hover:bg-card/50 hover:border-primary/40 transition-all shadow-professional backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-lg font-semibold text-foreground">
                        {isOpen ? t('why_exness_hide_comparison') : t('why_exness_see_comparison')}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-all duration-300 text-primary ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-0">
                <Card className="glass-card border-border/30 overflow-hidden shadow-professional backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/40 bg-muted/40">
                          <th className="text-left p-6 font-bold text-foreground text-base">{t('why_exness_table_feature')}</th>
                          <th className="text-left p-6 font-bold text-primary text-base">Exness</th>
                          <th className="text-left p-6 font-semibold text-muted-foreground text-base">{t('why_exness_table_others')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((row, index) => (
                          <tr 
                            key={index} 
                            className="border-b border-border/20 hover:bg-primary/5 transition-all duration-300"
                          >
                            <td className="p-6 font-semibold text-foreground/90 text-sm">{row.feature}</td>
                            <td className="p-6">
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-foreground font-medium text-sm leading-relaxed">{row.exness}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-muted-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <XCircle className="w-3 h-3 text-muted-foreground/60" />
                                </div>
                                <span className="text-muted-foreground/80 text-sm leading-relaxed">{row.others}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Enhanced Disclaimer */}
                  <div className="p-6 bg-muted/30 border-t border-border/20">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">
                        <strong>{t('risk_disclaimer_label')}</strong> {t('why_exness_risk_disclaimer')}
                      </p>
                    </div>
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Enhanced Call to Action */}
          <div className="text-center mt-16 lg:mt-20 animate-fade-in-up" style={{ "--stagger": 4 } as React.CSSProperties}>
            <div className="max-w-2xl mx-auto">
              <h3 className="fluid-h3 mb-4 font-display text-foreground">{t('why_exness_cta_title')}</h3>
              <p className="text-muted-foreground/80 mb-8 leading-relaxed">
                {t('why_exness_cta_subtitle')}
              </p>
              
              <Button 
                variant="default"
                size="lg" 
                className="group px-10 py-5 h-auto text-lg font-bold transition-all"
                asChild
              >
                <a 
                  {...getExternalLinkProps(LINKS.exness.signup)}
                >
                  <span className="mr-3">{t('why_exness_cta_button')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>• {t('why_exness_bullet_no_fees')}</span>
                <span>• {t('why_exness_bullet_instant_setup')}</span>
                <span>• {t('why_exness_bullet_premium_support')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyExnessSection;
