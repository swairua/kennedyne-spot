import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { driveStepsSimple } from "@/content/drive";
import { Link } from "react-router-dom";
import { LINKS, getExternalLinkProps } from "@/constants/links";
import { useI18n } from '@/i18n';
import React from 'react';

export function DriveStrategySection() {
  const { t } = useI18n();
  const localizedSteps = React.useMemo(() => {
    const map: Record<string, string> = { D: 'direction', R: 'range', I: 'poi', V: 'value_of_risk', E: 'entry' };
    return driveStepsSimple.map((step) => {
      const key = map[step.letter] || '';
      return {
        ...step,
        title: key ? t(`drive_${key}_title`) : step.title,
        description: key ? t(`drive_${key}_desc`) : step.description,
      };
    });
  }, [t]);
  return (
    <section className="py-12 lg:py-20 bg-background relative overflow-hidden section-optimize">
      <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      <div className="container px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="fluid-h2 text-foreground mb-3">
              {t('drive_framework_title')}
            </h2>
            <p className="text-sm text-muted-foreground/80 mb-4 font-medium tracking-wide">
              {t('drive_acronym_full')}
            </p>
            <p className="fluid-body text-muted-foreground max-w-3xl mx-auto">
              {t('drive_framework_description')}
            </p>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-3xl mb-6">
              <video
                autoPlay
                muted
                playsInline
                controls
                preload="metadata"
                className="w-full rounded-lg shadow-lg"
                src="https://cdn.builder.io/o/assets%2Fa0a8da52b13a46b692f489902ea746ed%2Fec3d5fddc4794034b8378f4ee3b85840?alt=media&token=2bcbb705-9fa8-4ee5-9ed2-7e1b4357c026&apiKey=a0a8da52b13a46b692f489902ea746ed"
                aria-label="DRIVE strategy overview video"
              />
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-12">
              {localizedSteps.map((step, index) => (
                <li key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Link 
                    to="/strategy" 
                    className="group relative block p-4 lg:p-6 text-center glass-card hover:shadow-card transition-all duration-300 hover:scale-[1.02] h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-lg"
                    aria-label={`Explore ${step.title}: ${step.description}`}
                  >
                    {/* Connector line for large screens */}
                    {index < driveStepsSimple.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 w-4 h-px bg-gradient-to-r from-primary/30 to-transparent transform -translate-y-1/2 z-10" />
                    )}
                    
                    {/* Enhanced letter badge */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background group-hover:ring-primary/40 group-hover:shadow-xl transition-all duration-300">
                      <span className="relative z-10">{step.letter}</span>
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-colors duration-300" />
                    </div>
                    
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 mt-4 lg:mt-2 group-hover:bg-primary/15 transition-colors duration-300">
                      <step.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-base lg:text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs lg:text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button variant="default" size="lg" className="hover:scale-105 transition-transform duration-300" asChild>
                <Link to="/strategy" aria-label="Explore the detailed DRIVE strategy">
                  {t('explore_drive_playbook')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="hover:scale-105 transition-transform duration-300" asChild>
                <a {...getExternalLinkProps(LINKS.telegram.community)} aria-label="Join our Telegram community">
                  {t('join_on_telegram')}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
