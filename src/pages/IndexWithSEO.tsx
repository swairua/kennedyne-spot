import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { createCanonicalUrl } from "@/utils/seoHelpers";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import WhyExnessSection from "@/components/WhyExnessSection";
import { ServicesSection } from "@/components/ServicesSection";
import { DriveStrategySection } from "@/components/DriveStrategySection";
import { DriveCallToActionSection } from "@/components/DriveCallToActionSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TransformCTASection } from "@/components/TransformCTASection";
import { BlogPreviewSection } from "@/components/BlogPreviewSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StructuredData } from "@/components/StructuredData";
import { RiskDisclaimerBar } from "@/components/RiskDisclaimerBar";
import tradingWorkspace from "@/assets/trading-workspace.jpg";

const IndexWithSEO = () => {
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  return (
    <>
      <SEOHead
        title="KenneDyne spot | Professional Forex Education & DRIVE Strategy"
        description="Master institutional trading concepts with our structured education program and proven DRIVE framework. Professional forex mentorship, risk management, and systematic trading education."
        keywords="institutional trading education, forex mentorship, DRIVE strategy, trading psychology, risk management, smart money concepts"
        canonical={canonical}
        lcpImage={tradingWorkspace}
        lcpPreloads={[
          { href: tradingWorkspace, media: "(min-width: 1024px)" },
          { href: tradingWorkspace, media: "(max-width: 1023px)" }
        ]}
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main id="main-content">
          <StructuredData />
          <HeroSection />
          <WhyExnessSection />
          <ServicesSection />
          <DriveStrategySection />
          <DriveCallToActionSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <TransformCTASection />
          <BlogPreviewSection />
          <FinalCTASection />
        </main>
        <Footer />
        <WhatsAppButton />
        <RiskDisclaimerBar />
      </div>
    </>
  );
};

export default IndexWithSEO;
