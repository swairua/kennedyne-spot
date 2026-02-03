import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, Send, Loader2, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingActionBarProps {
  wordCount: number;
  readingTime: number;
  hasUnsavedChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  className?: string;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  wordCount,
  readingTime,
  hasUnsavedChanges,
  saving,
  onSave,
  onPreview,
  onPublish,
  className,
}) => {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-lg',
          'px-4 py-3 flex items-center justify-between gap-4',
          'md:left-64', // Account for admin sidebar
          className
        )}
      >
        {/* Left side - Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
            <FileText className="h-4 w-4" />
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>{readingTime} min read</span>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600/30 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-3 w-3" />
              <span className="hidden xs:inline">Unsaved changes</span>
            </Badge>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open fullscreen preview</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Draft'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save draft (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={onPublish}
                disabled={saving}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Publish</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Publish your post</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
