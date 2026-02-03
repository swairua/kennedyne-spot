import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";
import Strategy from "./Strategy";

const StrategyWithSEO = () => {
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "DRIVE Strategy", url: canonical }
  ]);

  const strategySchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    "name": "DRIVE Trading Strategy Course",
    "description": "Learn our systematic DRIVE framework for institutional trading: Define market bias, Read structure, Identify setups, Validate risk, Execute trades.",
    "provider": {
      "@type": "Organization",
      "name": "KenneDyne spot"
    },
    "teaches": ["Trading Strategy", "Risk Management", "Market Analysis", "Trade Execution"],
    "educationalLevel": "Intermediate to Advanced"
  };

  const combinedSchema = {
    "@context": "https://schema.org", 
    "@graph": [breadcrumbSchema, strategySchema]
  };

  return (
    <>
      <SEOHead
        title="DRIVE Strategy - Institutional Trading Framework | KenneDyne spot"
        description="Master our proven DRIVE trading strategy framework: Define, Read, Identify, Validate, Execute. Learn systematic institutional trading concepts and risk management."
        keywords="DRIVE trading strategy, institutional trading framework, forex strategy, trading system, market analysis strategy, risk management framework"
        canonical={canonical}
        schema={combinedSchema}
      />
      <Strategy />
    </>
  );
};

export default StrategyWithSEO;
