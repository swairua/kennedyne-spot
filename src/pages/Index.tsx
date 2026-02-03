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

const Index = () => {
  console.log('Index component: Starting to render');
  return (
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
  );
};

export default Index;
