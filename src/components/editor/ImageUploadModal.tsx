import React, { useState, useCallback, useEffect } from 'react';
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
import { Upload, Link as LinkIcon, Image as ImageIcon, Pencil, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaLibrary } from './MediaLibrary';
import { ImageSizeSelector, type WrapMode, type BorderRadiusOption, type ShadowOption } from './ImageSizeSelector';

export type InsertPosition = 'cursor' | 'start' | 'end';

export interface ExistingImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  wrapMode?: WrapMode;
  linkUrl?: string;
  openInNewTab?: boolean;
  borderRadius?: BorderRadiusOption;
  shadow?: ShadowOption;
  caption?: string;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (
    imageUrl: string, 
    altText: string, 
    width?: number, 
    height?: number, 
    alignment?: string, 
    caption?: string, 
    position?: InsertPosition,
    linkUrl?: string,
    openInNewTab?: boolean,
    wrapMode?: WrapMode,
    borderRadius?: BorderRadiusOption,
    shadow?: ShadowOption
  ) => void;
  // Edit mode props
  editMode?: boolean;
  existingImage?: ExistingImageData;
  onUpdate?: (updatedHtml: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  editMode = false,
  existingImage,
  onUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageWidth, setImageWidth] = useState<number | undefined>(undefined);
  const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [sizePreset, setSizePreset] = useState<string>('original');
  const [alignment, setAlignment] = useState<string>('center');
  const [insertPosition, setInsertPosition] = useState<InsertPosition>('cursor');
  // Text wrapping and linking
  const [wrapMode, setWrapMode] = useState<WrapMode>('center');
  const [linkUrl, setLinkUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  // New styling options
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [borderRadius, setBorderRadius] = useState<BorderRadiusOption>('md');
  const [shadow, setShadow] = useState<ShadowOption>('none');
  const { toast } = useToast();

  // Pre-populate form when in edit mode
  useEffect(() => {
    if (editMode && existingImage && isOpen) {
      setPreviewUrl(existingImage.src);
      setAltText(existingImage.alt || '');
      setCaption(existingImage.caption || '');
      setImageWidth(existingImage.width);
      setWrapMode(existingImage.wrapMode || 'center');
      setLinkUrl(existingImage.linkUrl || '');
      setOpenInNewTab(existingImage.openInNewTab ?? true);
      setBorderRadius(existingImage.borderRadius || 'md');
      setShadow(existingImage.shadow || 'none');
      
      // Load image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = existingImage.src;
    }
  }, [editMode, existingImage, isOpen]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Auto-generate alt text from filename
      const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAltText(fileName);

      // Get original image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = objectUrl;
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAltText(fileName);

      // Get original image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = objectUrl;
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please drop an image file',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Generate HTML for the image with all styling
  const generateImageHtml = useCallback((imgUrl: string, alt: string) => {
    // Build inline styles based on wrap mode
    let figureStyle = '';
    let figureClass = '';
    
    switch (wrapMode) {
      case 'inline':
        figureStyle = 'display: inline-block; vertical-align: middle; margin: 0 0.5rem;';
        figureClass = 'image-inline';
        break;
      case 'float-left':
        figureStyle = 'float: left; margin: 0 1.5rem 1rem 0; max-width: 50%;';
        figureClass = 'image-float-left';
        break;
      case 'float-right':
        figureStyle = 'float: right; margin: 0 0 1rem 1.5rem; max-width: 50%;';
        figureClass = 'image-float-right';
        break;
      case 'full':
        figureStyle = 'width: 100%; margin: 2rem 0;';
        figureClass = 'image-full-width';
        break;
      case 'center':
      default:
        figureStyle = 'text-align: center; margin: 2rem auto; display: block;';
        figureClass = 'image-center';
        break;
    }

    // Build width style
    let imgStyles: string[] = [];
    if (imageWidth && wrapMode !== 'full') {
      imgStyles.push(`max-width: ${imageWidth}px`);
    }

    // Build border-radius style
    const radiusMap: Record<BorderRadiusOption, string> = {
      'none': '0',
      'sm': '4px',
      'md': '8px',
      'lg': '16px',
      'full': '9999px'
    };
    if (borderRadius !== 'none') {
      imgStyles.push(`border-radius: ${radiusMap[borderRadius]}`);
    }

    // Build shadow style
    const shadowMap: Record<ShadowOption, string> = {
      'none': '',
      'soft': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      'medium': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)',
      'hard': '0 10px 15px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1)'
    };
    if (shadow !== 'none') {
      imgStyles.push(`box-shadow: ${shadowMap[shadow]}`);
    }

    const imgStyleAttr = imgStyles.length > 0 ? `style="${imgStyles.join('; ')}"` : '';

    // Build the image tag
    const imgTag = `<img src="${imgUrl}" alt="${alt}" ${imgStyleAttr} loading="lazy" decoding="async" />`;
    
    // Wrap in link if URL provided
    let imageContent = imgTag;
    if (linkUrl) {
      const target = openInNewTab ? ' target="_blank"' : '';
      const rel = openInNewTab ? ' rel="noopener noreferrer"' : '';
      imageContent = `<a href="${linkUrl}"${target}${rel} class="image-link">${imgTag}</a>`;
    }

    // Build caption if provided
    const captionHtml = caption 
      ? `\n<figcaption class="text-sm text-muted-foreground text-center mt-2">${caption}</figcaption>` 
      : '';

    // Build final figure HTML
    return `<figure class="${figureClass}" style="${figureStyle}">\n${imageContent}${captionHtml}\n</figure>`;
  }, [wrapMode, imageWidth, borderRadius, shadow, linkUrl, openInNewTab, caption]);

  const handleUpdate = useCallback(() => {
    if (!existingImage || !onUpdate) return;
    
    if (!altText) {
      toast({
        title: 'Alt text required',
        description: 'Please add descriptive alt text for accessibility',
        variant: 'destructive',
      });
      return;
    }

    const updatedHtml = generateImageHtml(existingImage.src, altText);
    onUpdate(updatedHtml);
    resetForm();
  }, [existingImage, onUpdate, altText, generateImageHtml, toast]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!altText) {
      toast({
        title: 'Alt text required',
        description: 'Please add descriptive alt text for accessibility',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('blog-assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-assets')
        .getPublicUrl(filePath);

      onInsert(publicUrl, altText, imageWidth, imageHeight, alignment, caption, insertPosition, linkUrl, openInNewTab, wrapMode, borderRadius, shadow);
      resetForm();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInsertUrl = () => {
    if (!imageUrl) {
      toast({
        title: 'URL required',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    if (!altText) {
      toast({
        title: 'Alt text required',
        description: 'Please add descriptive alt text for accessibility',
        variant: 'destructive',
      });
      return;
    }

    onInsert(imageUrl, altText, imageWidth, imageHeight, alignment, caption, insertPosition, linkUrl, openInNewTab, wrapMode, borderRadius, shadow);
    resetForm();
  };

  const handlePresetChange = (preset: string) => {
    setSizePreset(preset);
    
    if (preset === 'original') {
      setImageWidth(undefined);
      setImageHeight(undefined);
    } else if (preset === 'small') {
      setImageWidth(400);
      setImageHeight(undefined);
    } else if (preset === 'medium') {
      setImageWidth(600);
      setImageHeight(undefined);
    } else if (preset === 'large') {
      setImageWidth(800);
      setImageHeight(undefined);
    } else if (preset === 'full') {
      setImageWidth(undefined);
      setImageHeight(undefined);
    }
  };

  const resetForm = () => {
    setImageUrl('');
    setAltText('');
    setCaption('');
    setPreviewUrl('');
    setSelectedFile(null);
    setImageWidth(undefined);
    setImageHeight(undefined);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setSizePreset('original');
    setAlignment('center');
    setInsertPosition('cursor');
    setWrapMode('center');
    setLinkUrl('');
    setOpenInNewTab(true);
    setAspectRatioLocked(true);
    setBorderRadius('md');
    setShadow('none');
    onClose();
  };

  // Edit mode UI - simplified modal focused on editing settings
  if (editMode && existingImage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Image
            </DialogTitle>
            <DialogDescription>
              Modify image settings, text wrapping, and styling.
              <span className="block text-xs mt-1 text-muted-foreground/70">
                Press Escape to cancel • Click Update to save
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Pro Tip Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong className="text-primary">Pro Tip:</strong>{' '}
                <span className="text-muted-foreground">
                  Use text wrapping to flow content around images, add click-through links, and customize styling with border radius and shadows.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Preview */}
            <div className="mb-4">
              <Label className="mb-2 block">Current Image</Label>
              <div className="relative rounded-lg overflow-hidden border bg-muted/10 p-4">
                <img
                  src={existingImage.src}
                  alt={altText || 'Image preview'}
                  className="max-h-48 mx-auto rounded"
                />
                {originalWidth > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {originalWidth} × {originalHeight}px
                  </p>
                )}
              </div>
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="edit-alt-text">Alt Text (for accessibility) *</Label>
              <Input
                id="edit-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image..."
              />
              <p className="text-xs text-muted-foreground">
                Descriptive text for screen readers and SEO
              </p>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption (optional)</Label>
              <Input
                id="edit-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption below the image..."
              />
            </div>

            {/* Size and Styling Controls */}
            <ImageSizeSelector
              sizePreset={sizePreset}
              setSizePreset={setSizePreset}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              setImageWidth={setImageWidth}
              setImageHeight={setImageHeight}
              originalWidth={originalWidth}
              originalHeight={originalHeight}
              onPresetChange={handlePresetChange}
              alignment={alignment}
              setAlignment={setAlignment}
              wrapMode={wrapMode}
              setWrapMode={setWrapMode}
              linkUrl={linkUrl}
              setLinkUrl={setLinkUrl}
              openInNewTab={openInNewTab}
              setOpenInNewTab={setOpenInNewTab}
              aspectRatioLocked={aspectRatioLocked}
              setAspectRatioLocked={setAspectRatioLocked}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              shadow={shadow}
              setShadow={setShadow}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Normal insert mode UI
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Choose from media library, upload a new image, or insert from a URL
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library">
              <ImageIcon className="mr-2 h-4 w-4" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-medium">Tip:</span> You can drag images directly from the library into the editor!
              </p>
            </div>
            <MediaLibrary
              onSelectImage={(url, alt) => {
                // Load image to get dimensions
                const img = new Image();
                img.onload = () => {
                  setOriginalWidth(img.width);
                  setOriginalHeight(img.height);
                  setPreviewUrl(url);
                  setAltText(alt || 'Blog image');
                };
                img.src = url;
              }}
              compact={true}
            />
            
            {previewUrl && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="mb-4">
                  <Label className="mb-2 block">Selected Image Preview</Label>
                  <div className="relative rounded-lg overflow-hidden border bg-muted/10 p-4">
                    <img
                      src={previewUrl}
                      alt={altText || 'Selected image'}
                      className="max-h-48 mx-auto rounded"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {altText || 'No alt text'} • {originalWidth} × {originalHeight}px
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="library-alt-text">Alt Text (for accessibility) *</Label>
                  <Input
                    id="library-alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Descriptive text for screen readers and SEO
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="library-caption">Caption (optional)</Label>
                  <Input
                    id="library-caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption below the image..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed as a figure caption below the image
                  </p>
                </div>

                <ImageSizeSelector
                  sizePreset={sizePreset}
                  setSizePreset={setSizePreset}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  setImageWidth={setImageWidth}
                  setImageHeight={setImageHeight}
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                  onPresetChange={handlePresetChange}
                  alignment={alignment}
                  setAlignment={setAlignment}
                  wrapMode={wrapMode}
                  setWrapMode={setWrapMode}
                  linkUrl={linkUrl}
                  setLinkUrl={setLinkUrl}
                  openInNewTab={openInNewTab}
                  setOpenInNewTab={setOpenInNewTab}
                  aspectRatioLocked={aspectRatioLocked}
                  setAspectRatioLocked={setAspectRatioLocked}
                  borderRadius={borderRadius}
                  setBorderRadius={setBorderRadius}
                  shadow={shadow}
                  setShadow={setShadow}
                />

                {/* Insert Position Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Insert Position</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={insertPosition === 'start' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('start')}
                      className="flex-1"
                    >
                      At Start
                    </Button>
                    <Button
                      type="button"
                      variant={insertPosition === 'cursor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('cursor')}
                      className="flex-1"
                    >
                      At Cursor
                    </Button>
                    <Button
                      type="button"
                      variant={insertPosition === 'end' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('end')}
                      className="flex-1"
                    >
                      At End
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose where the image will be inserted in your content
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (!previewUrl) {
                      toast({
                        title: 'No image selected',
                        description: 'Please select an image from the library',
                        variant: 'destructive',
                      });
                      return;
                    }
                    if (!altText) {
                      toast({
                        title: 'Alt text required',
                        description: 'Please add descriptive alt text for accessibility',
                        variant: 'destructive',
                      });
                      return;
                    }
                    onInsert(previewUrl, altText, imageWidth, imageHeight, alignment, caption, insertPosition, linkUrl, openInNewTab, wrapMode, borderRadius, shadow);
                    resetForm();
                  }}
                  className="w-full"
                >
                  Insert Image
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change or drag a new image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-alt-text">Alt Text (for accessibility) *</Label>
              <Input
                id="upload-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image..."
              />
              <p className="text-xs text-muted-foreground">
                Descriptive text for screen readers and SEO
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-caption">Caption (optional)</Label>
              <Input
                id="upload-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption below the image..."
              />
              <p className="text-xs text-muted-foreground">
                Displayed as a figure caption below the image
              </p>
            </div>

            {selectedFile && (
              <>
                <ImageSizeSelector
                  sizePreset={sizePreset}
                  setSizePreset={setSizePreset}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  setImageWidth={setImageWidth}
                  setImageHeight={setImageHeight}
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                  onPresetChange={handlePresetChange}
                  alignment={alignment}
                  setAlignment={setAlignment}
                  wrapMode={wrapMode}
                  setWrapMode={setWrapMode}
                  linkUrl={linkUrl}
                  setLinkUrl={setLinkUrl}
                  openInNewTab={openInNewTab}
                  setOpenInNewTab={setOpenInNewTab}
                  aspectRatioLocked={aspectRatioLocked}
                  setAspectRatioLocked={setAspectRatioLocked}
                  borderRadius={borderRadius}
                  setBorderRadius={setBorderRadius}
                  shadow={shadow}
                  setShadow={setShadow}
                />

                {/* Insert Position Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Insert Position</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={insertPosition === 'start' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('start')}
                      className="flex-1"
                    >
                      At Start
                    </Button>
                    <Button
                      type="button"
                      variant={insertPosition === 'cursor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('cursor')}
                      className="flex-1"
                    >
                      At Cursor
                    </Button>
                    <Button
                      type="button"
                      variant={insertPosition === 'end' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInsertPosition('end')}
                      className="flex-1"
                    >
                      At End
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose where the image will be inserted in your content
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Insert Image'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setImageUrl(url);
                  setPreviewUrl(url);
                  
                  // Load image to get dimensions
                  if (url) {
                    const img = new Image();
                    img.onload = () => {
                      setOriginalWidth(img.width);
                      setOriginalHeight(img.height);
                    };
                    img.src = url;
                  }
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {previewUrl && imageUrl && (
              <div className="border rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                  onError={() => {
                    toast({
                      title: 'Invalid image URL',
                      description: 'Could not load image from URL',
                      variant: 'destructive',
                    });
                    setPreviewUrl('');
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="url-alt-text">Alt Text (for accessibility) *</Label>
              <Input
                id="url-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image..."
              />
              <p className="text-xs text-muted-foreground">
                Descriptive text for screen readers and SEO
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url-caption">Caption (optional)</Label>
              <Input
                id="url-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption below the image..."
              />
              <p className="text-xs text-muted-foreground">
                Displayed as a figure caption below the image
              </p>
            </div>

            {imageUrl && previewUrl && (
              <ImageSizeSelector
                sizePreset={sizePreset}
                setSizePreset={setSizePreset}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                setImageWidth={setImageWidth}
                setImageHeight={setImageHeight}
                originalWidth={originalWidth}
                originalHeight={originalHeight}
                onPresetChange={handlePresetChange}
                alignment={alignment}
                setAlignment={setAlignment}
                wrapMode={wrapMode}
                setWrapMode={setWrapMode}
                linkUrl={linkUrl}
                setLinkUrl={setLinkUrl}
                openInNewTab={openInNewTab}
                setOpenInNewTab={setOpenInNewTab}
                aspectRatioLocked={aspectRatioLocked}
                setAspectRatioLocked={setAspectRatioLocked}
                borderRadius={borderRadius}
                setBorderRadius={setBorderRadius}
                shadow={shadow}
                setShadow={setShadow}
              />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleInsertUrl} disabled={!imageUrl}>
                Insert Image
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
