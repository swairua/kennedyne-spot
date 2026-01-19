import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { runMigration, getMigrationSQL } from "@/utils/runMigration";
import {
  Eye,
  Edit,
  Trash2,
  Star,
  Plus,
  Users,
  Search,
  ArrowUpDown,
  ExternalLink,
  PowerOff,
  Power,
  Database,
  Copy,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type definitions
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled' | 'in_review' | 'archived';
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time_mins: number;
  featured_image_url: string | null;
  author_id: string;
  meta_title: string | null;
  meta_description: string | null;
  authors?: Author[];
  categories?: Category[];
  tags?: Tag[];
}

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Status styling helpers
const statusColors = {
  draft: 'secondary',
  published: 'default',
  scheduled: 'outline',
  in_review: 'secondary',
  archived: 'destructive'
} as const;

const statusLabels = {
  draft: 'Draft',
  published: 'Published', 
  scheduled: 'Scheduled',
  in_review: 'In Review',
  archived: 'Archived'
} as const;

export default function BlogManagerEnhanced() {
  const { toast } = useToast();
  
  // State management
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{success: boolean; message: string} | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with relationships
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          post_authors(
            authors(id, name, slug, bio, avatar_url)
          ),
          post_categories(
            categories(id, name, slug, description)
          ),
          post_tags(
            tags(id, name, slug)
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Transform the data
      const transformedPosts = postsData?.map(post => ({
        ...post,
        authors: post.post_authors?.map((pa: any) => pa.authors) || [],
        categories: post.post_categories?.map((pc: any) => pc.categories) || [],
        tags: post.post_tags?.map((pt: any) => pt.tags) || []
      })) || [];

      setPosts(transformedPosts);

      // Fetch authors
      const { data: authorsData, error: authorsError } = await supabase
        .from('authors')
        .select('*')
        .order('name');

      if (authorsError) throw authorsError;
      setAuthors(authorsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const matchesAuthor = authorFilter === 'all' || 
                          post.authors?.some(author => author.id === authorFilter);
      const matchesCategory = categoryFilter === 'all' || 
                            post.categories?.some(category => category.id === categoryFilter);
      
      return matchesSearch && matchesStatus && matchesAuthor && matchesCategory;
    });
  }, [posts, searchTerm, statusFilter, authorFilter, categoryFilter]);

  // Delete post handler - opens confirmation modal
  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete.id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postToDelete.id));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Publish/unpublish toggle
  const handlePublishToggle = async (post: BlogPost) => {
    try {
      if (post.published) {
        const { error } = await supabase.rpc('unpublish_post', {
          _post_id: post.id
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('publish_post', {
          _post_id: post.id
        });
        if (error) throw error;
      }

      await fetchData();
      toast({
        title: 'Success',
        description: `Post ${post.published ? 'unpublished' : 'published'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post status',
        variant: 'destructive',
      });
    }
  };

  // Run database migration
  const handleRunMigration = async () => {
    setMigrationRunning(true);
    setMigrationResult(null);

    try {
      const result = await runMigration('001_add_blog_cta_fields');
      setMigrationResult(result);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Migration Not Available',
          description: result.message || 'Please run the migration manually via Supabase SQL Editor',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMigrationResult({
        success: false,
        message: `Error: ${errorMessage}`
      });
      toast({
        title: 'Error',
        description: 'Failed to run migration',
        variant: 'destructive',
      });
    } finally {
      setMigrationRunning(false);
    }
  };

  // Copy SQL to clipboard
  const handleCopySql = async () => {
    const sql = getMigrationSQL('001_add_blog_cta_fields');
    if (sql) {
      try {
        await navigator.clipboard.writeText(sql);
        toast({
          title: 'Copied',
          description: 'SQL copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy SQL',
          variant: 'destructive',
        });
      }
    }
  };

  // Legacy posts data and import functionality
  const legacyPosts = [
    {
      id: "market-structure",
      title: "Understanding Market Structure: A Beginner's Guide",
      excerpt: "Learn the fundamentals of market structure and how institutional traders view price movements. This comprehensive guide covers the basics of support and resistance, trend analysis, and key levels that drive market behavior.",
      category: "Education",
      date: "March 15, 2024",
      readTime: "5 min read",
      featured: true
    },
    {
      id: "risk-management",
      title: "Risk Management: The Foundation of Successful Trading",
      excerpt: "Why proper risk management is more important than finding the perfect setup. Discover how to calculate position sizes, set stop losses, and manage your trading capital effectively.",
      category: "Risk Management", 
      date: "March 10, 2024",
      readTime: "7 min read",
      featured: true
    },
    {
      id: "trading-psychology",
      title: "The Psychology of Trading: Overcoming Common Mental Traps",
      excerpt: "How to develop the discipline and mindset needed for consistent trading performance. Learn about FOMO, overconfidence, and other psychological barriers that affect traders.",
      category: "Psychology",
      date: "March 5, 2024",
      readTime: "6 min read",
      featured: false
    },
    {
      id: "smart-money",
      title: "Smart Money Concepts: Following Institutional Flow",
      excerpt: "Understanding how banks and institutions move the market and how retail traders can align with these movements through proper analysis.",
      category: "Education",
      date: "February 28, 2024",
      readTime: "8 min read",
      featured: false
    },
    {
      id: "trading-journal",
      title: "Building Your Trading Journal: Track Progress Not Just Profits",
      excerpt: "Why keeping a detailed trading journal is crucial for improvement and how to structure it effectively for maximum learning benefit.",
      category: "Education",
      date: "February 20, 2024",
      readTime: "4 min read", 
      featured: false
    }
  ];

  const handleImportLegacyPosts = async () => {
    if (selectedPosts.length === 0) {
      toast({
        title: 'No posts selected',
        description: 'Please select at least one post to import',
        variant: 'destructive',
      });
      return;
    }

    try {
      const postsToImport = legacyPosts.filter(post => selectedPosts.includes(post.id));

      // Get or create author
      let authorId;
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('name', 'KenneDyne spot')
        .single();

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const { data: newAuthor } = await supabase
          .from('authors')
          .insert({
            name: 'KenneDyne spot',
            slug: 'kennedyne-spot',
            bio: 'Professional trading education team'
          })
          .select('id')
          .single();
        authorId = newAuthor.id;
      }

      // Featured images by category
      const featuredImages = {
        'Education': '/lovable-uploads/trading-strategy.jpg',
        'Risk Management': '/lovable-uploads/risk-management.jpg',
        'Psychology': '/lovable-uploads/market-psychology.jpg'
      };

      // Get or create categories
      const categoryMap = new Map();
      for (const post of postsToImport) {
        const categorySlug = post.category.toLowerCase().replace(/\s+/g, '-');
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (existingCategory) {
          categoryMap.set(post.category, existingCategory.id);
        } else {
          const { data: newCategory } = await supabase
            .from('categories')
            .insert({
              name: post.category,
              slug: categorySlug
            })
            .select('id')
            .single();
          categoryMap.set(post.category, newCategory.id);
        }
      }

      // Insert posts
      let imported = 0;
      let skipped = 0;
      
      for (const post of postsToImport) {
        const slug = post.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (!existingPost) {
          const content = `# ${post.title}

${post.excerpt}

## Introduction

This article provides comprehensive insights into ${post.title.toLowerCase()}. Our educational content is designed to help traders understand key concepts and improve their trading skills.

## Key Takeaways

- Learn fundamental concepts
- Understand practical applications
- Develop better trading habits
- Improve your overall trading performance

## Conclusion

Understanding these concepts is crucial for trading success. Continue your education with our other articles and resources.

---

*This content is for educational purposes only. Trading involves risk and may not be suitable for all investors.*`;

          const publishedAt = new Date(post.date).toISOString();
          const readingTimeMins = parseInt(post.readTime.split(' ')[0]);

          const { data: newPost } = await supabase
            .from('blog_posts')
            .insert({
              title: post.title,
              slug: slug,
              excerpt: post.excerpt,
              content: content,
              author_id: authorId,
              published: true,
              published_at: publishedAt,
              reading_time_mins: readingTimeMins,
              featured: post.featured,
              status: 'published',
              featured_image_url: featuredImages[post.category] || featuredImages['Education'],
              meta_title: post.title,
              meta_description: post.excerpt,
              schema_type: 'Article'
            })
            .select('id')
            .single();

          // Create author association
          await supabase
            .from('post_authors')
            .insert({
              post_id: newPost.id,
              author_id: authorId
            });

          // Create category association
          await supabase
            .from('post_categories')
            .insert({
              post_id: newPost.id,
              category_id: categoryMap.get(post.category)
            });

          imported++;
        } else {
          skipped++;
        }
      }

      await fetchData();
      setShowImportModal(false);
      setSelectedPosts([]);
      
      toast({
        title: 'Import completed',
        description: `Imported ${imported} posts, skipped ${skipped} existing posts`,
      });
    } catch (error) {
      console.error('Error importing legacy posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import legacy posts',
        variant: 'destructive',
      });
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blog posts, authors, and content
          </p>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setShowMigrationModal(true)}
                size="sm"
                className="text-xs"
              >
                <Database className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Run database migrations
            </TooltipContent>
          </Tooltip>

          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="mr-2"
          >
            Import Legacy Posts
          </Button>
          <Button asChild>
            <Link to="/admin/blog/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {posts.filter(p => p.published).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Authors</p>
                <p className="text-2xl font-bold">{authors.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-8 p-0 font-medium">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No posts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        {post.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{post.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.authors?.[0]?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {post.categories?.[0]?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[post.status]}>
                        {statusLabels[post.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.published_at ? 
                        new Date(post.published_at).toLocaleDateString() : 
                        'Not published'
                      }
                    </TableCell>
                     <TableCell className="text-right">
                       <TooltipProvider>
                         <div className="flex items-center justify-end gap-2">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 asChild
                               >
                                 <Link to={`/blog/${post.slug}`} target="_blank">
                                   <ExternalLink className="h-4 w-4" />
                                 </Link>
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>View public page</p>
                             </TooltipContent>
                           </Tooltip>
                           
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 asChild
                               >
                                 <Link to={`/admin/blog/${post.id}`}>
                                   <Edit className="h-4 w-4" />
                                 </Link>
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Edit post</p>
                             </TooltipContent>
                           </Tooltip>
                           
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handlePublishToggle(post)}
                               >
                                 {post.published ? 
                                   <PowerOff className="h-4 w-4" /> : 
                                   <Power className="h-4 w-4" />
                                 }
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>{post.published ? 'Unpublish' : 'Publish'}</p>
                             </TooltipContent>
                           </Tooltip>
                           
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDelete(post)}
                                 className="text-destructive hover:text-destructive"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Delete post</p>
                             </TooltipContent>
                           </Tooltip>
                         </div>
                       </TooltipProvider>
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Legacy Posts Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Legacy Blog Posts</DialogTitle>
            <DialogDescription>
              Select which blog posts you'd like to import into the database. Featured images will be automatically assigned based on category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedPosts.length === legacyPosts.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPosts(legacyPosts.map(p => p.id));
                  } else {
                    setSelectedPosts([]);
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({legacyPosts.length} posts)
              </label>
            </div>
            
            <div className="grid gap-4">
              {legacyPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={post.id}
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{post.title}</h4>
                        <Badge variant={post.featured ? "default" : "secondary"}>
                          {post.featured ? "Featured" : "Regular"}
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportLegacyPosts} disabled={selectedPosts.length === 0}>
              Import {selectedPosts.length} Selected Posts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={postToDelete !== null} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{postToDelete?.title}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
