import { useEffect, useState, useRef } from 'react';
import { translateText } from '@/utils/translationService';
import { useI18n } from '@/i18n';

type TranslatedMap = Record<string, any>;

export function useAutoTranslate<T extends { id: string }>(items: T[] | null | undefined, fields: string[] = ['title', 'excerpt']) {
  const { language } = useI18n();
  const [translatedMap, setTranslatedMap] = useState<TranslatedMap>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [totalToTranslate, setTotalToTranslate] = useState(0);
  const [translatedCount, setTranslatedCount] = useState(0);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function runTranslate(targetItems: T[] = []) {
    try {
      setTranslationError(null);
      setIsTranslating(true);
      setTranslatedCount(0);
      setTranslatedMap({});

      if (!language || language === 'en') {
        setTotalToTranslate(0);
        setIsTranslating(false);
        return;
      }

      const list = targetItems || [];
      setTotalToTranslate(list.length);

      const next: TranslatedMap = {};

      for (const item of list) {
        const key = `${item.id}:${language}`;
        const cacheKey = `translations:item:${key}`;
        const cached = (() => {
          try { return localStorage.getItem(cacheKey); } catch { return null; }
        })();
        if (cached) {
          try { next[item.id] = JSON.parse(cached); } catch { next[item.id] = null; }
          setTranslatedCount(c => c + 1);
          continue;
        }

        // For each field requested, attempt translation unless server provides localized field (field_fr)
        const result: Record<string, any> = {};
        for (const field of fields) {
          try {
            const val = (item as any)[field] ?? '';
            // prefer server-localized field if available
            if (language === 'fr' && (item as any)[`${field}_fr`] !== undefined) {
              result[field] = (item as any)[`${field}_fr`] || val;
              continue;
            }

            if (!val) {
              result[field] = val;
              continue;
            }

            // translate
            const translated = await translateText(String(val), language);
            result[field] = translated || val;
          } catch (err: any) {
            console.warn('translate field failed', field, err?.message || err);
            result[field] = (item as any)[field];
            setTranslationError(err?.message || String(err));
          }
        }

        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
        next[item.id] = result;
        setTranslatedCount(c => c + 1);

        // rate reduce
        await new Promise(res => setTimeout(res, 120));
      }

      if (mounted.current) setTranslatedMap(next);
    } catch (err: any) {
      console.warn('auto translate failed', err?.message || err);
      setTranslationError(err?.message || String(err));
    } finally {
      if (mounted.current) setIsTranslating(false);
    }
  }

  useEffect(() => {
    if (!items || items.length === 0) {
      setTranslatedMap({});
      setTotalToTranslate(0);
      setTranslatedCount(0);
      return;
    }

    runTranslate(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, language]);

  const retry = () => runTranslate(items || []);

  return { translatedMap, isTranslating, totalToTranslate, translatedCount, translationError, retry };
}
