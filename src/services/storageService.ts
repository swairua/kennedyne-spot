/**
 * Storage Service Abstraction
 * Provides a common interface for file storage operations
 * Currently implemented with Supabase Storage, but can be extended for other providers
 */

import { supabase } from '@/integrations/supabase/client';

export interface StorageProvider {
  uploadFile(bucketName: string, filePath: string, file: File): Promise<string>;
  deleteFile(bucketName: string, filePath: string): Promise<void>;
  getPublicUrl(bucketName: string, filePath: string): string;
}

class SupabaseStorageProvider implements StorageProvider {
  async uploadFile(bucketName: string, filePath: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true
      });

    if (error) throw error;
    return this.getPublicUrl(bucketName, data.path);
  }

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
  }

  getPublicUrl(bucketName: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}

class NoopStorageProvider implements StorageProvider {
  async uploadFile(): Promise<string> {
    throw new Error('File upload not configured. Please set up a storage provider.');
  }

  async deleteFile(): Promise<void> {
    // Silent no-op for delete operations
  }

  getPublicUrl(): string {
    return '';
  }
}

// Configuration - can be easily switched to other providers
const createStorageProvider = (): StorageProvider => {
  // Check if a valid storage provider is configured
  const supabaseUrl = "https://dbtyzloscmhaskjlbyvl.supabase.co";
  
  if (supabaseUrl && supabaseUrl.startsWith('https://')) {
    return new SupabaseStorageProvider();
  }
  
  return new NoopStorageProvider();
};

export const storageService = createStorageProvider();

// Helper function to check if storage is available
export const isStorageAvailable = (): boolean => {
  return !(storageService instanceof NoopStorageProvider);
};

// Helper function to check if a URL is from the current storage provider
export const isStorageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common storage provider patterns
  return url.includes('supabase.co/storage') || 
         url.includes('amazonaws.com') || 
         url.includes('cloudinary.com') ||
         url.includes('firebase.com');
};