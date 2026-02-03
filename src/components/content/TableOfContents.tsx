import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCItem[];
  sticky?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  sticky = true,
  showProgress = true,
  className
}) => {
  const [activeHeading, setActiveHeading] = React.useState<string>('');
  const [readingProgress, setReadingProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(Math.min(100, Math.max(0, scrolled)));

      // Find active heading
      const headingElements = headings
        .map(heading => document.getElementById(heading.id))
        .filter(Boolean);

      let current = '';
      for (const element of headingElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = element.id;
          } else {
            break;
          }
        }
      }
      setActiveHeading(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ 
        top: y, 
        behavior: 'smooth' 
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      'w-full max-w-sm',
      sticky && 'sticky top-24',
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Table of Contents</CardTitle>
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-1" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <nav className="space-y-1">
          {headings.map((heading) => (
            <Button
              key={heading.id}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start text-left h-auto py-2 px-3 font-normal',
                heading.level === 3 && 'pl-6',
                heading.level === 4 && 'pl-9',
                activeHeading === heading.id && 'bg-muted font-medium text-primary'
              )}
              onClick={() => scrollToHeading(heading.id)}
            >
              <span className="truncate text-sm leading-relaxed">
                {heading.text}
              </span>
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};

// Reading Progress Bar (for sticky header)
export const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50">
      <div 
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};