import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Eye, Send, ArrowLeft, Clock, Star, Tag, User, FileText, Search, X, Upload, Settings, Pencil, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedMarkdownRenderer } from '@/components/content/EnhancedMarkdownRenderer';
import { ContentFormatAnalyzer } from '@/components/editor/ContentFormatAnalyzer';
import { EditorChecklist } from '@/components/editor/EditorChecklist';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { SocialPreviewCard } from '@/components/editor/SocialPreviewCard';
import { Languages } from 'lucide-react';
import { formatTypography, cleanPastedContent } from '@/utils/contentFormatter';
import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import MarkdownGuide from '@/components/content/MarkdownGuide';
import { ImageInput } from '@/components/ui/image-input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { LinkPicker } from '@/components/editor/LinkPicker';

const NAIROBI_TZ = 'Africa/Nairobi';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';
  featured: boolean;
  published: boolean;
  scheduled_at?: string;
  published_at?: string;
  updated_at?: string;
  reading_time_mins: number;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_robots: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_card: string;
  schema_type: string;
  schema_json_ld?: any;
  featured_image_url?: string;
  author_id: string;
  // CTA Fields
  cta_type?: string;
  cta_title?: string;
  cta_url?: string;
  cta_enabled?: boolean;
  // Translations
  title_fr?: string;
  title_es?: string;
  title_de?: string;
  title_ru?: string;
  excerpt_fr?: string;
  excerpt_es?: string;
  excerpt_de?: string;
  excerpt_ru?: string;
  content_fr?: string;
  content_es?: string;
  content_de?: string;
  content_ru?: string;
  meta_title_fr?: string;
  meta_title_es?: string;
  meta_title_de?: string;
  meta_title_ru?: string;
  meta_description_fr?: string;
  meta_description_es?: string;
  meta_description_de?: string;
  meta_description_ru?: string;
  translation_status?: any;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featured: false,
    published: false,
    reading_time_mins: 1,
    meta_robots: 'index,follow',
    twitter_card: 'summary_large_image',
    schema_type: 'Article',
    author_id: '',
    cta_type: 'whatsapp',
    cta_title: '',
    cta_url: '',
    cta_enabled: true
  });

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'checking' | 'idle'>('idle');
  const [conflictingPost, setConflictingPost] = useState<{id: string, title: string} | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = post.content || '';
    
    const newContent = 
      currentContent.substring(0, start) + 
      textToInsert + 
      currentContent.substring(end);

    setPost({ ...post, content: newContent });
    
    // Restore cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch taxonomy data
      const [authorsRes, categoriesRes, tagsRes, postsRes] = await Promise.all([
        supabase.from('authors').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase.from('blog_posts').select('id, title, slug').order('title')
      ]);

      if (authorsRes.error) throw authorsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (postsRes.error) throw postsRes.error;

      setAuthors(authorsRes.data || []);
      setCategories(categoriesRes.data || []);
      setTags(tagsRes.data || []);
      setAvailablePosts(postsRes.data || []);

      // If editing existing post, fetch it
      if (!isNew && id) {
        // Fetch post data first
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (postError) throw postError;

        // Then fetch relationships separately to avoid schema cache issues
        const [authorsRes, categoriesRes, tagsRes, relatedRes] = await Promise.all([
          supabase.from('post_authors').select('author_id').eq('post_id', id),
          supabase.from('post_categories').select('category_id').eq('post_id', id),
          supabase.from('post_tags').select('tag_id').eq('post_id', id),
          supabase.from('post_related').select('related_post_id').eq('post_id', id)
        ]);

        setPost(postData);
        setSelectedAuthors(authorsRes.data?.map((pa: any) => pa.author_id) || []);
        setSelectedCategories(categoriesRes.data?.map((pc: any) => pc.category_id) || []);
        setSelectedTags(tagsRes.data?.map((pt: any) => pt.tag_id) || []);
        setRelatedPosts(relatedRes.data?.map((pr: any) => pr.related_post_id) || []);
        
        if (postData.scheduled_at) {
          const nairobiTime = toZonedTime(new Date(postData.scheduled_at), NAIROBI_TZ);
          setScheduleDateTime(format(nairobiTime, "yyyy-MM-dd'T'HH:mm"));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = (error as any).message || String(error);
      const isSchemaError = errorMessage.includes('schema cache') || errorMessage.includes('could not find');
      
      toast({
        title: 'Error',
        description: isSchemaError 
          ? 'Database schema cache error. Please reload the page and try again.'
          : `Failed to fetch blog data: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug) {
      setSlugStatus('idle');
      setConflictingPost(null);
      return;
    }
    
    setSlugStatus('checking');
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title')
        .eq('slug', slug);

      // Only exclude current post if we have a valid post ID
      if (post.id) {
        query = query.neq('id', post.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking slug:', error);
        setSlugStatus('idle');
        return;
      }
      
      if (data.length > 0) {
        setSlugStatus('taken');
        setConflictingPost(data[0]);
      } else {
        setSlugStatus('available');
        setConflictingPost(null);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugStatus('idle');
    }
  }, [post.id]);

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let query = supabase
      .from('blog_posts')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    // Only exclude current post if we have a valid post ID
    if (post.id) {
      query = query.neq('id', post.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking slug variants:', error);
      return baseSlug;
    }
    
    const existingSlugs = data.map(item => item.slug);
    
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }
    
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (existingSlugs.includes(newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
    
    return newSlug;
  };

  const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    let query = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    // Only exclude current post if we have a valid post ID
    if (post.id) {
      query = query.neq('id', post.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug:', error);
      return false;
    }
    
    return data.length === 0;
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title && isNew) {
      const newSlug = generateSlug(post.title);
      setPost(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  }, [post.title, isNew]);

  // Auto-calculate reading time
  useEffect(() => {
    setPost(prev => ({
      ...prev,
      reading_time_mins: calculateReadingTime(prev.content)
    }));
  }, [post.content]);

  // Check slug availability when slug changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (post.slug) {
        checkSlugAvailability(post.slug);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [post.slug, checkSlugAvailability]);

  // Auto-populate CTA URL with current blog post URL when editing
  useEffect(() => {
    if (!isNew && post.slug && post.cta_type === 'link') {
      const expectedUrl = `https://kennedynespot.com/blog/${post.slug}`;
      // Update if URL is empty or doesn't match current slug
      if (!post.cta_url || !post.cta_url.endsWith(post.slug)) {
        setPost(prev => ({ ...prev, cta_url: expectedUrl }));
      }
    }
  }, [post.slug, post.cta_type, isNew]);

  const handleSave = async (shouldPublish = false) => {
    try {
      setSaving(true);

      // Validate required fields
      if (!post.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Title is required',
          variant: 'destructive',
        });
        return;
      }

      if (!post.slug.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Slug is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate author_id for new posts
      let finalAuthorId = post.author_id;
      if (!finalAuthorId && authors.length > 0) {
        finalAuthorId = authors[0].id;
        setPost(prev => ({ ...prev, author_id: finalAuthorId }));
        toast({
          title: 'Author Auto-Selected',
          description: `Author was set to "${authors[0].name}" as default.`,
        });
      }

      if (!finalAuthorId) {
        toast({
          title: 'Validation Error',
          description: 'At least one author must be available. Please create an author first.',
          variant: 'destructive',
        });
        return;
      }

      // Auto-fix slug if needed
      let finalSlug = post.slug;
      const isSlugUnique = await checkSlugUniqueness(post.slug);
      if (!isSlugUnique) {
        finalSlug = await generateUniqueSlug(post.slug);
        setPost(prev => ({ ...prev, slug: finalSlug }));
        toast({
          title: 'Slug Auto-Fixed',
          description: `Slug was changed to "${finalSlug}" to avoid conflicts.`,
        });
      }

      const postData = {
        ...post,
        slug: finalSlug,
        author_id: finalAuthorId,
        published: shouldPublish || post.published,
        status: shouldPublish ? 'published' : post.status,
        published_at: shouldPublish && !post.published ? new Date().toISOString() : post.published_at
      };

      let savedPost;
      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
      }

      // Update relationships
      const postId = savedPost.id;

      // Update authors - ensure at least one author
      await supabase.from('post_authors').delete().eq('post_id', postId);
      let authorsToInsert = selectedAuthors;
      
      // If no authors selected, use the first available author or create a default one
      if (authorsToInsert.length === 0) {
        if (authors.length > 0) {
          authorsToInsert = [authors[0].id];
        } else {
          // Create a default author if none exist
          const { data: defaultAuthor } = await supabase
            .from('authors')
            .insert({
              name: 'Admin',
              slug: 'admin',
              bio: 'Site administrator'
            })
            .select('id')
            .single();
          authorsToInsert = [defaultAuthor.id];
        }
      }
      
      const authorRelations = authorsToInsert.map(authorId => ({
        post_id: postId,
        author_id: authorId
      }));
      await supabase.from('post_authors').insert(authorRelations);

      // Update categories
      await supabase.from('post_categories').delete().eq('post_id', postId);
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));
        await supabase.from('post_categories').insert(categoryRelations);
      }

      // Update tags
      await supabase.from('post_tags').delete().eq('post_id', postId);
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }));
        await supabase.from('post_tags').insert(tagRelations);
      }

      // Update related posts
      await supabase.from('post_related').delete().eq('post_id', postId);
      if (relatedPosts.length > 0) {
        const relatedRelations = relatedPosts.map(relatedId => ({
          post_id: postId,
          related_post_id: relatedId
        }));
        await supabase.from('post_related').insert(relatedRelations);
      }

      setPost(savedPost);
      
      toast({
        title: 'Success',
        description: shouldPublish ? 'Post published successfully' : 'Post saved successfully',
      });

      if (isNew) {
        navigate(`/admin/blog/${savedPost.id}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: `Failed to save post: ${(error as any).message || error}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDateTime) {
      toast({
        title: 'Validation Error',
        description: 'Please select a schedule date and time',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Convert from Nairobi time to UTC
      const nairobiDate = new Date(scheduleDateTime);
      const utcDate = fromZonedTime(nairobiDate, NAIROBI_TZ);

      if (!isNew && id) {
        const { error } = await supabase.rpc('schedule_post', {
          _post_id: id,
          _scheduled_at: utcDate.toISOString()
        });

        if (error) throw error;

        setPost(prev => ({
          ...prev,
          status: 'scheduled',
          scheduled_at: utcDate.toISOString()
        }));

        toast({
          title: 'Success',
          description: 'Post scheduled successfully',
        });
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Error',
        description: `Failed to schedule post: ${(error as any).message || error}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (!loading) {
      setHasUnsavedChanges(true);
    }
  }, [post.title, post.content, post.excerpt, selectedAuthors, selectedCategories, selectedTags, loading]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/admin/blog');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/admin/blog');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setPost(prev => ({ ...prev, featured_image_url: data.publicUrl }));
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!post.title || !post.excerpt) {
      toast({
        title: "Missing Content",
        description: "Please add at least a title and excerpt before translating.",
        variant: "destructive",
      });
      return;
    }

    setTranslating(true);
    const languages: Array<'fr' | 'es' | 'de' | 'ru'> = ['fr', 'es', 'de', 'ru'];
    const fields = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'];
    
    let successCount = 0;
    let failureCount = 0;

    try {
      const updatedPost = { ...post };
      const newStatus = { ...(post.translation_status || {}) } as Record<string, 'auto' | 'complete' | 'pending' | 'missing'>;

      for (const lang of languages) {
        let langSuccess = false;
        
        for (const field of fields) {
          const sourceText = (post[field as keyof BlogPost] as string || '').trim();
          if (!sourceText) continue;

          try {
            const { data, error } = await supabase.functions.invoke('auto-translate-content', {
              body: {
                text: sourceText,
                targetLang: lang,
                sourceLang: 'en'
              }
            });

            if (error) {
              console.error(`Translation API error for ${field} to ${lang}:`, error);
              failureCount++;
              continue;
            }

            const translatedText = (data?.translatedText || '').trim();
            
            // Only update if translation actually changed the text
            if (translatedText && translatedText !== sourceText) {
              const targetField = `${field}_${lang}`;
              (updatedPost as any)[targetField] = translatedText;
              langSuccess = true;
              successCount++;
            } else {
              console.warn(`Translation for ${field} to ${lang} returned unchanged text`);
              failureCount++;
            }
          } catch (err) {
            console.error(`Failed to translate ${field} to ${lang}:`, err);
            failureCount++;
          }
        }

        // Only mark as 'auto' if at least one field was successfully translated
        if (langSuccess) {
          newStatus[lang] = 'auto';
        } else {
          newStatus[lang] = 'missing';
        }
      }

      updatedPost.translation_status = newStatus;
      setPost(updatedPost);
      
      if (successCount > 0) {
        toast({
          title: "Auto-Translation Complete",
          description: `Successfully translated ${successCount} fields. Remember to save your changes.${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
        });
      } else {
        toast({
          title: "Translation Service Unavailable",
          description: "The translation service is currently unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error.message || "An error occurred during translation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          {hasUnsavedChanges && (
            <Button variant="outline" onClick={handleCancel} className="text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? 'Create New Post' : 'Edit Post'}
            </h1>
            {!isNew && (
              <p className="text-muted-foreground mt-1">
                Last updated: {format(new Date(post.updated_at || Date.now()), 'PPP')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={() => { handleSave(); setHasUnsavedChanges(false); }} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => { handleSave(true); setHasUnsavedChanges(false); }} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h1>{post.title}</h1>
            {post.excerpt && <p className="lead">{post.excerpt}</p>}
            <EnhancedMarkdownRenderer 
              content={post.content}
              showTOC={false}
              showProgress={false}
              className="prose-sm"
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="write" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Translations
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Publish
            </TabsTrigger>
          </TabsList>

          {/* WRITE TAB */}
          <TabsContent value="write" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Write Your Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter an engaging title..."
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description that will appear in previews..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A short summary of your post (recommended: 150-160 characters)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editor Column */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="content">Content *</Label>
                      <Badge variant="outline">{post.reading_time_mins} min read</Badge>
                    </div>
                    <RichTextEditor
                      markdown={post.content}
                      onChange={(markdown) => setPost(prev => ({ ...prev, content: markdown }))}
                      placeholder="Start writing your blog post..."
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Use the toolbar to format your content. Click the Image button to insert images.
                    </p>
                  </div>

                  {/* Live Preview Column */}
                  <div className="border rounded-lg bg-muted/30 p-4 overflow-auto max-h-[600px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {post.title && (
                        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                      )}
                      {post.excerpt && (
                        <p className="lead text-muted-foreground text-sm italic mb-4">{post.excerpt}</p>
                      )}
                      {post.featured_image_url && (
                        <img
                          src={post.featured_image_url}
                          alt="Featured"
                          className="rounded-lg mb-4 w-full"
                        />
                      )}
                      {post.content ? (
                        <EnhancedMarkdownRenderer
                          content={post.content}
                          showTOC={false}
                          showProgress={false}
                          className="prose-sm"
                        />
                      ) : (
                        <p className="text-muted-foreground italic">Preview will appear here as you write...</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Categories & Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Categories</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`cat-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, category.id]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`cat-${category.id}`} className="cursor-pointer font-normal">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="mb-3 block">Tags</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {tags.map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags([...selectedTags, tag.id]);
                                } else {
                                  setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer font-normal">
                              {tag.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Author
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {authors.map((author) => (
                        <div key={author.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`author-${author.id}`}
                            checked={selectedAuthors.includes(author.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAuthors([...selectedAuthors, author.id]);
                              } else {
                                setSelectedAuthors(selectedAuthors.filter(id => id !== author.id));
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`author-${author.id}`} className="cursor-pointer font-normal">
                            {author.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="featured_image_url">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="featured_image_url"
                          value={post.featured_image_url || ''}
                          onChange={(e) => setPost(prev => ({ ...prev, featured_image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                            // Reset input so same file can be selected again
                            e.target.value = '';
                          }}
                          className="hidden"
                          id="featured-image-upload"
                          disabled={uploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('featured-image-upload')?.click()}
                          disabled={uploading}
                          className="whitespace-nowrap"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click Upload to select an image file, or paste a URL directly
                      </p>
                    </div>
                    {post.featured_image_url && (
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={post.featured_image_url}
                          alt="Featured"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Post Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Featured Post</Label>
                      <Switch
                        id="featured"
                        checked={post.featured}
                        onCheckedChange={(checked) => setPost(prev => ({ ...prev, featured: checked }))}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="slug">URL Slug *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="slug"
                          value={post.slug}
                          onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="post-url-slug"
                          className={`pr-10 ${
                            slugStatus === 'taken' ? 'border-destructive' : 
                            slugStatus === 'available' ? 'border-green-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {slugStatus === 'checking' && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
                          )}
                          {slugStatus === 'available' && (
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {slugStatus === 'taken' && (
                            <div className="h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          URL: /blog/{post.slug}
                        </p>
                        {slugStatus === 'taken' && conflictingPost && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <span>Slug already used by:</span>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-destructive underline"
                              onClick={() => navigate(`/admin/blog/${conflictingPost.id}`)}
                            >
                              "{conflictingPost.title}"
                            </Button>
                          </div>
                        )}
                        {slugStatus === 'taken' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              const newSlug = await generateUniqueSlug(post.slug);
                              setPost(prev => ({ ...prev, slug: newSlug }));
                            }}
                          >
                            Auto-fix slug
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Call-to-Action (CTA)</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure a custom button at the end of this blog post
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cta_enabled" className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id="cta_enabled"
                          checked={post.cta_enabled ?? true}
                          onChange={(e) => setPost(prev => ({ ...prev, cta_enabled: e.target.checked }))}
                          className="rounded"
                        />
                        <span>Show CTA on this post</span>
                      </Label>
                    </div>

                    {post.cta_enabled !== false && (
                      <>
                        <div>
                          <Label htmlFor="cta_type">CTA Type</Label>
                          <Select
                            value={post.cta_type || 'whatsapp'}
                            onValueChange={(value) => setPost(prev => ({ ...prev, cta_type: value }))}
                          >
                            <SelectTrigger id="cta_type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="link">Website Link</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone Call</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="cta_title">Button Text</Label>
                          <Input
                            id="cta_title"
                            value={post.cta_title || ''}
                            onChange={(e) => setPost(prev => ({ ...prev, cta_title: e.target.value }))}
                            placeholder={`e.g., "${post.cta_type === 'whatsapp' ? 'Contact on WhatsApp' : post.cta_type === 'email' ? 'Email Us' : post.cta_type === 'phone' ? 'Call Us' : 'Learn More'}"`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            The text that appears on the button
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="cta_url">
                            {post.cta_type === 'whatsapp' ? 'WhatsApp Number' : post.cta_type === 'email' ? 'Email Address' : post.cta_type === 'phone' ? 'Phone Number' : 'URL'}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="cta_url"
                              value={post.cta_url || ''}
                              onChange={(e) => setPost(prev => ({ ...prev, cta_url: e.target.value }))}
                              placeholder={
                                post.cta_type === 'whatsapp' ? '+1234567890' :
                                post.cta_type === 'email' ? 'hello@example.com' :
                                post.cta_type === 'phone' ? '+1234567890' :
                                'https://kennedynespot.com/blog/your-post-slug'
                              }
                            />
                            {post.cta_type === 'link' && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowLinkPicker(true)}
                              >
                                Pick Link
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.cta_type === 'whatsapp' ? 'WhatsApp number with country code' :
                             post.cta_type === 'email' ? 'Email address' :
                             post.cta_type === 'phone' ? 'Phone number with country code' :
                             'Use "Pick Link" button to select a blog post or page'}
                          </p>
                        </div>

                        <div className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium mb-2">Preview:</p>
                          <Button disabled className="w-full">
                            {post.cta_title || `Contact on ${post.cta_type === 'whatsapp' ? 'WhatsApp' : post.cta_type === 'email' ? 'Email' : post.cta_type === 'phone' ? 'Phone' : 'our site'}`}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={post.meta_title || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO title (defaults to post title)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={post.meta_description || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description (defaults to excerpt)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      value={post.canonical_url || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, canonical_url: e.target.value }))}
                      placeholder="https://example.com/original-article"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_robots">Robots Meta Tag</Label>
                    <Select 
                      value={post.meta_robots}
                      onValueChange={(value) => setPost(prev => ({ ...prev, meta_robots: value }))}
                    >
                      <SelectTrigger id="meta_robots">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index, follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                        <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                        <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Sharing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="og_title">Open Graph Title</Label>
                    <Input
                      id="og_title"
                      value={post.og_title || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, og_title: e.target.value }))}
                      placeholder="Social media title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="og_description">Open Graph Description</Label>
                    <Textarea
                      id="og_description"
                      value={post.og_description || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, og_description: e.target.value }))}
                      placeholder="Social media description"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="og_image_url">Open Graph Image URL</Label>
                    <Input
                      id="og_image_url"
                      value={post.og_image_url || ''}
                      onChange={(e) => setPost(prev => ({ ...prev, og_image_url: e.target.value }))}
                      placeholder="Social media image URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter_card">Twitter Card Type</Label>
                    <Select 
                      value={post.twitter_card}
                      onValueChange={(value) => setPost(prev => ({ ...prev, twitter_card: value }))}
                    >
                      <SelectTrigger id="twitter_card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Preview */}
            <SocialPreviewCard
              title={post.title}
              description={post.excerpt}
              imageUrl={post.featured_image_url || null}
              slug={post.slug}
              ogTitle={post.og_title}
              ogDescription={post.og_description}
              ogImageUrl={post.og_image_url}
              featuredImageUrl={post.featured_image_url}
            />
          </TabsContent>

          {/* TRANSLATIONS TAB */}
          <TabsContent value="translations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>🌐 Translations</CardTitle>
                  <Button 
                    onClick={handleAutoTranslate} 
                    disabled={translating || !post.title || !post.content}
                    variant="default"
                  >
                    {translating ? 'Translating...' : 'Auto-Translate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fr" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                    <TabsTrigger value="es">🇪🇸 Español</TabsTrigger>
                    <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
                    <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
                  </TabsList>

                  {['fr', 'es', 'de', 'ru'].map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                      <div>
                        <Label>Title ({lang.toUpperCase()})</Label>
                        <Input
                          value={post[`title_${lang}` as keyof BlogPost] as string || ''}
                          onChange={(e) => setPost(prev => ({ ...prev, [`title_${lang}`]: e.target.value }))}
                          placeholder={`Translation of: ${post.title}`}
                        />
                      </div>
                      <div>
                        <Label>Excerpt ({lang.toUpperCase()})</Label>
                        <Textarea
                          value={post[`excerpt_${lang}` as keyof BlogPost] as string || ''}
                          onChange={(e) => setPost(prev => ({ ...prev, [`excerpt_${lang}`]: e.target.value }))}
                          placeholder={`Translation of excerpt`}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Content ({lang.toUpperCase()})</Label>
                        <Textarea
                          value={post[`content_${lang}` as keyof BlogPost] as string || ''}
                          onChange={(e) => setPost(prev => ({ ...prev, [`content_${lang}`]: e.target.value }))}
                          placeholder={`Translation of content`}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PUBLISH TAB */}
          <TabsContent value="publish" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Publication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={post.status}
                    onValueChange={(value: any) => setPost(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {post.status === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={post.scheduled_at ? format(toZonedTime(new Date(post.scheduled_at), NAIROBI_TZ), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const localDate = new Date(e.target.value);
                          const zonedDate = fromZonedTime(localDate, NAIROBI_TZ);
                          setPost(prev => ({ ...prev, scheduled_at: zonedDate.toISOString() }));
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Time zone: East Africa Time (EAT)
                    </p>
                    {post.scheduled_at && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Scheduled for: {format(toZonedTime(new Date(post.scheduled_at), NAIROBI_TZ), 'PPP p')} EAT
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Publishing Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {post.title ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted"></div>
                      )}
                      <span>Title added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.content && post.content.length > 100 ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted"></div>
                      )}
                      <span>Content has sufficient length</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.featured_image_url ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted"></div>
                      )}
                      <span>Featured image set</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCategories.length > 0 ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted"></div>
                      )}
                      <span>At least one category selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.excerpt ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-yellow-500"></div>
                      )}
                      <span className={!post.excerpt ? "text-muted-foreground" : ""}>
                        Excerpt added {!post.excerpt && "(recommended)"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    variant="outline"
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={saving || !post.title || !post.content}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {saving ? 'Publishing...' : 'Publish Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h1>{post.title || 'Untitled Post'}</h1>
                {post.excerpt && <p className="lead text-muted-foreground">{post.excerpt}</p>}
                {post.featured_image_url && (
                  <img src={post.featured_image_url} alt="Featured" className="rounded-lg" />
                )}
                <EnhancedMarkdownRenderer 
                  content={post.content || '*No content yet...*'}
                  showTOC={false}
                  showProgress={false}
                  className="prose-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Picker Modal */}
      <LinkPicker
        isOpen={showLinkPicker}
        onClose={() => setShowLinkPicker(false)}
        onSelect={(url) => setPost(prev => ({ ...prev, cta_url: url }))}
        currentUrl={post.cta_url}
      />
    </div>
  );
}
