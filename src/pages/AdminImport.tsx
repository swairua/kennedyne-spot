import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSiteContent, getSiteContent, resetSiteContent, undoLastChange, getBackupHistory, restoreBackup, type SiteContent } from "@/content/siteContent";

export default function AdminImport() {
  const [htmlContent, setHtmlContent] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupHistory, setBackupHistory] = useState(getBackupHistory());
  const { toast } = useToast();

  const refreshHistory = () => {
    setBackupHistory(getBackupHistory());
  };

  const extractTextFromHTML = (html: string): Partial<SiteContent> => {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract content based on common patterns
    const extracted: Partial<SiteContent> = {};
    
    // Extract navigation
    const nav = doc.querySelector('nav') || doc.querySelector('.navigation') || doc.querySelector('[role="navigation"]');
    if (nav) {
      const brand = nav.querySelector('.brand, .logo, h1, .title')?.textContent?.trim();
      const links = Array.from(nav.querySelectorAll('a')).map(link => ({
        name: link.textContent?.trim() || '',
        href: link.getAttribute('href') || '#'
      })).filter(link => link.name);
      
      if (brand || links.length > 0) {
        extracted.navigation = {
          brand: brand || getSiteContent().navigation.brand,
          links: links.length > 0 ? links : getSiteContent().navigation.links
        };
      }
    }
    
    // Extract hero section
    const hero = doc.querySelector('.hero, .banner, .jumbotron, header') || doc.querySelector('h1')?.closest('section');
    if (hero) {
      const headline = hero.querySelector('h1')?.textContent?.trim();
      const subheadline = hero.querySelector('h2, .subtitle, .subheading, p')?.textContent?.trim();
      const badge = hero.querySelector('.badge, .tag, .label')?.textContent?.trim();
      
      if (headline || subheadline || badge) {
        extracted.hero = {
          ...getSiteContent().hero,
          ...(headline && { headline }),
          ...(subheadline && { subheadline }),
          ...(badge && { badge })
        };
      }
    }
    
    // Extract sections based on headings
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    headings.forEach(heading => {
      const text = heading.textContent?.trim().toLowerCase();
      const section = heading.closest('section') || heading.parentElement;
      
      if (text?.includes('service') && section) {
        const title = heading.textContent?.trim();
        const subtitle = section.querySelector('p')?.textContent?.trim();
        if (title) {
          extracted.services = {
            ...getSiteContent().services,
            title,
            ...(subtitle && { subtitle })
          };
        }
      }
      
      if (text?.includes('how') && text?.includes('work') && section) {
        const title = heading.textContent?.trim();
        const subtitle = section.querySelector('p')?.textContent?.trim();
        if (title) {
          extracted.howItWorks = {
            ...getSiteContent().howItWorks,
            title,
            ...(subtitle && { subtitle })
          };
        }
      }
      
      if (text?.includes('testimonial') && section) {
        const title = heading.textContent?.trim();
        const subtitle = section.querySelector('p')?.textContent?.trim();
        if (title) {
          extracted.testimonials = {
            ...getSiteContent().testimonials,
            title,
            ...(subtitle && { subtitle })
          };
        }
      }
    });
    
    // Extract footer
    const footer = doc.querySelector('footer');
    if (footer) {
      const description = footer.querySelector('p')?.textContent?.trim();
      const phone = footer.querySelector('[href^="tel:"]')?.textContent?.trim();
      const email = footer.querySelector('[href^="mailto:"]')?.textContent?.trim();
      
      if (description || phone || email) {
        extracted.footer = {
          ...getSiteContent().footer,
          ...(description && { description }),
          ...(phone && { phone }),
          ...(email && { email })
        };
      }
    }
    
    // Extract SEO meta tags
    const title = doc.querySelector('title')?.textContent?.trim();
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.trim();
    
    if (title || description || keywords) {
      extracted.seo = {
        ...getSiteContent().seo,
        ...(title && { title }),
        ...(description && { description }),
        ...(keywords && { keywords })
      };
    }
    
    return extracted;
  };

  const handleHTMLImport = async () => {
    if (!htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste some HTML content to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const extractedContent = extractTextFromHTML(htmlContent);
      updateSiteContent(extractedContent);
      
      refreshHistory();
      toast({
        title: "Success", 
        description: "Content imported successfully! Refresh the page to see changes.",
        duration: 5000
      });
      
      // Show what was extracted
      console.log('Extracted content:', extractedContent);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to process HTML content. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJSONImport = async () => {
    if (!jsonContent.trim()) {
      toast({
        title: "Error", 
        description: "Please paste JSON content to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const parsedContent = JSON.parse(jsonContent);
      updateSiteContent(parsedContent);
      
      refreshHistory();
      toast({
        title: "Success",
        description: "Content imported successfully! Refresh the page to see changes.",
        duration: 5000
      });
      
    } catch (error) {
      console.error('JSON import error:', error);
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your content.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportCurrentContent = () => {
    const content = getSiteContent();
    const jsonString = JSON.stringify(content, null, 2);
    
    // Create downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Content exported successfully!",
    });
  };

  const handleUndo = () => {
    if (undoLastChange()) {
      refreshHistory();
      toast({
        title: "Success",
        description: "Last change undone successfully! Refresh the page to see changes.",
        duration: 5000
      });
    } else {
      toast({
        title: "Error",
        description: "No changes to undo.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    resetSiteContent();
    refreshHistory();
    toast({
      title: "Success",
      description: "Content reset to defaults! Refresh the page to see changes.",
      duration: 5000
    });
  };

  const handleRestoreBackup = (index: number) => {
    if (restoreBackup(index)) {
      refreshHistory();
      toast({
        title: "Success",
        description: "Backup restored successfully! Refresh the page to see changes.",
        duration: 5000
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to restore backup.",
        variant: "destructive"
      });
    }
  };

  const downloadBackup = (backup: any, index: number) => {
    const jsonString = JSON.stringify(backup.content, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date(backup.timestamp).toISOString().split('T')[0]}-${index}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Content Import Tool
            </h1>
            <p className="text-muted-foreground">
              Import content from your previous site to replace all text on the current site while keeping the improved design.
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={handleUndo} variant="outline" disabled={backupHistory.length === 0}>
              Undo Last Import
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset to Defaults
            </Button>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="html">Import from HTML</TabsTrigger>
              <TabsTrigger value="json">Import from JSON</TabsTrigger>
              <TabsTrigger value="export">Export Current</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-6">
              <div>
                <Label htmlFor="html-content">Paste your previous site's HTML</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste the complete HTML of your previous site. The tool will automatically extract text content for navigation, hero section, services, testimonials, footer, and meta tags.
                </p>
                <Textarea
                  id="html-content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<html>...</html>"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleHTMLImport} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Import from HTML"}
              </Button>
            </TabsContent>
            
            <TabsContent value="json" className="space-y-6">
              <div>
                <Label htmlFor="json-content">Paste JSON content structure</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have content in JSON format, paste it here. Use the export feature to see the expected structure.
                </p>
                <Textarea
                  id="json-content"
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  placeholder='{"navigation": {"brand": "...", "links": [...]}, ...}'
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleJSONImport} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Import from JSON"}
              </Button>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Current Content</h3>
                <p className="text-muted-foreground mb-6">
                  Download the current site content as JSON. You can modify this file and re-import it using the JSON tab.
                </p>
                
                <Button onClick={exportCurrentContent} className="w-full">
                  Download Current Content
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Backup History</h3>
                <p className="text-muted-foreground mb-6">
                  Restore from previous versions or download backups. The most recent backup is at the top.
                </p>
                
                {backupHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No backup history available. Import some content to create backups.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {backupHistory.map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {new Date(backup.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {backup.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadBackup(backup, index)}
                          >
                            Download
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleRestoreBackup(index)}
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Paste your previous site's complete HTML in the "Import from HTML" tab</li>
              <li>Click "Import from HTML" to automatically extract content</li>
              <li>Refresh the main site to see the changes</li>
              <li>Use "Export Current" to download and manually edit content if needed</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}