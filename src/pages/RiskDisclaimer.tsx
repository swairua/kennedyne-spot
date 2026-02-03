import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RiskDisclaimerBar } from "@/components/RiskDisclaimerBar";
import { createCanonicalUrl } from "@/utils/seoHelpers";

const RiskDisclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Risk Disclaimer | KenneDyne spot"
        description="Important risk disclaimer for Forex and CFD trading education"
        canonical={createCanonicalUrl('/risk-disclaimer')}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="fluid-h1 mb-8 text-foreground dark:text-white">Risk Disclaimer</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-8">
            <h2 className="fluid-h3 text-warning mb-4">⚠️ High Risk Warning</h2>
            <p className="fluid-body">
              Trading Forex and CFDs involves substantial risk of loss and is not suitable for all investors. 
              You could lose more than your initial deposit.
            </p>
          </div>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Understanding the Risks</h2>
            <p className="fluid-body">
              Forex and CFD trading carries a high level of risk due to leverage. Leverage can work against you 
              as well as for you. Before deciding to trade foreign exchange or any other financial instrument, 
              you should carefully consider your investment objectives, level of experience, and risk appetite.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Past Performance</h2>
            <p className="fluid-body">
              Past performance is not necessarily indicative of future results. Any trading examples or 
              performance figures shown are for educational purposes only and do not guarantee similar results.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Educational Content Only</h2>
            <p className="fluid-body">
              All content provided by KenneDyne spot is for educational purposes only and should not be 
              considered as investment advice. We do not provide financial advisory services.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Seek Professional Advice</h2>
            <p className="fluid-body">
              Before making any trading decisions, you should seek advice from an independent financial advisor 
              and ensure you fully understand the risks involved.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Regulatory Information</h2>
            <p className="fluid-body">
              Trading may not be legal in all jurisdictions. It is your responsibility to ensure compliance 
              with local laws and regulations in your area of residence.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
      <Footer />
      <RiskDisclaimerBar />
    </div>
  );
};

export default RiskDisclaimer;
