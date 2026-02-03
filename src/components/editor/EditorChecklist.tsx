import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  critical: boolean;
}

interface EditorChecklistProps {
  title: string;
  content: string;
  metaDescription?: string;
  status: string;
}

export const EditorChecklist: React.FC<EditorChecklistProps> = ({
  title,
  content,
  metaDescription,
  status
}) => {
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([
    {
      id: 'title-case',
      label: 'Title in Title Case',
      description: 'Meta title ≤ 60 chars',
      checked: false,
      critical: true
    },
    {
      id: 'meta-description',
      label: 'Meta description 120–160 chars',
      description: 'SEO-optimized description',
      checked: false,
      critical: true
    },
    {
      id: 'heading-structure',
      label: 'H1 only in title; use H2/H3 in body',
      description: 'Proper heading hierarchy',
      checked: false,
      critical: true
    },
    {
      id: 'paragraph-length',
      label: 'Paragraphs 40–140 words',
      description: 'Avoid wall-of-text',
      checked: false,
      critical: false
    },
    {
      id: 'internal-links',
      label: 'At least 1 internal link',
      description: 'Add 2–3 related links if possible',
      checked: false,
      critical: false
    },
    {
      id: 'image-optimization',
      label: 'All images: alt + caption',
      description: 'Use original aspect or 16:9',
      checked: false,
      critical: true
    },
    {
      id: 'structured-content',
      label: 'Add FAQ or HowTo blocks when relevant',
      description: 'Enhance user experience',
      checked: false,
      critical: false
    },
    {
      id: 'cta-block',
      label: 'Add CTA with UTM',
      description: 'Channel preset configured',
      checked: false,
      critical: false
    },
    {
      id: 'mobile-check',
      label: 'Verify TOC + anchors',
      description: 'Scan on mobile + dark mode',
      checked: false,
      critical: false
    },
    {
      id: 'publishing',
      label: 'Publish or schedule (EAT)',
      description: 'Re-check preview',
      checked: false,
      critical: true
    }
  ]);

  const autoCheckItems = React.useCallback(() => {
    setChecklist(prev => prev.map(item => {
      let checked = item.checked;

      switch (item.id) {
        case 'title-case':
          checked = title.length > 0 && title.length <= 60;
          break;
        case 'meta-description':
          checked = metaDescription ? 
            metaDescription.length >= 120 && metaDescription.length <= 160 : false;
          break;
        case 'heading-structure':
          checked = !content.match(/^#\s/m); // No H1 in content
          break;
        case 'paragraph-length':
          const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() && !p.match(/^#{1,6}\s/));
          const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 140);
          checked = longParagraphs.length === 0;
          break;
        case 'internal-links':
          const internalLinks = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || [];
          checked = internalLinks.length > 0;
          break;
        case 'image-optimization':
          const imagesWithoutAlt = content.match(/!\[\s*\]\([^)]+\)/g) || [];
          checked = imagesWithoutAlt.length === 0;
          break;
        case 'publishing':
          checked = status === 'published' || status === 'scheduled';
          break;
      }

      return { ...item, checked };
    }));
  }, [title, content, metaDescription, status]);

  React.useEffect(() => {
    autoCheckItems();
  }, [autoCheckItems]);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const criticalCount = checklist.filter(item => item.critical && item.checked).length;
  const totalCritical = checklist.filter(item => item.critical).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          Editor Checklist
          <div className="flex items-center gap-2">
            {criticalCount === totalCritical ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {criticalCount}/{totalCritical} critical
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {completedCount}/{checklist.length}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={() => toggleItem(item.id)}
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <label
                htmlFor={item.id}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  item.checked ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {item.label}
                {item.critical && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Critical
                  </Badge>
                )}
              </label>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};