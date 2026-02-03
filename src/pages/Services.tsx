import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SectionDivider } from "@/components/SectionDivider";
import { DriveStrategySection } from "@/components/DriveStrategySection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { LineChart, BookOpen, Users, CheckCircle, MessageCircle, Target, Shield, Brain, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";
import educationHero from "@/assets/education-hero.jpg";
import signalsService from "@/assets/signals-service.jpg";
import forexMentorshipService from "@/assets/forex-mentorship-service.jpg";
import educationService from "@/assets/education-service.jpg";
import { useI18n } from '@/i18n';

export function Services() {
  const { t } = useI18n();
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: canonical }
  ]);
  const services = [
    {
      title: t('services_card1_title'),
      subtitle: t('services_card1_subtitle'),
      icon: LineChart,
      image: signalsService,
      features: [
        t('services_card1_f1'),
        t('services_card1_f2'),
        t('services_card1_f3')
      ],
      ctaText: t('services_card1_cta'),
      ctaLink: "/signals-tools",
      imageAlt: t('services_card1_alt')
    },
    {
      title: t('services_card2_title'),
      subtitle: t('services_card2_subtitle'),
      icon: BookOpen,
      image: forexMentorshipService,
      features: [
        t('services_card2_f1'),
        t('services_card2_f2'),
        t('services_card2_f3')
      ],
      ctaText: t('services_card2_cta'),
      ctaLink: "/mentorship",
      imageAlt: t('services_card2_alt')
    },
    {
      title: t('services_card3_title'),
      subtitle: t('services_card3_subtitle'),
      icon: Users,
      image: educationService,
      features: [
        t('services_card3_f1'),
        t('services_card3_f2'),
        t('services_card3_f3')
      ],
      ctaText: t('services_card3_cta'),
      ctaLink: "/services/learn",
      imageAlt: t('services_card3_alt')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Services | Professional Trading Education & Mentorship | KenneDyne spot"
        description="Discover our comprehensive trading education services including mentorship programs, educational signals, and the DRIVE Framework for institutional trading."
        keywords="trading education services, forex mentorship, trading signals, DRIVE framework, professional education, trading course"
        canonical={canonical}
        schema={breadcrumbSchema}
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-subtle">
        <div className="absolute inset-0">
          <img 
            src={educationHero} 
            alt="Professional trading education environment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero"></div>
        </div>
        
        <div className="on-hero">
          <div className="relative container px-4 text-center animate-fade-in">
            <Badge variant="outline" className="mb-6 bg-white/10 border-white/30 backdrop-blur-sm">{t('services_badge')}</Badge>
            <h1 className="fluid-h1 leading-[1.1] sm:leading-[1.1] text-balance on-hero text-shadow-hero mb-6">{t('services_hero_title')}</h1>
            <p className="text-hero-body max-w-3xl mx-auto leading-relaxed text-shadow-hero mb-8">{t('services_hero_subtitle')}</p>
            <p className="text-lg max-w-4xl mx-auto mb-8">{t('services_hero_paragraph')}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                variant="outline"
                size="lg"
              >
                <Link to="/mentorship" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t('services_cta_talk_mentor')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <main>
        {/* Services Grid */}
        <section id="services" className="py-20 bg-accent/10">
          <div className="container px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card 
                    key={service.title}
                    className="overflow-hidden shadow-card hover:shadow-elevation transition-all duration-300 animate-fade-in hover-scale group"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-card-overlay opacity-60"></div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {service.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">
                            {service.subtitle}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="mb-6">
                        <p className="text-sm font-medium text-primary mb-3 flex items-center">{t('services_card_features_heading')}</p>
                        <ul className="space-y-3 list-none pl-0">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button
                      asChild
                      variant={index === 1 ? 'hero' : 'outline'}
                      size="lg"
                      className="w-full transition-transform duration-300"
                    >
                      <Link
                        to={service.ctaLink}
                        aria-label={`${service.ctaText} - ${service.title}`}
                        className="flex items-center justify-center gap-2"
                      >
                        {service.ctaText}
                      </Link>
                    </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* DRIVE Strategy Snapshot */}
        <section className="py-16 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
          <div className="container px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h2 className="fluid-h2 text-foreground mb-4">{t('services_drive_title')}</h2>
                <p className="text-lg text-muted-foreground mb-2"><strong>{t('services_drive_acronym')}</strong></p>
                <p className="fluid-body text-muted-foreground">{t('services_drive_desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center justify-center p-4 bg-background/50 rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-foreground">{t('services_drive_benefit1')}</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-background/50 rounded-lg border">
                  <TrendingUp className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-foreground">{t('services_drive_benefit2')}</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-background/50 rounded-lg border">
                  <Shield className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-foreground">{t('services_drive_benefit3')}</span>
                </div>
              </div>

              <Button variant="default" size="lg" className="hover:scale-105 transition-transform duration-300" asChild>
                <Link to="/strategy" aria-label="Explore the complete DRIVE strategy framework">
                  {t('services_explore_framework')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose KenneDyne spot */}
        <section className="py-20 bg-accent/10">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t('services_why_title')}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('services_why_subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center p-6 floating-card">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t('services_why_card1_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('services_why_card1_desc')}</p>
              </Card>
              
              <Card className="text-center p-6 floating-card">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t('services_why_card2_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('services_why_card2_desc')}</p>
              </Card>
              
              <Card className="text-center p-6 floating-card">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t('services_why_card3_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('services_why_card3_desc')}</p>
              </Card>
              
              <Card className="text-center p-6 floating-card">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t('services_why_card4_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('services_why_card4_desc')}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Closing CTA Section */}
        <section className="relative py-20 bg-gradient-subtle overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/60"></div>
          <div className="absolute inset-0 forex-grid-pattern opacity-30"></div>

          <div className="relative container px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white text-shadow-hero">{t('services_next_step_title')}</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 text-shadow-hero">{t('services_next_step_desc')}</p>
            
            {/* Numbered Steps */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <p className="text-white/90"><strong className="text-white">{t('services_step1')}</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <p className="text-white/90"><strong className="text-white">{t('services_step2')}</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <p className="text-white/90"><strong className="text-white">{t('services_step3')}</strong></p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg" className="min-w-[140px] sm:min-w-[200px] md:min-w-[220px] px-4 sm:px-6 md:px-8" aria-label="Start your trading journey">
                <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" aria-label="Start your trading journey link">
                  <MessageCircle className="h-4 w-4" />{t('services_cta_start_journey') }
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[140px] sm:min-w-[200px] md:min-w-[220px] px-4 sm:px-6 md:px-8" aria-label="Explore learning resources">
                <a href="https://institutional-trader.ziratech.com/#/resources" aria-label="Explore learning resources link">
                  {t('services_cta_explore_learning') }
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
