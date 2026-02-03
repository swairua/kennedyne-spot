export interface ImageSize {
  width: number;
  label: string;
}

export interface OptimizedImage {
  blob: Blob;
  width: number;
  height: number;
  size: string;
}

export const IMAGE_SIZES: ImageSize[] = [
  { width: 400, label: 'small' },
  { width: 800, label: 'medium' },
  { width: 1200, label: 'large' },
  { width: 1600, label: 'xlarge' },
];

const MAX_ORIGINAL_WIDTH = 2400;
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.9;

/**
 * Load an image file and return an HTMLImageElement
 */
export async function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize and compress an image to a specific width, maintaining aspect ratio
 */
export async function resizeImage(
  image: HTMLImageElement,
  targetWidth: number,
  format: 'webp' | 'jpeg' = 'webp'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate dimensions maintaining aspect ratio
  const aspectRatio = image.height / image.width;
  const width = Math.min(targetWidth, image.width);
  const height = Math.round(width * aspectRatio);

  canvas.width = width;
  canvas.height = height;

  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the resized image
  ctx.drawImage(image, 0, 0, width, height);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      format === 'webp' ? 'image/webp' : 'image/jpeg',
      format === 'webp' ? WEBP_QUALITY : JPEG_QUALITY
    );
  });
}

/**
 * Check if the browser supports WebP
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/webp').includes('webp');
  } catch {
    return false;
  }
}

/**
 * Optimize a single image file by generating multiple sizes
 */
export async function optimizeImage(file: File): Promise<{
  original: OptimizedImage;
  sizes: Record<string, OptimizedImage>;
}> {
  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;
  const useWebP = supportsWebP();
  const format = useWebP ? 'webp' : 'jpeg';

  // Resize original if too large
  const maxWidth = Math.min(originalWidth, MAX_ORIGINAL_WIDTH);
  const originalBlob = await resizeImage(img, maxWidth, format);

  // Generate all responsive sizes
  const sizes: Record<string, OptimizedImage> = {};

  for (const { width, label } of IMAGE_SIZES) {
    // Only generate sizes smaller than the original
    if (width < originalWidth) {
      const blob = await resizeImage(img, width, format);
      sizes[label] = {
        blob,
        width,
        height: Math.round(width * (originalHeight / originalWidth)),
        size: label,
      };
    }
  }

  return {
    original: {
      blob: originalBlob,
      width: Math.min(originalWidth, MAX_ORIGINAL_WIDTH),
      height: Math.round(Math.min(originalWidth, MAX_ORIGINAL_WIDTH) * (originalHeight / originalWidth)),
      size: 'original',
    },
    sizes,
  };
}

/**
 * Calculate the file size reduction percentage
 */
export function calculateSavings(originalSize: number, optimizedSize: number): number {
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(baseUrl: string, sizes: Record<string, OptimizedImage>): string {
  return Object.values(sizes)
    .map(({ width, size }) => `${baseUrl.replace('original', size)} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(): string {
  return '(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1536px) 1200px, 1600px';
}

/**
 * Legacy helpers for backward compatibility
 */
export const generateResponsiveSrcSet = (
  imagePath: string,
  extension: string = 'jpg'
): string => {
  return `
    ${imagePath}-sm.${extension} 480w,
    ${imagePath}-md.${extension} 1024w,
    ${imagePath}-lg.${extension} 1920w
  `.trim();
};

export const getOptimizedImageUrl = (
  jpgUrl: string,
  webpUrl?: string
): string => {
  if (webpUrl && supportsWebP()) {
    return webpUrl;
  }
  return jpgUrl;
};

export const createImageConfig = (
  src: string,
  alt: string,
  width: number,
  height: number,
  priority: boolean = false
) => ({
  src,
  alt,
  width,
  height,
  loading: priority ? ('eager' as const) : ('lazy' as const),
  decoding: 'async' as const,
});
