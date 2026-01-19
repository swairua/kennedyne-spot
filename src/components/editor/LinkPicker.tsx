import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Link as LinkIcon, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
}

interface LinkPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

const PRODUCTION_BASE_URL = 'https://kennedynespot.com';

const INTERNAL_ROUTES = [
  { label: 'Home', href: '/', category: 'Main' },
  { label: 'Blog', href: '/blog', category: 'Main' },
  { label: 'Services', href: '/services', category: 'Main' },
  { label: 'Mentorship', href: '/mentorship', category: 'Services' },
  { label: 'Learning Path', href: '/services/learn', category: 'Services' },
  { label: 'FAQs', href: '/faqs', category: 'Info' },
  { label: 'Contact', href: '/contact', category: 'Info' },
];

export const LinkPicker: React.FC<LinkPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
}) => {
  const [selectedTab, setSelectedTab] = useState<'blog' | 'internal' | 'external'>('blog');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [externalUrl, setExternalUrl] = useState(currentUrl && !currentUrl.startsWith('/') ? currentUrl : '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      if (selectedTab !== 'blog') return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug')
          .eq('published', true)
          .order('title');

        if (error) throw error;
        setBlogPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog posts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [selectedTab, toast]);

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoutes = INTERNAL_ROUTES.filter(route =>
    route.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlogPostSelect = (slug: string) => {
    const fullUrl = `${PRODUCTION_BASE_URL}/blog/${slug}`;
    onSelect(fullUrl);
    onClose();
  };

  const handleInternalRouteSelect = (href: string) => {
    const fullUrl = `${PRODUCTION_BASE_URL}${href}`;
    onSelect(fullUrl);
    onClose();
  };

  const handleExternalUrlSelect = () => {
    if (!externalUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    let url = externalUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    onSelect(url);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setExternalUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Select Link Destination
          </DialogTitle>
          <DialogDescription>
            Choose where you want the CTA button to link to
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Site Pages
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              External URL
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {blogPosts.length === 0 ? 'No published blog posts found' : 'No posts match your search'}
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <button
                      key={post.id}
                      onClick={() => handleBlogPostSelect(post.slug)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {PRODUCTION_BASE_URL}/blog/{post.slug}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Internal Pages Tab */}
          <TabsContent value="internal" className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {filteredRoutes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pages match your search</div>
                ) : (
                  Object.entries(
                    filteredRoutes.reduce((acc, route) => {
                      if (!acc[route.category]) acc[route.category] = [];
                      acc[route.category].push(route);
                      return acc;
                    }, {} as Record<string, typeof INTERNAL_ROUTES>)
                  ).map(([category, routes]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                      <div className="space-y-2">
                        {routes.map(route => (
                          <button
                            key={route.href}
                            onClick={() => handleInternalRouteSelect(route.href)}
                            className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {route.label}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {PRODUCTION_BASE_URL}{route.href}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* External URL Tab */}
          <TabsContent value="external" className="flex-1 flex flex-col">
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              <div>
                <Label htmlFor="external-url">Full URL</Label>
                <Input
                  id="external-url"
                  placeholder="https://example.com"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the complete URL starting with https:// or http://
                </p>
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                <p className="font-medium">Helpful Tips:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Always use https:// for secure websites</li>
                  <li>Make sure the URL is valid and accessible</li>
                  <li>Test the link after saving to ensure it works</li>
                </ul>
              </div>

              <div className="flex-1" />
              <Button onClick={handleExternalUrlSelect} className="w-full">
                Use This URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
