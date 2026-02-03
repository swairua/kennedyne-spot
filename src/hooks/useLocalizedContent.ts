import { useI18n } from '@/i18n';
import { Locale } from '@/i18n/translations';

type LocalizedFields = Record<string, any>;

export function useLocalizedContent<T extends LocalizedFields>(item: T | null | undefined, fields: string[] = ['title', 'description', 'excerpt', 'content']): T | null {
  const { language } = useI18n();

  if (!item) return null;
  if (language === 'en') return item;

  const localized: any = { ...item };

  fields.forEach(field => {
    const localizedFieldName = `${field}_${language}`;
    if (item[localizedFieldName]) {
      localized[field] = item[localizedFieldName];
    }
  });

  return localized as T;
}

export function getLocalizedField(item: any, field: string, language: Locale): string {
  if (language === 'en' || !item) {
    return item?.[field] || '';
  }

  const localizedFieldName = `${field}_${language}`;
  return item[localizedFieldName] || item[field] || '';
}

export function hasTranslation(item: any, language: Locale): boolean {
  if (!item || language === 'en') return true;
  
  const status = item.translation_status;
  if (typeof status === 'object' && status !== null) {
    return status[language] === 'complete' || status[language] === 'auto';
  }
  
  return false;
}

export function filterPostsByLanguage<T extends { translation_status?: any }>(
  posts: T[],
  language: Locale
): T[] {
  if (language === 'en') return posts;
  
  return posts.filter(post => {
    const status = post.translation_status;
    if (!status || typeof status !== 'object') return false;
    
    return status[language] === 'complete' || status[language] === 'auto';
  });
}
