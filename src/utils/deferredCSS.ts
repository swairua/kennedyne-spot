/**
 * Utility to defer non-critical CSS animations and effects
 * This reduces render-blocking CSS and improves first paint
 */

/**
 * Load CSS animations after initial render
 * Useful for deferring expensive animations until after FCP
 */
export const loadCSSAnimations = (): void => {
  if (typeof document === 'undefined') return;
  
  // Add animation-enabling class to document after page is interactive
  const enableAnimations = () => {
    document.documentElement.classList.add('animations-enabled');
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(enableAnimations);
  } else {
    setTimeout(enableAnimations, 1000);
  }
};

/**
 * Conditionally load expensive animations based on user preference
 * Respects prefers-reduced-motion media query
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Create a deferred animation class utility
 * Allows animations to be added only when they won't impact performance
 */
export const getAnimationClass = (animationName: string): string => {
  if (shouldReduceMotion()) {
    return ''; // Don't apply animations if user prefers reduced motion
  }
  
  // Check if page has loaded and is interactive
  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    return animationName;
  }
  
  return ''; // Don't apply animations during initial load
};

/**
 * Defer loading of non-critical stylesheets
 * Helps reduce render-blocking CSS
 */
export const deferStylesheet = (href: string): void => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  
  // Use media query to prevent render blocking
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  
  document.head.appendChild(link);
};

/**
 * Initialize animation deferral on page load
 */
export const initializeAnimationDeferral = (): void => {
  loadCSSAnimations();
};
