import { supabase } from "@/integrations/supabase/client";

export type TranslationProgress = {
  total: number;
  completed: number;
  current: string;
  errors: Array<{ path: string; error: string }>;
};

type TargetLanguage = 'fr' | 'es' | 'de' | 'ru';

// Fields that should never be translated (enums, IDs, URLs, technical fields)
const SKIP_FIELDS = new Set([
  'level', 'type', 'slug', 'url', 'href', 'id', 
  'readTime', 'createdAt', 'updatedAt', 'date',
  'icon', 'image', 'alt', 'path', 'link'
]);

/**
 * Recursively traverse an object and collect all string values with their paths
 */
function collectTextFields(obj: any, prefix = ''): Array<{ path: string; value: string }> {
  const fields: Array<{ path: string; value: string }> = [];

  if (typeof obj === 'string') {
    // Check if this field should be skipped
    const fieldName = prefix.split('.').pop()?.replace(/\[\d+\]/, '');
    if (fieldName && SKIP_FIELDS.has(fieldName)) {
      return [];
    }
    return [{ path: prefix, value: obj }];
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      fields.push(...collectTextFields(item, `${prefix}[${index}]`));
    });
    return fields;
  }

  if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      // Skip entire objects/fields that shouldn't be translated
      if (SKIP_FIELDS.has(key)) {
        return;
      }
      const path = prefix ? `${prefix}.${key}` : key;
      fields.push(...collectTextFields(value, path));
    });
  }

  return fields;
}

/**
 * Set a value in a nested object using a path string
 */
function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split(/[\.\[\]]/).filter(Boolean);
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    if (!current[part]) {
      current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Translate a single text field using the auto-translate-content edge function
 */
async function translateField(
  text: string,
  targetLang: TargetLanguage,
  sourceLang: 'en' | 'fr' = 'en'
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('auto-translate-content', {
      body: {
        text,
        targetLang,
        sourceLang
      }
    });

    if (error) throw error;
    if (!data?.translatedText) throw new Error('No translation returned');

    return data.translatedText;
  } catch (error: any) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Translate an entire object structure to a target language
 */
export async function translateObject(
  sourceObject: any,
  targetLang: TargetLanguage,
  sourceLang: 'en' | 'fr' = 'en',
  onProgress?: (progress: TranslationProgress) => void
): Promise<any> {
  const fields = collectTextFields(sourceObject);
  const result: any = Array.isArray(sourceObject) ? [] : {};
  
  const progress: TranslationProgress = {
    total: fields.length,
    completed: 0,
    current: '',
    errors: []
  };

  for (const { path, value } of fields) {
    progress.current = `${path}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`;
    
    if (onProgress) {
      onProgress({ ...progress });
    }

    try {
      // Skip empty strings
      if (!value.trim()) {
        setNestedValue(result, path, value);
        progress.completed++;
        continue;
      }

      const translatedText = await translateField(value, targetLang, sourceLang);
      setNestedValue(result, path, translatedText);
      progress.completed++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`Failed to translate ${path}:`, error);
      progress.errors.push({
        path,
        error: error.message || 'Translation failed'
      });
      // Use original text as fallback
      setNestedValue(result, path, value);
      progress.completed++;
    }
  }

  return result;
}

/**
 * Generate TypeScript code for the translated object
 */
export function generateTypeScriptCode(
  translatedObjects: Record<TargetLanguage, any>,
  type: 'site' | 'ui'
): string {
  const indent = '  ';
  
  if (type === 'site') {
    // For siteTranslations.ts
    return `type DeepPartial<T> = T extends (infer U)[] 
  ? DeepPartial<U>[] 
  : T extends object 
  ? { [K in keyof T]?: DeepPartial<T[K]> } 
  : T;

export const siteTranslations: Record<'en'|'fr'|'es'|'de'|'ru', DeepPartial<SiteContent>> = {
  en: {},
  fr: {
    // ... existing French translations ...
  },
${Object.entries(translatedObjects)
  .map(([lang, obj]) => `${indent}${lang}: ${JSON.stringify(obj, null, 2).replace(/\n/g, '\n' + indent)}`)
  .join(',\n')}
};`;
  } else {
    // For translations.ts
    return `export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // ... existing English translations ...
  },
  fr: {
    // ... existing French translations ...
  },
${Object.entries(translatedObjects)
  .map(([lang, obj]) => `${indent}${lang}: ${JSON.stringify(obj, null, 2).replace(/\n/g, '\n' + indent)}`)
  .join(',\n')}
};`;
  }
}
