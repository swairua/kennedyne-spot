import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Users, Settings, ArrowRight } from "lucide-react";
import forexStrategyService from "@/assets/forex-strategy-service.jpg";
import forexMentorshipService from "@/assets/forex-mentorship-service.jpg";
import tradingWorkspace from "@/assets/trading-workspace.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useI18n } from '@/i18n';

const servicesStatic = [
  {
    icon: Settings,
    fallbackTitle: "DRIVE Strategy",
    fallbackDescription: "Learn our systematic 5-step approach to market analysis and trade execution with proper risk management principles.",
    image: forexStrategyService,
    link: "/services/learn"
  },
  {
    icon: Users,
    fallbackTitle: "Mentorship",
    fallbackDescription: "Personal guidance to develop your trading psychology, discipline, and understanding of market structure.",
    image: forexMentorshipService,
    link: "/mentorship"
  },
  {
    icon: Star,
    fallbackTitle: "Risk Management",
    fallbackDescription: "Master position sizing, stop losses, and capital preservation—the foundation of sustainable trading.",
    image: tradingWorkspace,
    link: "/signals-tools"
  }
];

export function ServicesSection() {
  const { content } = useSiteContent();
  const { t } = useI18n();
  const { title, subtitle, items } = content.services;
  const services = servicesStatic.map((s, idx) => ({
    ...s,
    title: items[idx]?.title ?? s.fallbackTitle,
    description: items[idx]?.description ?? s.fallbackDescription,
  }));

  return (
    <section id="services" className="py-16 lg:py-20 bg-muted/10 relative section-optimize">
      <div className="container px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="fluid-h2 text-foreground mb-4">
              {title}
            </h2>
            <p className="fluid-body text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Mobile: Compact List */}
          <div className="block lg:hidden space-y-6">
            {services.map((service, index) => (
              <Link 
                key={index} 
                to={service.link}
                className="group block p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-card/80 transition-all duration-300"
                aria-label={`${t('view_details')}: ${service.title} - ${service.description}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                      {t('view_details')}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Rich Cards */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <Link to={service.link} className="flex-1 flex flex-col" aria-label={`${t('view_details')}: ${service.title}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={`Professional forex ${service.title.toLowerCase()} training`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      decoding="async"
                      width={400}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/30">
                          <service.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <p className="text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">{service.description}</p>
                    <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:text-primary-hover transition-colors">
                      {t('view_details')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
