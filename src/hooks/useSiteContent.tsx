import React, { useEffect, useState } from 'react';
import { getSiteContent, resetSiteContent, updateNavigationContent, type SiteContent, defaultContent } from '@/content/siteContent';
import { useI18n } from '@/i18n';
import { getLocalizedContent } from '@/content/siteTranslations';

export function useSiteContent() {
  const { language } = useI18n();
  const [content, setContent] = useState<SiteContent>(() => getLocalizedContent(getSiteContent(), language));

  // Mount-only effect to initialize content
  useEffect(() => {
    updateNavigationContent(); // Force update navigation from latest defaultContent
    setContent(getLocalizedContent(getSiteContent(), language));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount

  // React to language changes and update content accordingly
  useEffect(() => {
    setContent(getLocalizedContent(getSiteContent(), language));
  }, [language]);

  // Separate effect for SEO updates to prevent infinite loops
  useEffect(() => {
    const seo = content.seo;

    // Update document title
    const titleElement = document.getElementById('page-title');
    if (titleElement && titleElement.textContent !== seo.title) {
      titleElement.textContent = seo.title;
    } else if (!titleElement && document.title !== seo.title) {
      document.title = seo.title;
    }

    // Update meta description
    const descriptionElement = document.getElementById('page-description') as HTMLMetaElement;
    if (descriptionElement && descriptionElement.content !== seo.description) {
      descriptionElement.content = seo.description;
    }

    // Update meta keywords
    const keywordsElement = document.getElementById('page-keywords') as HTMLMetaElement;
    if (keywordsElement && keywordsElement.content !== seo.keywords) {
      keywordsElement.content = seo.keywords;
    }
  }, [content.seo.title, content.seo.description, content.seo.keywords]); // Only depend on actual SEO values

  const refreshContent = () => {
    resetSiteContent();
    setContent(getLocalizedContent(getSiteContent(), language));
  };

  return { content, refreshContent };
}
