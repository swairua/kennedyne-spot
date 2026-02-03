import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage, formatFileSize, calculateSavings } from '@/utils/imageOptimization';

export interface MediaAsset {
  id: string;
  url: string;
  alt: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  used_in: any;
  folder: string | null;
  order_index: number | null;
  sizes: any; // JSONB field with URLs for different sizes
  original_size: number | null; // Original file size in bytes
  optimized_size: number | null; // Optimized file size in bytes
}

export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('folder', { ascending: true, nullsFirst: true })
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const uploadAssets = async (files: File[]) => {
    setUploading(true);
    const uploadedUrls: string[] = [];
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }

        totalOriginalSize += file.size;

        // Show optimization progress
        toast.loading(`Optimizing ${file.name}...`, { id: file.name });

        try {
          // Optimize the image
          const { original, sizes } = await optimizeImage(file);

          const fileExt = 'webp'; // Always use WebP for optimized images
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2);

          // Upload original optimized version
          const originalFileName = `${baseName}-${timestamp}-${randomId}.${fileExt}`;
          const originalPath = `blog/${originalFileName}`;

          const { error: originalUploadError } = await supabase.storage
            .from('blog-assets')
            .upload(originalPath, original.blob);

          if (originalUploadError) {
            toast.error(`Failed to upload ${file.name}`, { id: file.name });
            continue;
          }

          const { data: { publicUrl: originalUrl } } = supabase.storage
            .from('blog-assets')
            .getPublicUrl(originalPath);

          // Upload all responsive sizes
          const sizeUrls: Record<string, string> = {};
          let totalSizeBytes = original.blob.size;

          for (const [sizeLabel, sizeData] of Object.entries(sizes)) {
            const sizeFileName = `${baseName}-${sizeLabel}-${timestamp}-${randomId}.${fileExt}`;
            const sizePath = `blog/${sizeFileName}`;

            const { error: sizeUploadError } = await supabase.storage
              .from('blog-assets')
              .upload(sizePath, sizeData.blob);

            if (!sizeUploadError) {
              const { data: { publicUrl: sizeUrl } } = supabase.storage
                .from('blog-assets')
                .getPublicUrl(sizePath);

              sizeUrls[sizeLabel] = sizeUrl;
              totalSizeBytes += sizeData.blob.size;
            }
          }

          totalOptimizedSize += totalSizeBytes;

          // Save to media_assets table with size information
          const { error: insertError } = await supabase
            .from('media_assets')
            .insert({
              url: originalUrl,
              alt: baseName,
              width: original.width,
              height: original.height,
              sizes: sizeUrls,
              original_size: file.size,
              optimized_size: totalSizeBytes,
            });

          if (insertError) {
            console.error('Error saving to media_assets:', insertError);
          }

          uploadedUrls.push(originalUrl);
          
          const savings = calculateSavings(file.size, totalSizeBytes);
          toast.success(
            `${file.name} optimized! Saved ${savings}% (${formatFileSize(file.size)} → ${formatFileSize(totalSizeBytes)})`,
            { id: file.name }
          );
        } catch (error) {
          console.error(`Error optimizing ${file.name}:`, error);
          toast.error(`Failed to optimize ${file.name}`, { id: file.name });
        }
      }

      if (uploadedUrls.length > 0) {
        const overallSavings = calculateSavings(totalOriginalSize, totalOptimizedSize);
        toast.success(
          `Uploaded ${uploadedUrls.length} image(s)! Overall savings: ${overallSavings}% (${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalOptimizedSize)})`
        );
        await fetchAssets();
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const deleteAsset = async (id: string, url: string) => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = `blog/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('blog-assets')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('Image deleted');
      await fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete image');
    }
  };

  const updateAsset = async (id: string, updates: Partial<MediaAsset>) => {
    try {
      const { error } = await supabase
        .from('media_assets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Image updated');
      await fetchAssets();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update image');
    }
  };

  const moveToFolder = async (assetId: string, folder: string | null) => {
    try {
      const { error } = await supabase
        .from('media_assets')
        .update({ folder })
        .eq('id', assetId);

      if (error) throw error;
      await fetchAssets();
    } catch (error) {
      console.error('Error moving asset:', error);
      toast.error('Failed to move image');
    }
  };

  const reorderAssets = async (assetIds: string[], startIndex: number) => {
    try {
      const updates = assetIds.map((id, index) => ({
        id,
        order_index: startIndex + index,
      }));

      for (const update of updates) {
        await supabase
          .from('media_assets')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      await fetchAssets();
    } catch (error) {
      console.error('Error reordering assets:', error);
      toast.error('Failed to reorder images');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    uploading,
    uploadAssets,
    deleteAsset,
    updateAsset,
    moveToFolder,
    reorderAssets,
    refetch: fetchAssets,
  };
}
