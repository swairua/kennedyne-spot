import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, Clock, User, Tag, Share2, Copy, 
  ArrowLeft, Eye, Twitter, Facebook, Linkedin,
  MessageCircle
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { SectionDivider } from '@/components/SectionDivider';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { BlogSidebar } from '@/components/BlogSidebar';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { fr as frLocale, enUS, es as esLocale, de as deLocale, ru as ruLocale } from 'date-fns/locale';
import { useI18n } from '@/i18n';
import { getLocalizedField } from '@/hooks/useLocalizedContent';
import { translatePostFields } from '@/utils/translationService';
import { trackEvent } from '@/components/GTMProvider';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '@/utils/whatsapp';
import { toAbsoluteUrl, createCanonicalUrl } from '@/utils/seoHelpers';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  published_at: string;
  updated_at?: string;
  reading_time_mins: number;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  schema_type: string;
  schema_json_ld?: any;
  cta_type?: string;
  cta_title?: string;
  cta_url?: string;
  cta_enabled?: boolean;
  authors?: { name: string; slug: string; bio?: string; avatar_url?: string }[];
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
  related_posts?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image_url?: string;
    published_at: string;
    reading_time_mins: number;
  }[];
}

interface SiteSettings {
  whatsapp_number?: string;
}

export default function BlogPost() {
  const { t, language } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [translated, setTranslated] = useState<{ title?: string; excerpt?: string; content?: string } | null>(null);

  const dateLocale = language === 'fr' ? frLocale : language === 'es' ? esLocale : language === 'de' ? deLocale : language === 'ru' ? ruLocale : enUS;

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(scrolled);

      // Track scroll depth
      if (scrolled >= 25 && scrolled < 50) {
        trackEvent('scroll_depth', { depth: 25, post_slug: slug });
      } else if (scrolled >= 50 && scrolled < 75) {
        trackEvent('scroll_depth', { depth: 50, post_slug: slug });
      } else if (scrolled >= 75 && scrolled < 100) {
        trackEvent('scroll_depth', { depth: 75, post_slug: slug });
      } else if (scrolled >= 100) {
        trackEvent('scroll_depth', { depth: 100, post_slug: slug });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      
      // Fetch post with normalized visibility filter
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          post_authors (
            authors (
              id,
              name,
              slug,
              avatar_url,
              bio,
              twitter,
              linkedin
            )
          ),
          post_categories (
            categories (
              id,
              name,
              slug
            )
          ),
          post_tags (
            tags (
              id,
              name,
              slug
            )
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .or('published_at.is.null,published_at.lte.' + new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(1);

      if (postError) {
        console.error('Post fetch error:', postError);
        
        // Try diagnostic query to check if post exists but is unpublished/scheduled
        const { data: diagnosticData } = await supabase
          .from('blog_posts')
          .select('slug, title, published, published_at, status')
          .eq('slug', slug)
          .single();
          
        if (diagnosticData) {
          console.log('Post found but not accessible:', {
            slug: diagnosticData.slug,
            published: diagnosticData.published,
            published_at: diagnosticData.published_at,
            status: diagnosticData.status,
            current_time: new Date().toISOString()
          });
        }
        return;
      }

      if (!postData || postData.length === 0) {
        console.error('No post data returned for slug:', slug);
        return;
      }

      const post = postData[0];

      // Fetch site settings for WhatsApp - use maybeSingle to prevent errors
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('whatsapp_number')
        .maybeSingle();

      // Transform relationships and prefer localized fields when available
      const transformedPost = {
        ...post,
        title: getLocalizedField(post, 'title', language) || post.title,
        content: getLocalizedField(post, 'content', language) || post.content,
        excerpt: getLocalizedField(post, 'excerpt', language) || post.excerpt,
        authors: post.post_authors?.map((pa: any) => pa.authors) || [],
        categories: post.post_categories?.map((pc: any) => pc.categories) || [],
        tags: post.post_tags?.map((pt: any) => pt.tags) || [],
        related_posts: []
      };

      // Fetch related posts separately to avoid join complexity
      if (post.id) {
        const { data: relatedData } = await supabase
          .from('post_related')
          .select(`
            related_posts:blog_posts (
              id,
              title,
              title_fr,
              slug,
              excerpt,
              excerpt_fr,
              featured_image_url,
              reading_time_mins,
              published_at
            )
          `)
          .eq('post_id', post.id)
          .limit(3);

        transformedPost.related_posts = (relatedData || []).map((pr: any) => {
          const rp = pr.related_posts || {};
          return {
            ...rp,
            title: getLocalizedField(rp, 'title', language) || rp.title,
            excerpt: getLocalizedField(rp, 'excerpt', language) || rp.excerpt,
          };
        });
      }

      setPost(transformedPost);
      setSiteSettings(settingsData || {});

      // SEO debug: log computed meta for this post
      const seoTitle = getLocalizedField(post, 'meta_title', language) || `${transformedPost.title} | KenneDyne spot`;
      const seoDescription = getLocalizedField(post, 'meta_description', language) || transformedPost.excerpt;
      const canonicalPath = transformedPost.canonical_url || `/blog/${transformedPost.slug}`;
      const canonicalHref = createCanonicalUrl(canonicalPath);
      const ogImage = toAbsoluteUrl(transformedPost.featured_image_url || transformedPost.og_image_url || '/og/og-default.jpg');

      console.log('[SEO DEBUG] BlogPost meta', {
        slug: transformedPost.slug,
        title: seoTitle,
        description: seoDescription,
        canonicalHref,
        ogImage,
      });

      // Auto-translate if no localized fields exist for the selected language
      if (language !== 'en') {
        const hasLocalized = Boolean((post as any)[`title_${language}`] || (post as any)[`excerpt_${language}`] || (post as any)[`content_${language}`]);
        if (!hasLocalized) {
          try {
            const tr = await translatePostFields(
              {
                title: post.title,
                excerpt: post.excerpt || '',
                content: post.content,
              },
              language,
              'en'
            );
            setTranslated(tr);
          } catch (e) {
            console.error('Auto-translate failed:', e);
          }
        } else {
          setTranslated(null);
        }
      } else {
        setTranslated(null);
      }

      // Track post impression
      trackEvent('post_impression', { 
        post_id: transformedPost.id,
        post_slug: transformedPost.slug,
        post_title: transformedPost.title
      });

      // Generate TOC from content headings
      const headingRegex = /^(#{2,4})\s+(.+)$/gm;
      const toc: { id: string; text: string; level: number }[] = [];
      let match;
      
      while ((match = headingRegex.exec(transformedPost.content)) !== null) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        toc.push({ id, text, level });
      }
      
      setTocItems(toc);
    } catch (error) {
      console.error('Error fetching post:', error);
      console.error('Slug attempted:', slug);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug, language]);

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    const text = post.excerpt || post.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        const whatsappText = `${title} - ${url}`;
        shareUrl = createWhatsAppLink(siteSettings.whatsapp_number, whatsappText);
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackEvent('share_click', { platform, post_slug: post.slug });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('link_copied_title'),
        description: t('link_copied_desc'),
      });
      trackEvent('copy_link', { post_slug: post?.slug });
    } catch (error) {
      toast({
        title: t('copy_failed_title'),
        description: t('copy_failed_desc'),
        variant: 'destructive',
      });
    }
  };

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      trackEvent('toc_click', { heading_id: id, post_slug: post?.slug });
    }
  };

  const generateJSONLD = () => {
    if (!post) return null;

    // Use custom JSON-LD if provided, otherwise generate based on schema_type
    if (post.schema_json_ld) {
      return post.schema_json_ld;
    }

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": post.schema_type || "Article",
      "headline": post.title,
      "description": post.excerpt || post.meta_description,
      "image": toAbsoluteUrl(post.featured_image_url || post.og_image_url || '/og/og-default.jpg'),
      "datePublished": post.published_at,
      "dateModified": post.updated_at || post.published_at,
      "author": post.authors?.map(author => ({
        "@type": "Person",
        "name": author.name
      })) || [],
      "publisher": {
        "@type": "Organization",
        "name": "KenneDyne spot",
        "logo": {
          "@type": "ImageObject",
          "url": "https://kennedynespot.com/og/og-default.jpg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    return baseSchema;
  };

  const whatsappCTAMessage = post ? WHATSAPP_MESSAGES.blogCTA(post.title) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('post_not_found_title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('post_not_found_desc')}
        </p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_blog')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <SEOHead
        title={getLocalizedField(post, 'meta_title', language) || `${post.title} | KenneDyne spot`}
        description={getLocalizedField(post, 'meta_description', language) || post.excerpt}
        canonical={createCanonicalUrl(post.canonical_url || `/blog/${post.slug}`)}
        ogImage={post.og_image_url || post.featured_image_url || '/og/og-default.jpg'}
        ogType="article"
        schema={generateJSONLD()}
      />

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 z-50 h-1 bg-primary transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Skip to Content */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        {t('skip_to_main_content')}
      </a>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">{t('breadcrumb_home')}</Link>
          <span className="text-muted-foreground/60">/</span>
          <Link to="/blog" className="hover:text-foreground transition-colors">{t('breadcrumb_blog')}</Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <main 
            id="main-content"
            className="lg:col-span-8"
          >
            <article>
              {/* Post Header */}
              <header className="mb-8">
                {post.featured_image_url && (
                  <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={`${t('blog_article_image_alt')}: ${translated?.title ?? post.title}` }
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Link key={category.slug} to={`/blog?category=${category.slug}`}>
                          <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors">
                            {category.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                    {translated?.title ?? post.title}
                  </h1>

                  {(translated?.excerpt ?? post.excerpt) && (
                    <p className="text-base sm:text-lg text-muted-foreground">
                      {translated?.excerpt ?? post.excerpt}
                    </p>
                  )}

                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.published_at}>
                        {format(new Date(post.published_at), 'PPP', { locale: dateLocale })}
                      </time>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{post.reading_time_mins} {t('reading_time_read')}</span>
                    </div>

                    {post.authors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {post.authors.map(author => author.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Share Buttons */}
                  <div className="flex items-center gap-2 pt-4">
                    <span className="text-sm font-medium mr-2">{t('share_label')}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('linkedin')}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('whatsapp')}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </header>

              {/* Post Content */}
              <div className="prose dark:prose-invert max-w-none prose-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children, ...props }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return <h2 id={id} {...props}>{children}</h2>;
                    },
                    h2: ({ children, ...props }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return <h2 id={id} {...props}>{children}</h2>;
                    },
                    h3: ({ children, ...props }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return <h3 id={id} {...props}>{children}</h3>;
                    },
                    h4: ({ children, ...props }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return <h4 id={id} {...props}>{children}</h4>;
                    },
                  }}
                >
                  {translated?.content ?? post.content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4" />
                    <span className="font-semibold">{t('tags_label')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag.slug} to={`/blog?tag=${tag.slug}`}>
                        <Badge variant="outline" className="hover:bg-accent transition-colors">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              {post.authors.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-semibold mb-4">
                    {t(post.authors.length > 1 ? 'about_authors' : 'about_author')}
                  </h3>
                  <div className="space-y-6">
                    {post.authors.map((author) => (
                      <div key={author.slug} className="flex gap-4">
                        {author.avatar_url && (
                          <img
                            src={author.avatar_url}
                            alt={author.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-lg">{author.name}</h4>
                          {author.bio && (
                            <p className="text-muted-foreground mt-2">{author.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom CTA or WhatsApp CTA */}
              {post.cta_enabled !== false && (post.cta_enabled || siteSettings.whatsapp_number) && (
                <Card className={`mt-8 ${
                  post.cta_type === 'whatsapp' || !post.cta_enabled
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : post.cta_type === 'email'
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    : post.cta_type === 'phone'
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                    : 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                }`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      {/* Custom CTA */}
                      {post.cta_enabled && post.cta_title && post.cta_url ? (
                        <>
                          <h3 className="text-xl font-semibold mb-2">{post.cta_title}</h3>
                          <Button
                            className={`${
                              post.cta_type === 'email'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : post.cta_type === 'phone'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : post.cta_type === 'whatsapp'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-purple-600 hover:bg-purple-700'
                            } text-white`}
                            onClick={() => {
                              let url = '';
                              switch (post.cta_type) {
                                case 'whatsapp':
                                  url = createWhatsAppLink(post.cta_url, whatsappCTAMessage);
                                  break;
                                case 'email':
                                  url = `mailto:${post.cta_url}`;
                                  break;
                                case 'phone':
                                  url = `tel:${post.cta_url}`;
                                  break;
                                case 'link':
                                default:
                                  url = post.cta_url;
                                  break;
                              }

                              if (url) {
                                if (post.cta_type === 'link') {
                                  window.location.href = url;
                                } else {
                                  window.open(url, '_blank');
                                }
                              }

                              trackEvent('cta_click', {
                                type: post.cta_type,
                                location: 'post_bottom',
                                post_slug: post.slug
                              });
                            }}
                          >
                            {post.cta_type === 'email' && <Mail className="h-4 w-4 mr-2" />}
                            {post.cta_type === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                            {post.cta_type === 'whatsapp' && <MessageCircle className="h-4 w-4 mr-2" />}
                            {post.cta_type === 'link' && <ExternalLink className="h-4 w-4 mr-2" />}
                            {post.cta_title}
                          </Button>
                        </>
                      ) : siteSettings.whatsapp_number ? (
                        /* Fallback to Default WhatsApp CTA */
                        <>
                          <h3 className="text-xl font-semibold mb-2">{t('ready_to_start_trading')}</h3>
                          <p className="text-muted-foreground mb-4">{t('ready_to_start_trading_desc')}</p>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              const whatsappUrl = createWhatsAppLink(siteSettings.whatsapp_number, whatsappCTAMessage);
                              window.open(whatsappUrl, '_blank');
                              trackEvent('cta_click', {
                                type: 'whatsapp',
                                location: 'post_bottom',
                                post_slug: post.slug
                              });
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {t('contact_on_whatsapp')}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )}
            </article>

            {/* Related Posts */}
            {post.related_posts && post.related_posts.length > 0 && (
              <section className="mt-12">
                <Separator className="mb-8" />
                <h2 className="text-2xl font-bold mb-6">{t('related_posts')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {post.related_posts.slice(0, 3).map((relatedPost) => (
                    <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        {relatedPost.featured_image_url ? (
                          <img
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-2xl font-bold text-primary/30">
                              {relatedPost.title.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-2">
                            <Link 
                              to={`/blog/${relatedPost.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {relatedPost.title}
                            </Link>
                          </h3>
                          
                          {relatedPost.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {relatedPost.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(relatedPost.published_at), 'MMM d', { locale: language === 'fr' ? frLocale : enUS })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {relatedPost.reading_time_mins} {t('reading_time_min')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t">
              <Button asChild variant="outline">
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back_to_blog')}
                </Link>
              </Button>
            </div>
          </main>

          {/* Sidebar with Recent Posts and Categories */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8">
              <BlogSidebar />
            </div>
          </aside>
        </div>
      </div>

      <SectionDivider variant="wave" className="text-muted" />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
