import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sun, Moon, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichTextEditor } from './RichTextEditor';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (content: string) => void;
  title?: string;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  isOpen,
  onClose,
  content,
  onChange,
  title,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] bg-background transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b z-10">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Esc</kbd> to exit
          </span>
        </div>

        {title && (
          <h2 className="hidden md:block text-sm font-medium text-muted-foreground truncate max-w-md">
            {title}
          </h2>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-8 w-8"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="h-full pt-16 pb-14 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4 md:px-8">
          <RichTextEditor
            markdown={content}
            onChange={onChange}
            placeholder="Start writing..."
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 p-4 bg-background/80 backdrop-blur-sm border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{wordCount.toLocaleString()} words</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
};
