import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlignLeft, AlignCenter, AlignRight, Maximize, 
  Type, Link as LinkIcon, ExternalLink, Lock, Unlock,
  Circle, Square, Layers
} from 'lucide-react';

export type WrapMode = 'inline' | 'float-left' | 'center' | 'float-right' | 'full';
export type BorderRadiusOption = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type ShadowOption = 'none' | 'soft' | 'medium' | 'hard';

interface ImageSizeSelectorProps {
  sizePreset: string;
  setSizePreset: (preset: string) => void;
  imageWidth?: number;
  imageHeight?: number;
  setImageWidth: (width: number | undefined) => void;
  setImageHeight: (height: number | undefined) => void;
  originalWidth: number;
  originalHeight: number;
  onPresetChange: (preset: string) => void;
  alignment: string;
  setAlignment: (alignment: string) => void;
  // Text wrapping and linking
  wrapMode?: WrapMode;
  setWrapMode?: (mode: WrapMode) => void;
  linkUrl?: string;
  setLinkUrl?: (url: string) => void;
  openInNewTab?: boolean;
  setOpenInNewTab?: (value: boolean) => void;
  // Aspect ratio lock
  aspectRatioLocked?: boolean;
  setAspectRatioLocked?: (locked: boolean) => void;
  // Border radius
  borderRadius?: BorderRadiusOption;
  setBorderRadius?: (radius: BorderRadiusOption) => void;
  // Shadow
  shadow?: ShadowOption;
  setShadow?: (shadow: ShadowOption) => void;
}

// Visual preview icons for wrap modes
const WrapPreviewIcon: React.FC<{ mode: WrapMode; isActive: boolean }> = ({ mode, isActive }) => {
  const baseClass = `w-full h-8 rounded border ${isActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'}`;
  
  const renderPreview = () => {
    switch (mode) {
      case 'inline':
        return (
          <div className={`${baseClass} flex items-center justify-center gap-1 px-2`}>
            <div className="w-2 h-1 bg-muted-foreground/30 rounded-sm" />
            <div className="w-4 h-4 bg-primary/40 rounded-sm" />
            <div className="w-2 h-1 bg-muted-foreground/30 rounded-sm" />
          </div>
        );
      case 'float-left':
        return (
          <div className={`${baseClass} flex items-center p-1 gap-1`}>
            <div className="w-4 h-5 bg-primary/40 rounded-sm flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-muted-foreground/30 rounded-sm" />
              <div className="w-3/4 h-1 bg-muted-foreground/30 rounded-sm" />
            </div>
          </div>
        );
      case 'center':
        return (
          <div className={`${baseClass} flex flex-col items-center justify-center p-1`}>
            <div className="w-6 h-4 bg-primary/40 rounded-sm" />
          </div>
        );
      case 'float-right':
        return (
          <div className={`${baseClass} flex items-center p-1 gap-1`}>
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-muted-foreground/30 rounded-sm" />
              <div className="w-3/4 h-1 bg-muted-foreground/30 rounded-sm" />
            </div>
            <div className="w-4 h-5 bg-primary/40 rounded-sm flex-shrink-0" />
          </div>
        );
      case 'full':
        return (
          <div className={`${baseClass} flex items-center justify-center p-1`}>
            <div className="w-full h-5 bg-primary/40 rounded-sm" />
          </div>
        );
    }
  };

  return renderPreview();
};

