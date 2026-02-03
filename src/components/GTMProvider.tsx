import { ReactNode, useEffect } from 'react';

interface GTMProviderProps {
  children: ReactNode;
  gtmId?: string;
}

export function GTMProvider({ children, gtmId }: GTMProviderProps) {
  useEffect(() => {
    if (!gtmId) return;

    // Initialize dataLayer
    if (typeof window !== 'undefined' && !window.dataLayer) {
      window.dataLayer = [];
    }

    // Defer GTM script injection to avoid blocking initial render
    if (document.querySelector(`script[src*="${gtmId}"]`)) {
      return; // Already loaded
    }

    // Use requestIdleCallback to inject after browser is idle
    const injectGTM = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);

      if (window.dataLayer) {
        window.dataLayer.push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(injectGTM, { timeout: 2000 });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(injectGTM, 100);
    }
  }, [gtmId]);

  return <>{children}</>;
}

// Helper function for tracking events
export const trackEvent = (event: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...parameters,
    });
  }
};

// Declare global dataLayer and gtag types
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}
