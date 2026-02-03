import { I18nProvider, useI18n, setGlobalLanguage } from './I18nProvider';
import { type Locale, translations } from './translations';

export { I18nProvider, useI18n, setGlobalLanguage, translations };
export type { Locale };

export function switchLanguage(lang: 'en' | 'fr' | 'es' | 'de' | 'ru') {
  setGlobalLanguage(lang);
}

export function switchToFrench() {
  switchLanguage('fr');
}
