/**
 * Route prefetch utility for faster navigation
 * Prefetches route modules when user hovers over links
 */

import { ComponentType, lazy } from 'react';

const lazyRouteCache = new Map<string, Promise<any>>();

/**
 * Prefetch a route module to cache it before navigation
 * Useful for speeding up navigation by loading code chunks early
 * 
 * @param path - Route path like '/strategy' or '/blog'
 * @param loaderFn - Function that dynamically imports the route component
 */
export const prefetchRoute = (
  path: string,
  loaderFn: () => Promise<any>
): void => {
  if (typeof window === 'undefined') return;
  
  // Only prefetch if not already cached
  if (!lazyRouteCache.has(path)) {
    lazyRouteCache.set(path, loaderFn());
  }
};

/**
 * Get a prefetched route or fetch it on demand
 * @param loaderFn - Function that dynamically imports the route component
 * @returns Promise that resolves to the module
 */
export const getPrefetchedRoute = (
  loaderFn: () => Promise<any>
): Promise<any> => {
  return loaderFn();
};

/**
 * Prefetch routes on link hover (for faster navigation UX)
 * @param path - Route path
 * @param loaderFn - Dynamic import function
 */
export const onLinkHover = (
  path: string,
  loaderFn: () => Promise<any>
): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      prefetchRoute(path, loaderFn);
    });
  } else {
    setTimeout(() => {
      prefetchRoute(path, loaderFn);
    }, 500);
  }
};

/**
 * Clear the prefetch cache (useful for cleanup)
 */
export const clearPrefetchCache = (): void => {
  lazyRouteCache.clear();
};