export const ImageSizeSelector: React.FC<ImageSizeSelectorProps> = ({
  sizePreset,
  setSizePreset,
  imageWidth,
  imageHeight,
  setImageWidth,
  setImageHeight,
  originalWidth,
  originalHeight,
  onPresetChange,
  alignment,
  setAlignment,
  wrapMode = 'center',
  setWrapMode,
  linkUrl = '',
  setLinkUrl,
  openInNewTab = true,
  setOpenInNewTab,
  aspectRatioLocked = true,
  setAspectRatioLocked,
  borderRadius = 'md',
  setBorderRadius,
  shadow = 'none',
  setShadow,
}) => {
  // Use wrapMode if available, fall back to alignment for backward compatibility
  const currentWrap = setWrapMode ? wrapMode : alignment as WrapMode;
  const handleWrapChange = (mode: WrapMode) => {
    if (setWrapMode) {
      setWrapMode(mode);
    }
    // Also update alignment for backward compatibility
    setAlignment(mode);
  };

  // Calculate aspect ratio
  const aspectRatio = originalWidth > 0 && originalHeight > 0 
    ? originalWidth / originalHeight 
    : 1;

  // Handle width change with aspect ratio lock
  const handleWidthChange = useCallback((newWidth: number | undefined) => {
    setImageWidth(newWidth);
    if (aspectRatioLocked && newWidth && setAspectRatioLocked) {
      const calculatedHeight = Math.round(newWidth / aspectRatio);
      setImageHeight(calculatedHeight);
    }
  }, [aspectRatioLocked, aspectRatio, setImageWidth, setImageHeight, setAspectRatioLocked]);

  // Handle height change with aspect ratio lock
  const handleHeightChange = useCallback((newHeight: number | undefined) => {
    setImageHeight(newHeight);
    if (aspectRatioLocked && newHeight && setAspectRatioLocked) {
      const calculatedWidth = Math.round(newHeight * aspectRatio);
      setImageWidth(calculatedWidth);
    }
  }, [aspectRatioLocked, aspectRatio, setImageWidth, setImageHeight, setAspectRatioLocked]);

  return (
    <div className="space-y-5">
      {/* Image Size */}
      <div>
        <Label className="text-sm font-medium">Image Size</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          <Button
            type="button"
            variant={sizePreset === 'small' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('small')}
          >
            Small
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('medium')}
          >
            Medium
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('large')}
          >
            Large
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'full' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange('full')}
          >
            Full
          </Button>
          <Button
            type="button"
            variant={sizePreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSizePreset('custom')}
          >
            Custom
          </Button>
        </div>
        {originalWidth > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Original: {originalWidth} × {originalHeight}px • 
            {sizePreset === 'small' && ' 400px width'}
            {sizePreset === 'medium' && ' 600px width'}
            {sizePreset === 'large' && ' 800px width'}
            {sizePreset === 'full' && ' Full width'}
          </p>
        )}
      </div>

      {sizePreset === 'custom' && (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="custom-width">Width (px)</Label>
              <Input
                id="custom-width"
                type="number"
                placeholder="Auto"
                value={imageWidth || ''}
                onChange={(e) => handleWidthChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            
            {/* Aspect Ratio Lock Toggle */}
            {setAspectRatioLocked && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                className="h-10 w-10 flex-shrink-0"
                title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {aspectRatioLocked ? (
                  <Lock className="h-4 w-4 text-primary" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
            
            <div className="flex-1">
              <Label htmlFor="custom-height">Height (px)</Label>
              <Input
                id="custom-height"
                type="number"
                placeholder="Auto"
                value={imageHeight || ''}
                onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
          {setAspectRatioLocked && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {aspectRatioLocked ? (
                <>
                  <Lock className="h-3 w-3" />
                  Aspect ratio locked — dimensions will scale proportionally
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" />
                  Free resize — dimensions can be set independently
                </>
              )}
            </p>
          )}
        </div>
      )}

      {/* Border Radius */}
      {setBorderRadius && (
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Square className="h-4 w-4" />
            Corner Radius
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {([
              { value: 'none', label: 'None', preview: 'rounded-none' },
              { value: 'sm', label: 'Small', preview: 'rounded-sm' },
              { value: 'md', label: 'Medium', preview: 'rounded-md' },
              { value: 'lg', label: 'Large', preview: 'rounded-lg' },
              { value: 'full', label: 'Pill', preview: 'rounded-full' },
            ] as { value: BorderRadiusOption; label: string; preview: string }[]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBorderRadius(option.value)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors ${
                  borderRadius === option.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-8 h-6 bg-primary/40 ${option.preview}`} />
                <span className={`text-xs ${borderRadius === option.value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shadow Effect */}
      {setShadow && (
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4" />
            Shadow Effect
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {([
              { value: 'none', label: 'None', style: '' },
              { value: 'soft', label: 'Soft', style: 'shadow-sm' },
              { value: 'medium', label: 'Medium', style: 'shadow-md' },
              { value: 'hard', label: 'Strong', style: 'shadow-lg' },
            ] as { value: ShadowOption; label: string; style: string }[]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setShadow(option.value)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors ${
                  shadow === option.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-10 h-6 bg-primary/40 rounded ${option.style}`} />
                <span className={`text-xs ${shadow === option.value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Wrapping */}
      <div className="pt-4 border-t">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4" />
          Text Wrapping
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Choose how text flows around the image
        </p>
        <div className="grid grid-cols-5 gap-2">
          {(['inline', 'float-left', 'center', 'float-right', 'full'] as WrapMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleWrapChange(mode)}
              className="flex flex-col items-center gap-1"
            >
              <WrapPreviewIcon mode={mode} isActive={currentWrap === mode} />
              <span className={`text-xs capitalize ${currentWrap === mode ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {mode === 'float-left' ? 'Left' : mode === 'float-right' ? 'Right' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Link URL */}
      {setLinkUrl && (
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4" />
            Link URL (optional)
          </Label>
          <Input
            type="url"
            placeholder="https://example.com/your-link"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="mb-2"
          />
          {linkUrl && setOpenInNewTab && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="open-new-tab"
                checked={openInNewTab}
                onCheckedChange={(checked) => setOpenInNewTab(checked === true)}
              />
              <label
                htmlFor="open-new-tab"
                className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open in new tab
              </label>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Make the image clickable. External links will open in a new tab with secure attributes.
          </p>
        </div>
      )}
    </div>
  );
};
