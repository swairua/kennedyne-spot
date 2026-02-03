// Production site URL for build-time generation
const PRODUCTION_SITE_URL = 'https://kennedynespot.com';

/**
 * Canonical URL Strategy:
 * - Root path ("/") keeps trailing slash
 * - All other paths should NOT have trailing slashes (e.g., "/about" not "/about/")
 * - Query parameters are removed (canonical represents the primary version)
 * - Hash fragments are removed
 */

export const getSiteUrl = (): string => {
  // For build-time (SSR/Node), use production URL
  if (typeof window === 'undefined') {
    return PRODUCTION_SITE_URL;
  }
  // For client-side, prefer current origin for flexibility
  if (window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || PRODUCTION_SITE_URL;
};

export const getProductionUrl = (): string => {
  return PRODUCTION_SITE_URL;
};

/**
 * Normalize URL path to remove query parameters and hash fragments
 * Ensures consistent canonical URLs
 */
export const normalizeUrlPath = (pathname: string): string => {
  if (!pathname) return '/';

  // Remove hash fragment if present
  const withoutHash = pathname.split('#')[0];
  // Remove query parameters if present
  const withoutQuery = withoutHash.split('?')[0];
  // Ensure path starts with /
  const cleaned = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;

  return cleaned;
};

/**
 * Apply trailing slash consistency:
 * - Root path "/" keeps trailing slash
 * - All other paths should NOT have trailing slashes
 */
export const normalizeTrailingSlash = (pathname: string): string => {
  const normalized = normalizeUrlPath(pathname);

  if (normalized === '/') {
    return '/'; // Root always has trailing slash
  }

  // Remove trailing slashes from non-root paths
  return normalized.replace(/\/$/, '');
};

export const createCanonicalUrl = (pathname: string): string => {
  const baseUrl = getSiteUrl();
  const normalized = normalizeTrailingSlash(pathname || '/');
  return `${baseUrl}${normalized}`;
};

export const toAbsoluteUrl = (input: string | null | undefined): string | undefined => {
  if (!input) return undefined;
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  const site = getSiteUrl();
  const normalized = normalizeTrailingSlash(input);
  return `${site}${normalized}`;
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": toAbsoluteUrl(item.url) || item.url
    }))
  };
};
