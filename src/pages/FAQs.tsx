import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SectionDivider } from "@/components/SectionDivider";
import { useI18n } from '@/i18n';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, HelpCircle, Search, Link as LinkIcon, Copy, Check, Target, BookOpen, Shield, TrendingUp, User, Settings } from "lucide-react";
import { usePublicFaqs } from "@/hooks/usePublicFaqs";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { getLocalizedField } from "@/hooks/useLocalizedContent";
import { toast } from "sonner";
import forexFaqHero from "@/assets/forex-faq-hero.jpg";
import type { Locale } from '@/i18n/translations';

const normalizeToSlug = (val: string): string => {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const FAQs = () => {
  const { t, language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedFaqId, setCopiedFaqId] = useState<string | null>(null);
  const { faqs, categories, loading, error } = usePublicFaqs(language);

  const { translatedMap: faqTranslations } = useAutoTranslate(faqs || [], ['question', 'answer', 'category']);

  const lf = (item: any, field: string): string => {
    const dbField = getLocalizedField(item, field, language as Locale);
    if (dbField && language !== 'en') return dbField;
    if (faqTranslations[item.id]?.[field] && language !== 'en') return faqTranslations[item.id][field];
    return item[field] || '';
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      HelpCircle, Target, BookOpen, Shield, MessageCircle, TrendingUp, User, Settings
    };
    return iconMap[iconName] || HelpCircle;
  };

  // Handle URL hash navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && categories.some(cat => cat.id === hash)) {
      setSelectedCategory(hash);
    }
  }, [categories]);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      window.history.replaceState(null, '', `#${selectedCategory}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedCategory]);

  const filteredFAQs = faqs.filter(faq => {
    const localizedQuestion = lf(faq, 'question');
    const localizedAnswer = lf(faq, 'answer');
    const localizedCategory = lf(faq, 'category');

    const matchesCategory = selectedCategory === "all" ||
      selectedCategory === normalizeToSlug(localizedCategory);

    const q = searchQuery.toLowerCase();
    const matchesSearch = q === "" ||
      localizedQuestion.toLowerCase().includes(q) ||
      localizedAnswer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const copyFaqLink = async (faqId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${selectedCategory !== "all" ? selectedCategory : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFaqId(faqId);
      setTimeout(() => setCopiedFaqId(null), 2000);
      toast.success(t('faqs_copy_link'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error(t('faqs_error'));
    }
  };

  const renderFAQContent = () => (
    filteredFAQs.length === 0 ? (
      <Card className="border border-border/50 bg-card/30 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('faqs_no_results_title')}</h3>
          <p className="text-muted-foreground">
            {searchQuery ?
              t('faqs_no_results_desc_query').replace('{{query}}', searchQuery) :
              t('faqs_no_results_desc_empty')
            }
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              {t('resources_clear_filters')}
            </Button>
          )}
        </CardContent>
      </Card>
    ) : (
      <Card className="border border-border/50 bg-card/30 backdrop-blur-sm">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id} 
                className={`group border-b border-border/30 ${index === filteredFAQs.length - 1 ? 'border-b-0' : ''}`}
              >
                <AccordionTrigger
                  className="text-left font-semibold text-foreground hover:text-primary transition-all duration-200 px-6 py-5 hover:bg-muted/30 group-data-[state=open]:bg-muted/20 group-data-[state=open]:text-primary [&[data-state=open]>svg]:rotate-180"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyFaqLink(faq.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8 hover:bg-primary/10"
                      title={t('faqs_copy_link')}
                    >
                      {copiedFaqId === faq.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <LinkIcon className="h-3 w-3" />
                      )}
                    </Button>
                  }
                >
                  <span className="pr-4">{lf(faq, 'question')}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-6 pt-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                  <div className="prose prose-sm max-w-none dark:prose-invert border-l-2 border-primary/20 pl-4 ml-2">
                    {lf(faq, 'answer')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 hero-image opacity-20">
              <img 
                src={forexFaqHero} 
                alt={t('faqs_hero_image_alt')} 
                className="w-full h-full object-cover"
                loading="eager"
                width={1920}
                height={1080}
                
              />
            </div>
            <div className="absolute inset-0 bg-gradient-hero-premium grain-texture" />
            <div className="container px-4 relative z-20 on-hero">
              <div className="max-w-4xl mx-auto text-center">
                <HelpCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h1 className="fluid-h1 font-bold font-display tracking-tighter text-white mb-6 text-shadow-hero">
                  {t('faqs_loading')}
                </h1>
              </div>
            </div>
          </section>
          <section className="py-20">
            <div className="container px-4">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 hero-image opacity-20">
              <img 
                src={forexFaqHero} 
                alt={t('faqs_hero_image_alt')} 
                className="w-full h-full object-cover"
                loading="eager"
                width={1920}
                height={1080}
                
              />
            </div>
            <div className="absolute inset-0 bg-gradient-hero-premium grain-texture" />
            <div className="container px-4 relative z-20 on-hero">
              <div className="max-w-4xl mx-auto text-center">
                <HelpCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h1 className="fluid-h1 font-bold font-display tracking-tighter text-white mb-6 text-shadow-hero">
                  {t('faqs_error')}
                </h1>
                <p className="text-hero-body text-white/90 mb-8 max-w-3xl mx-auto">
                  {error}
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-subtle grain-texture">
          <div className="absolute inset-0 hero-image opacity-20">
            <img 
              src={forexFaqHero} 
              alt={t('faqs_hero_image_alt')} 
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
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
          <div className="container px-4 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <HelpCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h1 className="fluid-h1 font-bold font-display tracking-tighter text-white mb-6 text-shadow-hero">
                {t('faqs_title')}
              </h1>
              <p className="text-hero-body text-white/90 mb-8 max-w-3xl mx-auto">{t('faqs_hero_subtitle')}</p>
            </div>
          </div>
        </section>

        {/* FAQs Content */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                {/* Category Tabs - Sticky */}
                <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 -mx-4 px-4 py-4 mb-8">
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="inline-flex w-max min-w-full bg-muted/50 border border-border/50 p-1.5 gap-1 shadow-sm">
                      <TabsTrigger 
                        value="all" 
                        className="text-sm font-medium px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-background/50"
                      >
                        📋 {t('faqs_tab_all')}
                      </TabsTrigger>
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="text-sm font-medium px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-background/50"
                          >
                            <IconComponent className="h-4 w-4 mr-2" />
                            {category.label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('faqs_search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                    {searchQuery && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                        {filteredFAQs.length} {filteredFAQs.length === 1 ? t('faqs_results_count_singular') : t('faqs_results_count_plural')}
                      </div>
                    )}
                  </div>
                </div>

                {/* FAQ Content - All Categories */}
                <TabsContent value="all" className="mt-0">
                  {renderFAQContent()}
                </TabsContent>
                
                {/* FAQ Content - Individual Categories */}
                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-0">
                    {renderFAQContent()}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>

        {/* Risk Warning */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                    {"⚠️ "}{t('faqs_risk_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground/80">
                  <p>
                    <strong>{t('faqs_risk_p1_title')}</strong> {t('faqs_risk_p1_desc')}
                  </p>
                  <p>
                    <strong>{t('faqs_risk_p2_title')}</strong> {t('faqs_risk_p2_desc')}
                  </p>
                  <p>
                    <strong>{t('faqs_risk_p3_title')}</strong> {t('faqs_risk_p3_desc')}
                  </p>
                  <p>
                    <strong>{t('faqs_risk_p4_title')}</strong> {t('faqs_risk_p4_desc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <SectionDivider variant="wave" className="text-muted" />

        {/* Contact CTA */}
        <section className="py-20 near-footer-contrast grain-texture">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('faqs_still_have_questions')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('faqs_support_text')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" asChild>
                  <Link to="/contact">
                    {t('faqs_contact_us')}
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  {t('faqs_whatsapp_support')}
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default FAQs;
