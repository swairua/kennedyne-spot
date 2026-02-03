import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface SocialPreviewCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  slug: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  featuredImageUrl?: string;
}

const SITE_URL = 'kennedynespot.com';
const DEFAULT_IMAGE = '/og/og-default.jpg';

export function SocialPreviewCard({
  title,
  description,
  imageUrl,
  slug,
  ogTitle,
  ogDescription,
  ogImageUrl,
  featuredImageUrl
}: SocialPreviewCardProps) {
  // Determine final values with fallbacks
  const finalTitle = ogTitle || title || 'Untitled Post';
  const finalDescription = ogDescription || description || '';
  const finalImage = ogImageUrl || featuredImageUrl || imageUrl || DEFAULT_IMAGE;
  const postUrl = `${SITE_URL}/blog/${slug || 'preview'}`;
  
  // Truncate text for previews
  const truncateTitle = (text: string, max: number) => 
    text.length > max ? text.substring(0, max - 3) + '...' : text;
  
  const truncateDesc = (text: string, max: number) =>
    text.length > max ? text.substring(0, max - 3) + '...' : text;

  // Check for issues
  const issues: string[] = [];
  if (!ogImageUrl && !featuredImageUrl) {
    issues.push('No custom OG image - using default');
  }
  if (!ogTitle && !title) {
    issues.push('Missing title');
  }
  if (!ogDescription && !description) {
    issues.push('Missing description');
  }
  if (finalDescription.length > 160) {
    issues.push('Description exceeds 160 chars');
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ExternalLink className="h-4 w-4" />
          Social Share Preview
        </CardTitle>
        {issues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {issues.map((issue, i) => (
              <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                <AlertCircle className="h-3 w-3 mr-1" />
                {issue}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="facebook" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="facebook" className="text-xs">Facebook</TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs">Twitter</TabsTrigger>
            <TabsTrigger value="linkedin" className="text-xs">LinkedIn</TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs">WhatsApp</TabsTrigger>
          </TabsList>

          {/* Facebook Preview */}
          <TabsContent value="facebook" className="mt-3">
            <div className="border rounded-lg overflow-hidden bg-card max-w-md">
              <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
                <img 
                  src={finalImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="p-3 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{SITE_URL}</p>
                <h3 className="font-semibold text-sm mt-1 line-clamp-2">{truncateTitle(finalTitle, 65)}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truncateDesc(finalDescription, 155)}</p>
              </div>
            </div>
          </TabsContent>

          {/* Twitter Preview */}
          <TabsContent value="twitter" className="mt-3">
            <div className="border rounded-xl overflow-hidden bg-card max-w-md">
              <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                <img 
                  src={finalImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="p-3 border-t">
                <h3 className="font-semibold text-sm line-clamp-2">{truncateTitle(finalTitle, 70)}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truncateDesc(finalDescription, 200)}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  {SITE_URL}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* LinkedIn Preview */}
          <TabsContent value="linkedin" className="mt-3">
            <div className="border rounded-lg overflow-hidden bg-card max-w-md">
              <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
                <img 
                  src={finalImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="p-3 border-t bg-muted/20">
                <h3 className="font-semibold text-sm line-clamp-2">{truncateTitle(finalTitle, 120)}</h3>
                <p className="text-xs text-muted-foreground mt-1">{SITE_URL}</p>
              </div>
            </div>
          </TabsContent>

          {/* WhatsApp Preview */}
          <TabsContent value="whatsapp" className="mt-3">
            <div className="border rounded-lg overflow-hidden bg-[#e7ffdb] max-w-sm">
              <div className="p-2 flex gap-2">
                <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                  <img 
                    src={finalImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#128c7e] font-medium">{SITE_URL}</p>
                  <h3 className="font-semibold text-xs line-clamp-2 text-[#303030]">{truncateTitle(finalTitle, 50)}</h3>
                  <p className="text-xs text-[#667781] line-clamp-1">{truncateDesc(finalDescription, 60)}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs">
          <p className="font-medium mb-1">OG Tags Summary:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li><span className="font-mono">og:title</span>: {truncateTitle(finalTitle, 50)}</li>
            <li><span className="font-mono">og:description</span>: {truncateDesc(finalDescription, 50)}</li>
            <li><span className="font-mono">og:image</span>: {finalImage.substring(0, 50)}...</li>
            <li><span className="font-mono">og:url</span>: {postUrl}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SocialPreviewCard;
