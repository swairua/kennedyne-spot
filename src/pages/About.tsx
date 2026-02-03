import { Footer } from "@/components/Footer";
import { Link, useLocation } from "react-router-dom";
import { LINKS, getExternalLinkProps } from "@/constants/links";
import { useI18n } from '@/i18n';
import { Navigation } from '@/components/Navigation';
import { SEOHead } from "@/components/SEOHead";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";

export default function About() {
  const { t } = useI18n();
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: canonical }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About KenneDyne spot | Professional Trading Education"
        description="Learn about KenneDyne spot, our mission to provide professional forex trading education, risk management expertise, and the D.R.I.V.E Framework. Founded by traders for traders."
        keywords="about KenneDyne spot, forex education founder, trading mentorship, professional trading education, forex strategy"
        canonical={canonical}
        schema={breadcrumbSchema}
      />
      <Navigation />

      <main id="main" className="py-16 md:py-20">
        <section className="container px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t('about_page_title')}</h1>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10">
            <Link to="/resources" className="underline text-primary font-semibold">{t('about_nav_trader')}</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <Link to="/mentorship" className="underline text-primary font-semibold">{t('about_nav_mentor')}</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <Link to="/strategy" className="underline text-primary font-semibold">{t('about_nav_drive_strategy')}</Link>
            <span className="mx-3 text-muted-foreground">|</span>
            <a {...getExternalLinkProps(LINKS.telegram.community)} className="underline text-primary font-semibold">{t('about_nav_community')}</a>
          </p>

          <div className="space-y-6 text-base md:text-lg leading-8 text-foreground">
            <p>{t('about_intro_p1')}</p>
            <p>{t('about_intro_p2')}</p>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">{t('about_trading_with_institutional_title')}</h2>
            <p>{t('about_trading_with_institutional_body')}</p>

            <h3 className="text-xl md:text-2xl font-semibold mt-8">{t('about_expertise_title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('about_expertise_item1')}</li>
              <li>{t('about_expertise_item2')}</li>
              <li>{t('about_expertise_item3')}</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">{t('about_founder_title')}</h2>
            <p>{t('about_founder_p1')}</p>
            <p dangerouslySetInnerHTML={{ __html: t('about_founder_p2') }} />

            <h2 className="text-2xl md:text-3xl font-semibold mt-10">{t('about_risk_warning_title')}</h2>
            <p className="text-muted-foreground">{t('about_risk_warning_body')}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
