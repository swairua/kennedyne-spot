import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AnalysisResult {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  rule: string;
}

interface ContentFormatAnalyzerProps {
  title: string;
  content: string;
  metaDescription?: string;
  onAnalysisUpdate?: (analysis: AnalysisResult[]) => void;
}

export const ContentFormatAnalyzer: React.FC<ContentFormatAnalyzerProps> = ({
  title,
  content,
  metaDescription,
  onAnalysisUpdate
}) => {
  const [analysis, setAnalysis] = React.useState<AnalysisResult[]>([]);

  const analyzeContent = React.useCallback(() => {
    const results: AnalysisResult[] = [];

    // Title analysis
    if (title) {
      if (title.length > 60) {
        results.push({
          type: 'warning',
          message: `Title is ${title.length} chars (max 60 recommended)`,
          rule: 'meta-title-length'
        });
      }
      
      // Check title case
      const titleCasePattern = /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/;
      if (!titleCasePattern.test(title.replace(/[^a-zA-Z\s]/g, '').trim())) {
        results.push({
          type: 'info',
          message: 'Consider using Title Case for the title',
          rule: 'title-case'
        });
      }
    }

    // Meta description analysis
    if (metaDescription) {
      if (metaDescription.length < 120 || metaDescription.length > 160) {
        results.push({
          type: 'warning',
          message: `Meta description is ${metaDescription.length} chars (120-160 recommended)`,
          rule: 'meta-description-length'
        });
      }
    } else {
      results.push({
        type: 'error',
        message: 'Meta description is required',
        rule: 'meta-description-required'
      });
    }

    // Content analysis
    if (content) {
      // Check for H1 in content (should only be in title)
      const h1Pattern = /^#\s/m;
      if (h1Pattern.test(content)) {
        results.push({
          type: 'error',
          message: 'H1 detected in content (use H2/H3/H4 only)',
          rule: 'no-h1-in-content'
        });
      }

      // Check heading hierarchy
      const headings = content.match(/^#{2,6}\s.+$/gm) || [];
      if (headings.length > 0) {
        let lastLevel = 1;
        headings.forEach((heading, index) => {
          const level = heading.match(/^#+/)?.[0].length || 2;
          if (level > lastLevel + 1) {
            results.push({
              type: 'warning',
              message: `Heading level skip detected (H${lastLevel} to H${level})`,
              rule: 'heading-hierarchy'
            });
          }
          lastLevel = level;
        });
      }

      // Check paragraph length
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() && !p.match(/^#{1,6}\s/));
      paragraphs.forEach((paragraph, index) => {
        const words = paragraph.trim().split(/\s+/).length;
        if (words > 140) {
          results.push({
            type: 'warning',
            message: `Paragraph ${index + 1} has ${words} words (max 140 recommended)`,
            rule: 'paragraph-length'
          });
        }
      });

      // Check for internal links
      const internalLinks = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || [];
      if (internalLinks.length === 0) {
        results.push({
          type: 'warning',
          message: 'No internal links found (add at least 1)',
          rule: 'internal-links'
        });
      }

      // Check for images without alt text
      const imagesWithoutAlt = content.match(/!\[\s*\]\([^)]+\)/g) || [];
      if (imagesWithoutAlt.length > 0) {
        results.push({
          type: 'error',
          message: `${imagesWithoutAlt.length} image(s) missing alt text`,
          rule: 'image-alt-text'
        });
      }
    }

    setAnalysis(results);
    onAnalysisUpdate?.(results);
  }, [title, content, metaDescription, onAnalysisUpdate]);

  React.useEffect(() => {
    analyzeContent();
  }, [analyzeContent]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Content Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {analysis.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-600" />
            All checks passed
          </div>
        ) : (
          analysis.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              {getIcon(item.type)}
              <div className="flex-1">
                <p className="leading-relaxed">{item.message}</p>
                <Badge variant={getBadgeVariant(item.type)} className="mt-1 text-xs">
                  {item.rule}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};