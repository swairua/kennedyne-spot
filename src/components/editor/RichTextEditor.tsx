import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  CodeToggle,
  InsertCodeBlock,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { Button } from '@/components/ui/button';
import { ImageIcon, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageUploadModal, type InsertPosition, type ExistingImageData } from './ImageUploadModal';
import { type WrapMode, type BorderRadiusOption, type ShadowOption } from './ImageSizeSelector';
import { InsertCTAModal } from './InsertCTAModal';

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

// Helper function to escape special regex characters
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Parse inline styles from a style string
const parseInlineStyles = (styleStr: string): Record<string, string> => {
  const styles: Record<string, string> = {};
  if (!styleStr) return styles;
  
  styleStr.split(';').forEach(rule => {
    const [prop, val] = rule.split(':').map(s => s.trim());
    if (prop && val) {
      styles[prop] = val;
    }
  });
  return styles;
};

// Detect wrap mode from figure styles
const detectWrapMode = (figureStyles: Record<string, string>, figureClass: string): WrapMode => {
  if (figureClass.includes('float-left') || figureStyles['float'] === 'left') return 'float-left';
  if (figureClass.includes('float-right') || figureStyles['float'] === 'right') return 'float-right';
  if (figureClass.includes('inline') || figureStyles['display'] === 'inline-block') return 'inline';
  if (figureClass.includes('full-width') || figureStyles['width'] === '100%') return 'full';
  return 'center';
};

// Detect border radius from img styles
const detectBorderRadius = (imgStyles: Record<string, string>): BorderRadiusOption => {
  const radius = imgStyles['border-radius'];
  if (!radius || radius === '0' || radius === '0px') return 'none';
  if (radius === '4px') return 'sm';
  if (radius === '8px') return 'md';
  if (radius === '16px') return 'lg';
  if (radius === '9999px') return 'full';
  return 'md'; // default
};

// Detect shadow from img styles
const detectShadow = (imgStyles: Record<string, string>): ShadowOption => {
  const shadow = imgStyles['box-shadow'];
  if (!shadow) return 'none';
  if (shadow.includes('15px')) return 'hard';
  if (shadow.includes('6px')) return 'medium';
  if (shadow.includes('3px')) return 'soft';
  return 'none';
};

