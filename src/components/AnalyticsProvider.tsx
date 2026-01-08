import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function AnalyticsProvider() {
  const location = useLocation();

  // Skip analytics for health endpoints and internal routes
  const shouldSkipAnalytics = location.pathname === '/_health' || location.pathname.startsWith('/_');

  // Track SPA page views on route changes
  // GA is already initialized in main.tsx via environment variable VITE_GA_MEASUREMENT_ID
  useEffect(() => {
    if (shouldSkipAnalytics) return;

    const track = (retryCount = 0, maxRetries = 3) => {
      if (typeof window === 'undefined') return;

      try {
        // Try to track with gtag
        if (typeof window.gtag === 'function') {
          const pageViewData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: location.pathname,
          };

          window.gtag('event', 'page_view', pageViewData);
          console.debug('[GA4] page_view event sent', pageViewData);
        } else if (retryCount < maxRetries) {
          // gtag not ready yet, retry after a short delay
          const delay = Math.pow(2, retryCount) * 100; // exponential backoff: 100ms, 200ms, 400ms
          console.debug(`[GA4] gtag not ready, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

          setTimeout(() => {
            track(retryCount + 1, maxRetries);
          }, delay);
        } else {
          // Fallback: push to dataLayer directly for GTM to handle
          if (window.dataLayer && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
              event: 'page_view',
              page_title: document.title,
              page_location: window.location.href,
              page_path: location.pathname,
            });
            console.debug('[GA4] page_view pushed to dataLayer (gtag failed after retries)', {
              path: location.pathname
            });
          } else {
            console.warn('[GA4] Failed to track page_view - gtag not available and dataLayer not initialized');
          }
        }
      } catch (error) {
        console.error('[GA4] Error tracking page_view:', error, {
          path: location.pathname,
          retryCount,
        });
      }
    };

    // Start tracking with retry logic
    track();
  }, [location.pathname, shouldSkipAnalytics]);

  return null;
}
