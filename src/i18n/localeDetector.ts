import { Locale } from './translations';

const STORAGE_KEY = 'app:lang';

export function detectLocale(): Locale {
  // 1. Check URL path (e.g., /fr/blog)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const urlLocale = pathSegments[0];
  if (urlLocale && ['en', 'fr', 'es', 'de', 'ru'].includes(urlLocale)) {
    return urlLocale as Locale;
  }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && ['en', 'fr', 'es', 'de', 'ru'].includes(stored)) {
      return stored;
    }
  } catch {}

  // 3. Check browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.toLowerCase() || navigator.languages?.[0]?.toLowerCase();
    if (browserLang?.startsWith('fr')) return 'fr';
    if (browserLang?.startsWith('es')) return 'es';
    if (browserLang?.startsWith('de')) return 'de';
    if (browserLang?.startsWith('ru')) return 'ru';
  }

  // 4. Default to English
  return 'en';
}

export function getLocalePrefix(locale: Locale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && ['en', 'fr', 'es', 'de', 'ru'].includes(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = stripLocaleFromPath(pathname);
  const prefix = getLocalePrefix(locale);
  return prefix + cleanPath;
}