// Extract width from styles
const extractWidth = (imgStyles: Record<string, string>): number | undefined => {
  const maxWidth = imgStyles['max-width'];
  if (maxWidth) {
    const match = maxWidth.match(/(\d+)px/);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  markdown,
  onChange,
  placeholder = 'Start writing your blog post...',
  className,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCTAModalOpen, setIsCTAModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const editorRef = useRef<MDXEditorMethods>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingImage, setEditingImage] = useState<ExistingImageData | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');

  // Click handler for images in the editor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we clicked on an image or its parent figure/link
      let imgElement: HTMLImageElement | null = null;
      let figureElement: HTMLElement | null = null;
      let linkElement: HTMLAnchorElement | null = null;

      if (target.tagName === 'IMG') {
        imgElement = target as HTMLImageElement;
      } else if (target.closest('figure img')) {
        imgElement = target.closest('figure img') as HTMLImageElement;
      }

      if (!imgElement) return;

      // Find the parent figure
      figureElement = imgElement.closest('figure');
      if (!figureElement) return;

      // Check if image is wrapped in a link
      linkElement = imgElement.closest('a') as HTMLAnchorElement | null;

      // Prevent MDXEditor's default behavior
      e.preventDefault();
      e.stopPropagation();

      // Extract image data
      const src = imgElement.getAttribute('src') || '';
      const alt = imgElement.getAttribute('alt') || '';
      const imgStyleStr = imgElement.getAttribute('style') || '';
      const imgStyles = parseInlineStyles(imgStyleStr);

      const figureStyleStr = figureElement.getAttribute('style') || '';
      const figureStyles = parseInlineStyles(figureStyleStr);
      const figureClass = figureElement.className || '';

      // Extract link data
      const linkUrl = linkElement?.getAttribute('href') || '';
      const openInNewTab = linkElement?.getAttribute('target') === '_blank';

      // Extract caption
      const captionEl = figureElement.querySelector('figcaption');
      const caption = captionEl?.textContent || '';

      // Build existing image data
      const existingImage: ExistingImageData = {
        src,
        alt,
        width: extractWidth(imgStyles),
        wrapMode: detectWrapMode(figureStyles, figureClass),
        linkUrl,
        openInNewTab,
        borderRadius: detectBorderRadius(imgStyles),
        shadow: detectShadow(imgStyles),
        caption,
      };

      setOriginalImageSrc(src);
      setEditingImage(existingImage);
      setIsEditMode(true);
      setIsImageModalOpen(true);
    };

    // Listen for clicks on the content area
    const contentArea = container.querySelector('[contenteditable="true"]');
    if (contentArea) {
      contentArea.addEventListener('click', handleImageClick as EventListener);
    }

    return () => {
      if (contentArea) {
        contentArea.removeEventListener('click', handleImageClick as EventListener);
      }
    };
  }, []);

  // Save cursor position when modal opens
  const openImageModal = useCallback(() => {
    try {
      const currentMarkdown = editorRef.current?.getMarkdown() ?? '';
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(document.querySelector('[contenteditable="true"]') || document.body);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const offset = preCaretRange.toString().length;
        setCursorPosition(offset);
      } else {
        setCursorPosition(currentMarkdown.length);
      }
    } catch (error) {
      setCursorPosition(editorRef.current?.getMarkdown()?.length ?? 0);
    }

    // Reset edit mode state for new insertions
    setIsEditMode(false);
    setEditingImage(null);
    setOriginalImageSrc('');
    setIsImageModalOpen(true);
  }, []);

  // Handle image update (edit mode) - uses string-based search for browser compatibility
  const handleImageUpdate = useCallback((updatedHtml: string) => {
    if (!editorRef.current || !originalImageSrc) {
      toast.error('Could not update image');
      return;
    }

    try {
      const currentMarkdown = editorRef.current.getMarkdown();
      
      // Use indexOf-based search instead of regex for better browser compatibility (Safari/Edge)
      const srcIndex = currentMarkdown.indexOf(originalImageSrc);
      if (srcIndex === -1) {
        toast.error('Could not find the image to update');
        return;
      }
      
      // Find the figure start and end around this image
      const figureStart = currentMarkdown.lastIndexOf('<figure', srcIndex);
      const figureEndIndex = currentMarkdown.indexOf('</figure>', srcIndex);
      
      if (figureStart === -1 || figureEndIndex === -1) {
        toast.error('Could not find the image container to update');
        return;
      }
      
      const figureEnd = figureEndIndex + '</figure>'.length;
      
      const newMarkdown = 
        currentMarkdown.substring(0, figureStart) + 
        updatedHtml + 
        currentMarkdown.substring(figureEnd);
      
      editorRef.current.setMarkdown(newMarkdown);
      onChange(newMarkdown);

      // Reset edit state
      setIsEditMode(false);
      setEditingImage(null);
      setOriginalImageSrc('');
      setIsImageModalOpen(false);

      toast.success('Image updated successfully');
    } catch (error) {
      console.error('Failed to update image:', error);
      toast.error('Failed to update image');
    }
  }, [onChange, originalImageSrc]);

  const handleImageInsert = useCallback((
    imageUrl: string, 
    altText: string, 
    width?: number, 
    height?: number, 
    alignment: string = 'center', 
    caption?: string, 
    position: InsertPosition = 'cursor',
    linkUrl?: string,
    openInNewTab: boolean = true,
    wrapMode: WrapMode = 'center',
    borderRadius: BorderRadiusOption = 'md',
    shadow: ShadowOption = 'none'
  ) => {
    if (!editorRef.current) {
      toast.error('Editor is not ready');
      return;
    }

    try {
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
      if (width && wrapMode !== 'full') {
        imgStyles.push(`max-width: ${width}px`);
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
      const imgTag = `<img src="${imageUrl}" alt="${altText}" ${imgStyleAttr} loading="lazy" decoding="async" />`;
      
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
      const contentToInsert = `<figure class="${figureClass}" style="${figureStyle}">\n${imageContent}${captionHtml}\n</figure>`;

      const finalContent = `\n\n${contentToInsert}\n\n`;
      const currentMarkdown = editorRef.current.getMarkdown();

      let newMarkdown: string;
      
      if (position === 'start') {
        newMarkdown = finalContent + currentMarkdown;
      } else if (position === 'end') {
        newMarkdown = currentMarkdown + finalContent;
      } else {
        if (cursorPosition !== null && cursorPosition >= 0 && cursorPosition <= currentMarkdown.length) {
          const before = currentMarkdown.substring(0, cursorPosition);
          const after = currentMarkdown.substring(cursorPosition);
          newMarkdown = before + finalContent + after;
        } else {
          newMarkdown = currentMarkdown + finalContent;
        }
      }

      editorRef.current.setMarkdown(newMarkdown);
      onChange(newMarkdown);
      setCursorPosition(null);
      setIsImageModalOpen(false);

      const positionLabel = position === 'start' ? 'at the beginning' : position === 'end' ? 'at the end' : 'at cursor position';
      setTimeout(() => {
        toast.success(`Image inserted ${positionLabel}`, {
          description: '💡 Tip: Click on the image to change wrapping, add links, or adjust styling.',
          duration: 6000,
        });
        
        // First-time user tip (only shown once)
        const hasSeenTip = localStorage.getItem('hasSeenImageEditTip');
        if (!hasSeenTip) {
          setTimeout(() => {
            toast.info('New: Advanced Image Editing', {
              description: 'Click any image to access text wrapping, clickable links, border radius, and shadow effects.',
              duration: 8000,
            });
            localStorage.setItem('hasSeenImageEditTip', 'true');
          }, 1000);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to insert image:', error);
      toast.error('Failed to insert image. Please try again.');
    }
  }, [onChange, cursorPosition]);

  const handleCTAInsert = useCallback((ctaSyntax: string) => {
    if (!editorRef.current) {
      toast.error('Editor is not ready');
      return;
    }

    try {
      const currentMarkdown = editorRef.current.getMarkdown();
      const finalContent = `\n\n${ctaSyntax}\n\n`;
      
      // Insert at the end for simplicity
      const newMarkdown = currentMarkdown + finalContent;
      
      editorRef.current.setMarkdown(newMarkdown);
      onChange(newMarkdown);
      
      toast.success('CTA block inserted');
    } catch (error) {
      console.error('Failed to insert CTA:', error);
      toast.error('Failed to insert CTA. Please try again.');
    }
  }, [onChange]);

  const imageUploadHandler = useCallback(async (image: File) => {
    try {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
    } catch (error) {
      console.error('Image upload handler error:', error);
      throw error;
    }
  }, []);

  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-media-asset')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  }, []);

  const handleEditorDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleEditorDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const assetData = e.dataTransfer.getData('application/x-media-asset');
    if (assetData) {
      try {
        const asset = JSON.parse(assetData);
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(document.querySelector('[contenteditable="true"]') || document.body);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          const offset = preCaretRange.toString().length;
          setCursorPosition(offset);
        } else {
          setCursorPosition(editorRef.current?.getMarkdown()?.length ?? 0);
        }

        handleImageInsert(asset.url, asset.alt || 'Image from media library', asset.width, asset.height);
        toast.success('Image inserted from media library');
      } catch (error) {
        console.error('Failed to parse dropped asset:', error);
        toast.error('Failed to insert image');
      }
    }
  }, [handleImageInsert]);

  const handleModalClose = useCallback(() => {
    setIsImageModalOpen(false);
    setIsEditMode(false);
    setEditingImage(null);
    setOriginalImageSrc('');
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'border rounded-lg overflow-auto h-full min-h-[500px] bg-background relative transition-all mdx-editor-container flex flex-col',
        isDragOver && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onDragOver={handleEditorDragOver}
      onDragLeave={handleEditorDragLeave}
      onDrop={handleEditorDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 px-6 py-3 rounded-lg border-2 border-primary border-dashed">
            <p className="text-sm font-medium text-foreground">Drop image here to insert</p>
          </div>
        </div>
      )}

      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-slate dark:prose-invert max-w-none flex-1 p-6 focus:outline-none text-foreground dark:text-foreground overflow-y-auto min-h-[400px]"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler,
            disableImageSettingsButton: true,
            disableImageResize: true,
          }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              python: 'Python',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              bash: 'Bash',
              sql: 'SQL',
            },
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin({ viewMode: 'rich-text' }),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50 [&_button]:text-foreground [&_button]:opacity-100 [&_svg]:text-foreground [&_select]:text-foreground [&_[data-state]]:text-foreground">
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={openImageModal}
                  className="h-8 w-8 p-0 text-foreground"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCTAModalOpen(true)}
                  className="h-8 w-8 p-0 text-foreground"
                  title="Insert CTA"
                >
                  <Megaphone className="h-4 w-4" />
                </Button>
                <Separator />
                <InsertTable />
                <CodeToggle />
                <InsertCodeBlock />
                <InsertThematicBreak />
              </div>
            ),
          }),
        ]}
      />
      
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={handleModalClose}
        onInsert={handleImageInsert}
        editMode={isEditMode}
        existingImage={editingImage || undefined}
        onUpdate={handleImageUpdate}
      />
      
      <InsertCTAModal
        isOpen={isCTAModalOpen}
        onClose={() => setIsCTAModalOpen(false)}
        onInsert={handleCTAInsert}
      />
    </div>
  );
};
