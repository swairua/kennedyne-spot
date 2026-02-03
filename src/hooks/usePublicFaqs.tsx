import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  created_at: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: string;
}

interface UsePublicFaqsReturn {
  faqs: FAQ[];
  categories: FAQCategory[];
  loading: boolean;
  error: string | null;
}

export const usePublicFaqs = (language?: string): UsePublicFaqsReturn => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all published FAQs with localized fields
        const { data, error: fetchError } = await supabase
          .from('faqs')
          .select(`
            *,
            question_fr,
            question_es,
            question_de,
            question_ru,
            answer_fr,
            answer_es,
            answer_de,
            answer_ru,
            translation_status
          `)
          .eq('published', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true});

        if (fetchError) {
          throw fetchError;
        }

        const faqsData = (data as FAQ[]) || [];
        setFaqs(faqsData);

        // Extract unique categories and create category objects with URL-safe slugs
        const uniqueCategories = [...new Set(faqsData.map(faq => faq.category).filter(Boolean))];
        const categoryObjects: FAQCategory[] = uniqueCategories.map(cat => ({
          id: normalizeToSlug(cat),
          label: cat,
          icon: getCategoryIcon(cat)
        }));

        setCategories(categoryObjects);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [language]);

  return { faqs, categories, loading, error };
};

// Helper function to normalize category names to URL-safe slugs
const normalizeToSlug = (category: string): string => {
  return category.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to get icons for categories
const getCategoryIcon = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'general': 'HelpCircle',
    'strategy': 'Target', 
    'education': 'BookOpen',
    'risk & legal': 'Shield',
    'support': 'MessageCircle',
    'trading': 'TrendingUp',
    'account': 'User',
    'technical': 'Settings',
    'psychology': 'User',
    'risk management': 'Shield'
  };

  const key = category.toLowerCase();
  return categoryMap[key] || 'HelpCircle';
};
