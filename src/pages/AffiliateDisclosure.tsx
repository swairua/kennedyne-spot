import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RiskDisclaimerBar } from "@/components/RiskDisclaimerBar";
import { createCanonicalUrl } from "@/utils/seoHelpers";

const AffiliateDisclosure = () => {
  const affiliateSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Affiliate Disclosure",
    "description": "Complete transparency about affiliate relationships and partnerships with trading brokers and service providers",
    "url": createCanonicalUrl('/affiliate-disclosure'),
    "publisher": {
      "@type": "Organization",
      "name": "KenneDyne spot"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Affiliate Disclosure | KenneDyne spot"
        description="Complete disclosure of affiliate relationships with trading brokers. Learn how we maintain transparency and editorial independence while funding free educational content."
        keywords="affiliate disclosure, FTC compliance, transparent affiliate relationships, trading broker partnerships, sponsored links, editorial independence"
        canonical={createCanonicalUrl('/affiliate-disclosure')}
        schema={affiliateSchema}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="fluid-h1 mb-8 text-foreground dark:text-white">Affiliate Disclosure</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Affiliate Relationships</h2>
            <p className="fluid-body">
              KenneDyne spot maintains affiliate relationships with various brokers and service providers 
              in the trading industry. When you click on certain links on our website or open accounts through 
              our referral links, we may receive compensation.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Partner Broker: Exness</h2>
            <p className="fluid-body">
              We have an affiliate relationship with Exness, a regulated broker. When you open an account through 
              our Exness referral links, we may receive a commission. This commission does not increase the cost 
              of services to you but helps support our educational content creation.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Our Commitment to Transparency</h2>
            <p className="fluid-body">
              All affiliate links on our website are clearly marked with "sponsored" or "affiliate" tags. 
              We believe in full transparency about our business relationships and how we fund our educational content.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Editorial Independence</h2>
            <p className="fluid-body">
              Our affiliate relationships do not influence our educational content or recommendations. 
              We maintain editorial independence and only partner with reputable, regulated brokers that 
              we believe offer value to our community.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">No Additional Cost to You</h2>
            <p className="fluid-body">
              Using our affiliate links does not result in any additional cost to you. The commissions we 
              receive are paid by our partners and help us continue providing free educational content.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">FTC Compliance</h2>
            <p className="fluid-body">
              This disclosure is made in accordance with the Federal Trade Commission's guidelines on 
              affiliate marketing and endorsements. We are committed to honest and transparent communication 
              with our community.
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

export default AffiliateDisclosure;
