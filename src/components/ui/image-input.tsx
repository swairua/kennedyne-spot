import { useState, useRef } from 'react';
import { Upload, Link, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  bucketName?: string;
  folderPrefix?: string;
  maxSizeText?: string;
  aspectRatio?: string;
  className?: string;
}

export function ImageInput({
  label,
  value,
  onChange,
  placeholder = "Enter image URL or upload a file",
  bucketName = "blog-images",
  folderPrefix = "",
  maxSizeText = "Max 5MB, recommended: 1200x630px",
  aspectRatio = "aspect-video",
  className = ""
}: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folderPrefix ? `${folderPrefix}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const clearImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2 mt-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2 mt-4">
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {maxSizeText}
          </p>
        </TabsContent>
      </Tabs>

      {/* Image Preview */}
      {value && (
        <div className="space-y-2">
          <div className={`relative ${aspectRatio} w-full max-w-sm border rounded-lg overflow-hidden bg-muted`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
              Failed to load image
            </div>
            
            {/* Preview Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <img
                  src={value}
                  alt="Full preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-sm text-muted-foreground break-all">
            {value}
          </p>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Uploading...
        </div>
      )}
    </div>
  );
}