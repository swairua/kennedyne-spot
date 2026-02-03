import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr as frLocale, enUS, es as esLocale, de as deLocale, ru as ruLocale } from 'date-fns/locale';
import { useI18n } from '@/i18n';
import { getLocalizedField } from '@/hooks/useLocalizedContent';

interface RecentPost {
  slug: string;
  title: string;
  published_at: string;
}

interface Category {
  slug: string;
  name: string;
  post_count?: number;
}

export function BlogSidebar() {
  const { language, t } = useI18n();
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const dateLocale = language === 'fr' ? frLocale : language === 'es' ? esLocale : language === 'de' ? deLocale : language === 'ru' ? ruLocale : enUS;

  useEffect(() => {
    fetchSidebarData();
  }, [language]);

  const fetchSidebarData = async () => {
    try {
      // Fetch recent posts
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('slug, title, title_fr, title_es, title_de, title_ru, published_at')
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(5);

      if (postsData) {
        const transformedPosts = postsData.map(post => ({
          slug: post.slug,
          title: getLocalizedField(post, 'title', language) || post.title,
          published_at: post.published_at,
        }));
        setRecentPosts(transformedPosts);
      }

      // Fetch categories with post counts
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          slug,
          name,
          post_categories(count)
        `)
        .order('name');

      if (categoriesData) {
        const transformedCategories = categoriesData.map(cat => ({
          slug: cat.slug,
          name: cat.name,
          post_count: cat.post_categories?.[0]?.count || 0,
        }));
        setCategories(transformedCategories.filter(cat => cat.post_count > 0));
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('recent_posts_title')}</h3>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="block group"
                >
                  <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={post.published_at}>
                      {format(new Date(post.published_at), 'MMM d, yyyy', { locale: dateLocale })}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('categories_title')}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/blog?category=${category.slug}`}
                >
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}