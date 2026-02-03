import { SEOHead } from "@/components/SEOHead";
import { Services } from "./Services";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";
import { useLocation } from "react-router-dom";

export function ServicesWithSEO() {
  const location = useLocation();
  const canonicalUrl = createCanonicalUrl(location.pathname);
  
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" }
  ]);

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Trading Education Services",
    "description": "Professional trading education services including market insights, mentorship, and community learning",
    "itemListElement": [
      {
        "@type": "Service",
        "position": 1,
        "name": "Market Insights & Trade Ideas",
        "description": "Educational examples of Forex, Gold & Crypto market setups with step-by-step illustrations",
        "url": "/signals-tools",
        "provider": {
          "@type": "Organization",
          "name": "KenneDyne spot"
        }
      },
      {
        "@type": "Service",
        "position": 2,
        "name": "101 Mentorship",
        "description": "Personalized coaching tailored to your knowledge level with institutional-inspired strategies",
        "url": "/mentorship",
        "provider": {
          "@type": "Organization",
          "name": "KenneDyne spot"
        }
      },
      {
        "@type": "Service",
        "position": 3,
        "name": "Traders in the Zone",
        "description": "Global community for traders with weekly Q&A sessions and DRIVE framework training",
        "url": "/services/learn",
        "provider": {
          "@type": "Organization",
          "name": "KenneDyne spot"
        }
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, servicesSchema]
  };

  return (
    <>
      <SEOHead
        title="Services – Professional Trading Education | KenneDyne spot"
        description="Structured trading services: market insights, 1-on-1 mentorship, and a community-driven learning experience powered by the DRIVE framework."
        keywords="trading services, forex education, trading mentorship, market insights, trading community, DRIVE framework, institutional trading"
        canonical={canonicalUrl}
        schema={combinedSchema}
      />
      <Services />
    </>
  );
}
