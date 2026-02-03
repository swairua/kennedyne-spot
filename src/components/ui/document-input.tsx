import React, { useState, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, Eye, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getInternalLinkProps } from '@/constants/links';

interface DocumentInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  bucketName?: string;
  folderPrefix?: string;
  maxSizeText?: string;
  className?: string;
  accept?: string;
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(({
  label = "Document",
  value = "",
  onChange,
  placeholder = "Paste document URL or upload file",
  bucketName = "resources",
  folderPrefix = "",
  maxSizeText = "Max 10MB",
  className,
  accept = ".pdf,.doc,.docx,.txt,.md"
}, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/octet-stream' // fallback for various formats
    ];
    
    if (!allowedTypes.includes(file.type) && !accept.split(',').some(ext => file.name.toLowerCase().endsWith(ext.trim()))) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, Word document, or text file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folderPrefix ? `${folderPrefix}/${fileName}` : `documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document is now available for download",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setUrlInput(newValue);
    onChange(newValue);
  };

  const clearDocument = () => {
    setUrlInput("");
    onChange("");
  };

  const getFileIcon = () => {
    if (!value) return <FileText className="h-4 w-4" />;
    
    const extension = value.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="document-input">{label}</Label>
      
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <div className="relative">
            <Input
              ref={ref}
              id="document-input"
              type="url"
              placeholder={placeholder}
              value={urlInput}
              onChange={handleUrlChange}
              className="pr-8"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearDocument}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-2 file:px-2 file:py-1 file:border-0 file:bg-muted file:text-sm"
            />
            {isUploading && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                Uploading...
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{maxSizeText}</p>
        </TabsContent>
      </Tabs>

      {value && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded border">
          {getFileIcon()}
          <span className="text-sm text-muted-foreground flex-1 truncate">
            {value.split('/').pop() || value}
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Document Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getFileIcon()}
                  <span className="text-sm font-medium">
                    {value.split('/').pop() || 'Document'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground break-all">
                  {value}
                </div>
                <Button asChild className="w-full">
                  {value && value.startsWith('/') ? (
                    <a {...getInternalLinkProps(value)}>Open Document</a>
                  ) : (
                    <a href={value} target="_blank" rel="noopener noreferrer">Open Document</a>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
});

DocumentInput.displayName = "DocumentInput";
