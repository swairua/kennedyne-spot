import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { generateFAQSchema } from "@/content/faqs";
import { driveFullName } from "@/content/drive";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from '@/i18n';
import { createCanonicalUrl } from "@/utils/seoHelpers";
import FAQs from "./FAQs";

// Fallback schema
const fallbackFaqSchema = generateFAQSchema();

const FAQPageWithSEO = () => {
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);
  const [faqSchema, setFaqSchema] = useState(fallbackFaqSchema);
  const { language, t } = useI18n();

  useEffect(() => {
    const buildSchemaFromDB = async () => {
      try {
        // Simplified fetch - get all published FAQs
        const { data, error } = await supabase
          .from('faqs')
          .select('question, answer')
          .eq('published', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching FAQs for schema:', error);
          return;
        }

        const rows = data as Array<{ question: string; answer: string }>;
        
        if (rows && rows.length > 0) {
          const dynamicSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": rows.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
            }))
          };
          setFaqSchema(dynamicSchema);
        }
      } catch (error) {
        console.error('Error building FAQ schema from DB:', error);
        // Keep fallback schema
      }
    };

    buildSchemaFromDB();
  }, [language]);

  return (
    <>
      <SEOHead
        title={t('faqs_seo_title')}
        description={t('faqs_seo_description')}
        keywords={t('faqs_seo_keywords')}
        canonical={canonical}
        schema={faqSchema}
      />
      <FAQs />
    </>
  );
};

export default FAQPageWithSEO;
