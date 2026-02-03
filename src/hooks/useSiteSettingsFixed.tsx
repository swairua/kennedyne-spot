import { useState } from 'react';

interface SiteSettings {
  ga4_id: string | null;
  gtm_id: string | null;
  whatsapp_number: string | null;
  seo_default_description: string | null;
  seo_default_og_image: string | null;
  robots_content: string | null;
  sitemap_enabled: boolean | null;
}

export function useSiteSettingsFixed() {
  console.log('useSiteSettingsFixed hook is being called');
  const [settings] = useState<SiteSettings>({
    ga4_id: import.meta.env.VITE_GA_MEASUREMENT_ID || null,
    gtm_id: import.meta.env.VITE_GTM_ID || null,
    whatsapp_number: null,
    seo_default_description: null,
    seo_default_og_image: null,
    robots_content: null,
    sitemap_enabled: null,
  });

  const [loading] = useState(false);

  return { settings, loading };
}
