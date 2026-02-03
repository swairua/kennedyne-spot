import { Helmet } from 'react-helmet-async';
import Resources from './Resources';
import { useI18n } from '@/i18n';
import { createBreadcrumbSchema, getSiteUrl, createCanonicalUrl } from '@/utils/seoHelpers';

export default function ResourcesWithSEO() {
  const { t } = useI18n();
  const siteUrl = getSiteUrl();
  const canonical = createCanonicalUrl('/resources');

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: t('breadcrumb_home'), url: "/" },
    { name: t('breadcrumb_resources'), url: canonical }
  ]);

  return (
    <>
      <Helmet>
        <title>{t('resources_seo_title')}</title>
        <meta name="description" content={t('resources_seo_description')} />
        <meta name="keywords" content={t('resources_seo_keywords')} />
        <link rel="canonical" href={canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('resources_og_title')} />
        <meta property="og:description" content={t('resources_og_description')} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/og/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('resources_twitter_title')} />
        <meta name="twitter:description" content={t('resources_twitter_description')} />
        <meta name="twitter:image" content={`${siteUrl}/og/og-default.jpg`} />
      </Helmet>
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <Resources />
    </>
  );
}
