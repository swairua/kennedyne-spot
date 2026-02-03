import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RiskDisclaimerBar } from "@/components/RiskDisclaimerBar";
import { createCanonicalUrl } from "@/utils/seoHelpers";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Use | KenneDyne spot"
        description="Terms of use for KenneDyne spot trading education platform"
        canonical={createCanonicalUrl('/terms-of-use')}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="fluid-h1 mb-8 text-foreground dark:text-white">Terms of Use</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Educational Purpose</h2>
            <p className="fluid-body">
              KenneDyne spot provides educational content and mentorship for trading education purposes only. 
              All content, strategies, and advice are for educational purposes and should not be considered as 
              financial advice or recommendations to buy or sell any financial instruments.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Risk Acknowledgment</h2>
            <p className="fluid-body">
              Trading in Forex and CFDs involves substantial risk of loss and is not suitable for all investors. 
              Past performance does not guarantee future results. You should carefully consider whether trading 
              is appropriate for you in light of your experience, objectives, financial resources, and circumstances.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">No Guarantees</h2>
            <p className="fluid-body">
              We make no representations or warranties about the accuracy, completeness, or suitability of any 
              educational content. Trading results may vary and there are no guarantees of profit.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Affiliate Relationships</h2>
            <p className="fluid-body">
              We may receive compensation from partner brokers when you open an account through our referral links. 
              This does not affect the cost of services to you but helps support our educational content creation.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Limitation of Liability</h2>
            <p className="fluid-body">
              KenneDyne spot shall not be liable for any direct, indirect, incidental, or consequential 
              damages arising from the use of our educational content or services.
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

export default TermsOfUse;
