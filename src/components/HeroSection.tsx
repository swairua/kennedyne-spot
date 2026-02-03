import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { trackEvent } from "@/components/GTMProvider";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import tradingWorkspace from "@/assets/trading-workspace.jpg";
import traderWorkspaceHero from "@/assets/trader-workspace-hero.jpg";
import forexEducationHero from "@/assets/forex-education-hero.jpg";
import forexBlogHero from "@/assets/forex-blog-hero.jpg";
import forexMentorshipHero from "@/assets/forex-mentorship-hero.jpg";
import { LINKS, getInternalLinkProps } from "@/constants/links";

export function HeroSection() {
  const { content } = useSiteContent();
  const { hero } = content;

  const heroImages = React.useMemo(() => [
    tradingWorkspace,
    traderWorkspaceHero,
    forexEducationHero,
    forexBlogHero,
    forexMentorshipHero,
  ], []);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  // Preload next hero image to avoid flashing during transition
  const nextImageIndex = (current + 1) % heroImages.length;

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" role="banner" aria-label="Hero section">
      {/* Enhanced Background with Premium Effects */}
      <div className="absolute inset-0 z-0">
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>

        {/* Hero Background Slider - render only the current image to avoid loading all images at once */}
        <div className="absolute inset-0">
          <img
            src={heroImages[current]}
            alt="Hero background image"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center hero-image transition-opacity duration-1000 opacity-100"
            loading={current === 0 ? 'eager' : 'lazy'}
            width={1920}
            height={1080}
            aria-hidden={false}
            decoding="async"
          />
        </div>

        {/* Refined Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-hero-premium"></div>

        {/* Additional Mobile Overlay for Better Legibility */}
        <div className="absolute inset-0 bg-black/20 sm:bg-transparent"></div>

        {/* Grain Texture */}
        <div className="absolute inset-0 grain-texture opacity-[0.015]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-24 pb-16 on-hero">
        <div className="space-y-8">
          {/* Trust Badge with Premium Animation */}
          <div className="hero-badge-enter inline-flex items-center glass-card rounded-full px-6 py-3 text-sm shadow-glass border border-white/20 backdrop-blur-md">
            {hero.badge}
          </div>
          
          {/* Main Headline */}
          <h1 className="hero-headline-enter fluid-h1 leading-[1.1] sm:leading-[1.1] text-balance on-hero text-shadow-hero" dangerouslySetInnerHTML={{ __html: hero.headline }} />

          {/* Subheadline */}
          <p className="hero-subheader-enter text-hero-body max-w-3xl mx-auto leading-relaxed text-shadow-hero" dangerouslySetInnerHTML={{ __html: hero.subheadline }} />

          {/* Premium CTAs */}
          <div className="hero-ctas-enter flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button
              size="lg"
              variant="hero"
              className="min-w-[140px] sm:min-w-[200px] md:min-w-[220px] px-4 sm:px-6 md:px-8 group"
              onClick={() => trackEvent('hero_cta_start_learning')}
              asChild
            >
              <a {...getInternalLinkProps(LINKS.internal.strategy)} className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {hero.cta1}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="glass"
              className="min-w-[140px] sm:min-w-[200px] md:min-w-[220px] px-4 sm:px-6 md:px-8 group"
              onClick={() => trackEvent('hero_cta_start_trading')}
              asChild
            >
              <a href={LINKS.exness.signup} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center gap-2">
                Start Trading
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>

          {/* Trust Indicators styled as cards matching provided image */}
          <div className="hero-trust-enter pt-8">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {hero.trustIndicators.map((t, i) => (
                <div key={i} className="rounded-xl bg-white/8 border border-white/20 backdrop-blur-md px-6 py-6 md:px-8 md:py-6 shadow-glass min-w-[160px] text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-blue-500 leading-none">{t.value}</div>
                  <div className="text-sm md:text-base text-white/90 mt-1">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
      <Helmet>
        {/* Preload next hero image to smooth transitions */}
        <link rel="preload" as="image" href={heroImages[nextImageIndex]} />
        {/* Prefetch other hero images for faster carousel transitions */}
        {heroImages.map((img, idx) => {
          if (idx !== current && idx !== nextImageIndex) {
            return <link key={`prefetch-${idx}`} rel="prefetch" as="image" href={img} />;
          }
          return null;
        })}
      </Helmet>
    </>
  );
}
