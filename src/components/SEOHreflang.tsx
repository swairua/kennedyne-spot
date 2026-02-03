import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { getSiteUrl } from '@/utils/seoHelpers';

const languages = ['en', 'fr', 'es', 'de', 'ru'] as const;

export const SEOHreflang: React.FC = () => {
  const location = useLocation();
  const { language } = useI18n();
  const siteUrl = getSiteUrl();

  // Remove locale prefix from pathname if present
  const cleanPath = location.pathname.replace(/^\/(en|fr|es|de|ru)(\/|$)/, '/');

  return (
    <Helmet>
      {languages.map((lang) => {
        const langPath = lang === 'en' ? cleanPath : `/${lang}${cleanPath}`;
        return (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={`${siteUrl}${langPath}`}
          />
        );
      })}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${siteUrl}${cleanPath}`}
      />
    </Helmet>
  );
};
