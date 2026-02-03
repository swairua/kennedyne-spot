import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { RiskDisclaimerBar } from "@/components/RiskDisclaimerBar";
import { createCanonicalUrl } from "@/utils/seoHelpers";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy | KenneDyne spot"
        description="Privacy policy for KenneDyne spot trading education platform"
        canonical={createCanonicalUrl('/privacy-policy')}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="fluid-h1 mb-8 text-foreground dark:text-white">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Information We Collect</h2>
            <p className="fluid-body">
              We collect information you provide directly to us, such as when you contact us through WhatsApp, 
              email, or our website forms. This may include your name, email address, phone number, and any 
              messages you send to us.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">How We Use Your Information</h2>
            <p className="fluid-body">
              We use the information we collect to provide, maintain, and improve our trading education services, 
              respond to your inquiries, and send you relevant educational content and updates about our programs.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Information Sharing</h2>
            <p className="fluid-body">
              We do not sell, trade, or otherwise transfer your personal information to third parties without 
              your consent, except as described in this privacy policy. We may share information with our 
              partner broker Exness when you choose to open an account through our referral links.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Data Security</h2>
            <p className="fluid-body">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="fluid-h2 mb-4 text-foreground dark:text-white">Contact Us</h2>
            <p className="fluid-body">
              If you have any questions about this Privacy Policy, please contact us via WhatsApp at +254726529166 
              or through our website contact form.
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

export default PrivacyPolicy;
