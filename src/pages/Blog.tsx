import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SectionDivider } from "@/components/SectionDivider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import forexBlogHero from "@/assets/forex-blog-hero.jpg";
import { useI18n } from '@/i18n';

import { useSiteContent } from '@/hooks/useSiteContent';

const Blog = () => {
  const { t } = useI18n();
  const { content } = useSiteContent();
  const blogPosts = content.blogPreview.posts || [];
  const categories = content.blogPreview.categories || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img
              src={forexBlogHero}
              alt={t('blog_hero_image_alt')}
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}

              onError={(e) => {
                console.warn('Hero image failed to load');
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-hero-premium grain-texture"></div>
          <div className="container px-4 relative z-20 on-hero">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="fluid-h1 text-white mb-6">{t('blog_hero_title')}</h1>
              <p className="text-hero-body text-white/90 mb-8 max-w-3xl mx-auto">{t('blog_hero_subtitle')}</p>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-2xl mx-auto">
                <p className="text-sm text-white/90"><strong>{t('blog_educational_note')}</strong> {t('blog_educational_note_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={category === (content.blogPreview.categories?.[0] || 'All') ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Featured Posts */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-8">{t('blog_featured_title')}</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts.slice(0, 2).map((post, index) => (
                    <Card key={index} className="p-8 border border-border hover:shadow-elevation hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                        {post.category}
                      </Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                        <span>{post.readTime} {t('reading_time_min')}</span>
                      </div>

                      <div className="flex items-center text-primary hover:text-primary-hover cursor-pointer">
                        <span className="font-medium">{t('blog_read_full')}</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Posts */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">{t('blog_all_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {blogPosts.map((post, index) => (
                    <Card key={index} className="p-6 border border-border hover:shadow-elevation hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
                        {post.category}
                      </Badge>
                      <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{post.readTime} {t('reading_time_min')}</span>
                      </div>

                      <div className="flex items-center text-primary hover:text-primary-hover cursor-pointer text-sm">
                        <span className="font-medium">{t('blog_read_more')}</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider variant="wave" className="text-muted" />
        
        {/* Newsletter CTA */}
        <section className="py-20 near-footer-contrast grain-texture">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('newsletter_title')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('newsletter_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('newsletter_email_placeholder')}
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background/80 backdrop-blur-sm"
                />
                <Button variant="hero" className="px-6 py-2">
                  {t('newsletter_subscribe')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t('newsletter_note')}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blog;
