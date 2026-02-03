import { Helmet } from 'react-helmet-async';
import Learn from './Learn';
import { StructuredData } from '@/components/StructuredData';
import { createBreadcrumbSchema, createCanonicalUrl, getSiteUrl } from '@/utils/seoHelpers';

export default function LearnWithSEO() {
  const canonical = createCanonicalUrl('/services/learn');
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Learn', url: '/services/learn' }
  ]);

  return (
    <>
      <Helmet>
        <title>Learn Forex Trading - Professional Education | KenneDyne spot</title>
        <meta 
          name="description" 
          content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies. Learn the DRIVE methodology and trade like a professional." 
        />
        <meta 
          name="keywords" 
          content="forex education, trading courses, DRIVE methodology, forex learning, institutional trading, professional trading education, Kenya forex training" 
        />
        <link rel="canonical" href={canonical} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Learn Forex Trading - Professional Education | KenneDyne spot" />
        <meta property="og:description" content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${getSiteUrl()}/og/og-default.jpg`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Learn Forex Trading - Professional Education" />
        <meta name="twitter:description" content="Master forex trading with our structured learning paths. From beginner foundations to advanced institutional strategies." />
        <meta name="twitter:image" content={`${getSiteUrl()}/og/og-default.jpg`} />
        
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <Learn />
    </>
  );
}
