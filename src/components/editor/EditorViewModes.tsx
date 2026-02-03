import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Columns, Eye, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ViewMode = 'write' | 'split' | 'preview';

interface EditorViewModesProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFocusMode?: () => void;
  className?: string;
}

export const EditorViewModes: React.FC<EditorViewModesProps> = ({
  viewMode,
  onViewModeChange,
  onFocusMode,
  className,
}) => {
  const modes: { value: ViewMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      value: 'write',
      label: 'Write',
      icon: <Pencil className="h-4 w-4" />,
      tooltip: 'Full-width editor for focused writing',
    },
    {
      value: 'split',
      label: 'Split',
      icon: <Columns className="h-4 w-4" />,
      tooltip: 'Side-by-side editor and preview',
    },
    {
      value: 'preview',
      label: 'Preview',
      icon: <Eye className="h-4 w-4" />,
      tooltip: 'Full preview of your post',
    },
  ];

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1 bg-muted/50 rounded-lg p-1', className)}>
        {modes.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={viewMode === mode.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange(mode.value)}
                className={cn(
                  'gap-2 transition-all',
                  viewMode === mode.value && 'bg-background shadow-sm'
                )}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{mode.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {onFocusMode && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onFocusMode}
                  className="gap-2"
                >
                  <Maximize className="h-4 w-4" />
                  <span className="hidden sm:inline">Focus</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Distraction-free writing mode (Esc to exit)</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};
