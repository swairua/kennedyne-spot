import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";
import Contact from "./Contact";

const ContactWithSEO = () => {
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: canonical }
  ]);

  return (
    <>
      <SEOHead
        title="Contact Us - KenneDyne spot | Get Trading Education Support"
        description="Contact our forex education team for questions about the DRIVE strategy, mentorship programs, and institutional trading concepts. WhatsApp and email support available."
        keywords="contact trading education, forex education support, DRIVE strategy contact, trading mentorship contact"
        canonical={canonical}
        schema={breadcrumbSchema}
      />
      <Contact />
    </>
  );
};

export default ContactWithSEO;
