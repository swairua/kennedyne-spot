import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  lightSrc?: string;
  darkSrc?: string;
  useDarkVariantInDarkMode?: boolean;
  removeBackgroundInDarkMode?: boolean;
}

const DEFAULT_LIGHT_LOGO = "/logo-dark.png";
const DEFAULT_DARK_LOGO = "/logo-dark.png";

export function BrandLogo({
  className,
  size = "md",
  lightSrc = DEFAULT_LIGHT_LOGO,
  darkSrc = DEFAULT_DARK_LOGO,
  useDarkVariantInDarkMode = true,
  removeBackgroundInDarkMode = false,
}: BrandLogoProps) {
  const [processedDarkSrc, setProcessedDarkSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sizeClasses = {
    sm: "h-10",
    md: "h-20",
    lg: "h-28",
  }[size];

  useEffect(() => {
    if (removeBackgroundInDarkMode && darkSrc && !processedDarkSrc && !isProcessing) {
      setIsProcessing(true);
      const processImage = async () => {
        try {
          console.log('Loading dark logo for background removal...');
          const img = await loadImage(darkSrc);
          console.log('Removing background...');
          const result = await removeBackground(img);
          setProcessedDarkSrc(result);
          console.log('Background removed successfully');
        } catch (error) {
          console.error('Failed to remove background, using original:', error);
          setProcessedDarkSrc(darkSrc);
        } finally {
          setIsProcessing(false);
        }
      };
      processImage();
    }
  }, [darkSrc, removeBackgroundInDarkMode, processedDarkSrc, isProcessing]);

  if (useDarkVariantInDarkMode && darkSrc) {
    const displayDarkSrc = removeBackgroundInDarkMode ? (processedDarkSrc || darkSrc) : darkSrc;
    
    return (
      <>
        <img
          src={lightSrc}
          alt="KenneDyne spot logo"
          className={cn("block dark:hidden w-auto object-contain", sizeClasses, className)}
          aria-label="KenneDyne spot"
          
          decoding="async"
        />
        <img
          src={displayDarkSrc}
          alt="KenneDyne spot logo"
          className={cn("hidden dark:block w-auto object-contain", sizeClasses, className)}
          aria-label="KenneDyne spot"
          
          decoding="async"
        />
      </>
    );
  }

  return (
    <img
      src={lightSrc}
      alt="KenneDyne spot logo"
      className={cn("block w-auto object-contain", sizeClasses, className)}
      aria-label="KenneDyne spot"
      
      decoding="async"
    />
  );
}

export default BrandLogo;
