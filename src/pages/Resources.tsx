import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionDivider } from '@/components/SectionDivider';
import { FinalCTASection } from '@/components/FinalCTASection';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useCourses, useEbooks, useMaterials } from '@/hooks/useResources';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedField } from '@/hooks/useLocalizedContent';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, GraduationCap, FileText, Download, ExternalLink, Filter, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function Resources() {
  const { content } = useSiteContent();
  const { toast } = useToast();
  const { t, language } = useI18n();
  
  // Fetch from Supabase
  const { data: dbCourses = [] } = useCourses(true);
  const { data: dbEbooks = [] } = useEbooks(true);
  const { data: dbMaterials = [] } = useMaterials(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Handle URL hash for auto-selecting tabs
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the #
    if (hash === 'courses' || hash === 'ebooks' || hash === 'materials') {
      setActiveTab(hash);
    }
  }, []);

  const handleDownload = async (url: string, filename?: string) => {
    try {
      setDownloadingId(url);
      
      // Only sign actual Supabase Storage URLs; open site-relative or external URLs directly
      const isSupabaseStorageUrl = url.includes('/storage/v1/object/');

      if (isSupabaseStorageUrl) {
        const { data, error } = await supabase.functions.invoke('sign-resource-url', {
          body: { url, filename }
        });
        
        if (error || data?.error) {
          const errorMessage = data?.message || error?.message || "Could not generate download link";
          throw new Error(errorMessage);
        }
        
        if (data?.url) {
          // Create temporary anchor for download
          const link = document.createElement('a');
          link.href = data.url;
          link.download = data.filename || filename || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: t('resources_download_started'),
            description: t('resources_download_started_desc').replace('{{name}}', data.filename || filename || 'File'),
          });
        }
      } else {
        // External URL - open directly
        window.open(url, '_blank');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: t('resources_download_failed'),
        description: t('resources_download_failed_desc'),
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredResources = useMemo(() => {
    // Use Supabase data first, fallback to local content
    const courses = dbCourses.length > 0 ? dbCourses : (content?.resources?.courses || []);
    const ebooks = dbEbooks.length > 0 ? dbEbooks : (content?.resources?.ebooks || []);
    const materials = dbMaterials.length > 0 ? dbMaterials : (content?.resources?.materials || []);

    const allResources = [
      ...courses.map(item => ({ 
        ...item, 
        resourceType: 'course' as const,
        url: item.course_url || item.url,
        coverImageUrl: item.cover_image_url || item.coverImageUrl
      })),
      ...ebooks.map(item => ({ 
        ...item, 
        resourceType: 'ebook' as const,
        downloadUrl: item.download_url || item.downloadUrl,
        coverImageUrl: item.cover_image_url || item.coverImageUrl
      })),
      ...materials.map(item => ({ 
        ...item, 
        resourceType: 'material' as const,
        url: item.material_url || item.url,
        coverImageUrl: item.cover_image_url || item.coverImageUrl
      })),
    ];

    return allResources.filter(item => {
      // Use getLocalizedField for title/description
      const displayTitle = getLocalizedField(item, 'title', language);
      const displayDescription = getLocalizedField(item, 'description', language);
      const displayTags = Array.isArray(item.tags) ? item.tags : [];

      const lower = searchTerm.toLowerCase();
      const matchesSearch = (displayTitle || '').toLowerCase().includes(lower) ||
                           (displayDescription || '').toLowerCase().includes(lower) ||
                           displayTags.some((tag: string) => (tag || '').toLowerCase().includes(lower));

      const matchesLevel = levelFilter === 'all' || 
                          ('level' in item && (item as any).level === levelFilter);

      const matchesType = typeFilter === 'all' || 
                         item.resourceType === typeFilter ||
                         ('type' in item && (item as any).type === typeFilter);

      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'courses' && item.resourceType === 'course') ||
                        (activeTab === 'ebooks' && item.resourceType === 'ebook') ||
                        (activeTab === 'materials' && item.resourceType === 'material');
      
      // Filter by translation status for non-English languages
      const hasTranslation = language === 'en' || !item.translation_status || 
                            (typeof item.translation_status === 'object' && 
                             (item.translation_status[language] === 'complete' || 
                              item.translation_status[language] === 'auto'));

      return matchesSearch && matchesLevel && matchesType && matchesTab && hasTranslation;
    });
  }, [content.resources, searchTerm, levelFilter, typeFilter, activeTab, dbCourses, dbEbooks, dbMaterials, language]);

  const getDisplayTitle = (item: any) => {
    return getLocalizedField(item, 'title', language);
  };

  const getResourceIcon = (resourceType: string, materialType?: string) => {
    if (resourceType === 'course') return <GraduationCap className="h-5 w-5" />;
    if (resourceType === 'ebook') return <BookOpen className="h-5 w-5" />;
    if (resourceType === 'material') {
      switch (materialType) {
        case 'video': return <ExternalLink className="h-5 w-5" />;
        case 'pdf': return <FileText className="h-5 w-5" />;
        default: return <FileText className="h-5 w-5" />;
      }
    }
    return <FileText className="h-5 w-5" />;
  };

  const getDisplayDescription = (item: any) => {
    return getLocalizedField(item, 'description', language);
  };

  const getResourceAction = (item: any) => {
    if (item.resourceType === 'course') {
      const hasUrl = item.url || item.course_url;
      return (
        <Button asChild variant="hero" size="sm">
          {hasUrl ? (
            // Check if it's an external URL or internal course
            hasUrl.startsWith('http') ? (
              <a href={hasUrl} target="_blank" rel="noopener noreferrer">
                {t('resources_view_course')}
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            ) : (
              <Link to={`/courses/${item.slug}`}>
                {t('resources_view_course')}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            )
          ) : (
            <Link to={`/courses/${item.slug || 'coming-soon'}`}>
              {t('resources_preview_course')}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          )}
        </Button>
      );
    }

    if (item.resourceType === 'ebook') {
      const downloadUrl = item.downloadUrl || item.download_url;
      const isDownloading = downloadingId === downloadUrl;
      const hasFile = downloadUrl && downloadUrl.trim() !== '';
      
      return (
        <Button 
          variant="hero" 
          size="sm"
          onClick={() => {
            if (hasFile) {
              handleDownload(downloadUrl, `${getDisplayTitle(item)}.pdf`);
            } else {
              // Fallback: show preview or coming soon page
              toast({
                title: t('resources_preview_ebook'),
                description: `${getDisplayTitle(item)} ${t('resources_download_failed_desc')}`,
              });
            }
          }}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('resources_downloading') }
            </>
          ) : hasFile ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              {t('resources_download_pdf') }
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              {t('resources_preview_ebook') }
            </>
          )}
        </Button>
      );
    }

    if (item.resourceType === 'material') {
      const materialUrl = item.url || item.material_url;
      const isDownloading = downloadingId === materialUrl;
      const hasFile = materialUrl && materialUrl.trim() !== '';
      
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (hasFile) {
              handleDownload(materialUrl, `${getDisplayTitle(item)}.${item.type === 'sheet' ? 'pdf' : 'file'}`);
            } else {
              // Fallback: show material info or coming soon message
              toast({
                title: t('resources_preview_material'),
                description: `${getDisplayTitle(item)} ${t('resources_preview_available')}`,
              });
            }
          }}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('resources_preparing') }
            </>
          ) : hasFile ? (
            <>
              {item.type === 'sheet' || item.type === 'pdf' ? (
                <Download className="h-4 w-4 mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              {item.type === 'sheet' || item.type === 'pdf' ? t('resources_download') : t('resources_open')}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              {t('resources_preview_material') }
            </>
          )}
        </Button>
      );
    }
  };

  const totalCounts = {
    all: (dbCourses.length > 0 ? dbCourses : content.resources.courses).length + 
         (dbEbooks.length > 0 ? dbEbooks : content.resources.ebooks).length + 
         (dbMaterials.length > 0 ? dbMaterials : content.resources.materials).length,
    courses: (dbCourses.length > 0 ? dbCourses : content.resources.courses).length,
    ebooks: (dbEbooks.length > 0 ? dbEbooks : content.resources.ebooks).length,
    materials: (dbMaterials.length > 0 ? dbMaterials : content.resources.materials).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-image">
          <img
            src="/src/assets/education-hero.jpg"
            alt={t('resources_hero_image_alt')}
            className="w-full h-full object-cover"

            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-hero-premium grain-texture pointer-events-none" />
        
        <div className="container px-4 relative z-20 on-hero">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="fluid-h1 text-white mb-6">{t('resources_hero_title')}</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t('resources_hero_subtitle')}</p>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={t('resources_filter_all_levels')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('resources_filter_all_levels')}</SelectItem>
                  <SelectItem value="Beginner">{t('resources_level_beginner')}</SelectItem>
                  <SelectItem value="Intermediate">{t('resources_level_intermediate')}</SelectItem>
                  <SelectItem value="Advanced">{t('resources_level_advanced')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={t('resources_filter_all_types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('resources_filter_all_types')}</SelectItem>
                  <SelectItem value="course">{t('resources_filter_courses')}</SelectItem>
                  <SelectItem value="ebook">{t('resources_filter_ebooks')}</SelectItem>
                  <SelectItem value="pdf">{t('resources_filter_pdfs')}</SelectItem>
                  <SelectItem value="video">{t('resources_filter_videos')}</SelectItem>
                  <SelectItem value="sheet">{t('resources_filter_sheets')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                placeholder={t('resources_search_placeholder')}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('resources_tab_all')} ({totalCounts.all})
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {t('resources_tab_courses')} ({totalCounts.courses})
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t('resources_tab_ebooks')} ({totalCounts.ebooks})
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('resources_tab_materials')} ({totalCounts.materials})
              </TabsTrigger>
            </TabsList>


            <TabsContent value={activeTab} className="space-y-8">
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">{t('resources_none_found')}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setLevelFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    {t('resources_clear_filters')}
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((item) => (
                    <Card key={`${item.resourceType}-${String((item as any).id ?? (item as any).slug ?? (item as any).title)}`} className="group hover:shadow-lg transition-shadow">
                      <CardHeader>
                        {(item.coverImageUrl || item.cover_image_url || item.coverImage) && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-4">
                            <img 
                              src={item.coverImageUrl || item.cover_image_url || item.coverImage} 
                              alt={getDisplayTitle(item)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {getResourceIcon(item.resourceType, 'type' in item ? (item as any).type : undefined)}
                            {getDisplayTitle(item)}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0 capitalize">
                              {(() => {
                                const rt = item.resourceType;
                                if (rt === 'course') return t('resources_type_course');
                                if (rt === 'ebook') return t('resources_type_ebook');
                                if (rt === 'material') return t('resources_type_material');
                                return rt;
                              })()}
                            </Badge>


                          </div>
                        </div>
                        
                        <CardDescription className="line-clamp-2">
                          {getDisplayDescription(item)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {'level' in item && (
                            <Badge variant="secondary">{(() => {
                              const lvl = String((item as any).level || '').toLowerCase();
                              if (lvl === 'beginner') return t('resources_level_beginner');
                              if (lvl === 'intermediate') return t('resources_level_intermediate');
                              if (lvl === 'advanced') return t('resources_level_advanced');
                              return (item as any).level;
                            })()}</Badge>
                          )}
                          {'author' in item && (
                            <span>{t('resources_by')} {(item as any).author}</span>
                          )}
                          {'pages' in item && (item as any).pages && (
                            <span>{(item as any).pages} {t('resources_pages')}</span>
                          )}
                          {'topic' in item && (
                            <Badge variant="secondary">{getLocalizedField(item, 'topic', language)}</Badge>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{item.tags.length - 3} {t('resources_more')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status indicators */}
                        {(() => {
                          const itemUrl = item.url || item.course_url || item.download_url || item.downloadUrl || item.material_url;
                          if (!itemUrl && item.resourceType !== 'course') {
                            return (
                              <Badge variant="secondary" className="text-xs">{t('resources_preview_available')}</Badge>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Action */}
                        <div className="pt-2">
                          {getResourceAction(item)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <SectionDivider variant="angled" className="text-background" />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
