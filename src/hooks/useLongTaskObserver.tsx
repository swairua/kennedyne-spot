import { useEffect, useRef } from 'react';

interface LongTaskObserverOptions {
  threshold?: number; // Time in ms to consider a task long
  onLongTask?: (duration: number, taskType: string) => void;
}

/**
 * Production-safe hook to observe long tasks using PerformanceObserver
 * Helps identify performance bottlenecks in production
 */
export function useLongTaskObserver(options: LongTaskObserverOptions = {}) {
  const {
    threshold = 50, // 50ms threshold for long tasks
    onLongTask
  } = options;

  const observerRef = useRef<PerformanceObserver>();

  useEffect(() => {
    // Check if PerformanceObserver is supported
    if (!window.PerformanceObserver) return;

    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.duration > threshold) {
            // Only log in development, but call callback in all environments
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚡ Long task detected: ${Math.round(entry.duration)}ms (${entry.name})`);
            }
            
            onLongTask?.(entry.duration, entry.name);
          }
        });
      });

      // Observe different types of performance entries
      observerRef.current.observe({ entryTypes: ['longtask', 'measure', 'navigation'] });
    } catch (error) {
      // Silently fail if observer types aren't supported
      if (process.env.NODE_ENV === 'development') {
        console.warn('LongTaskObserver not supported in this browser');
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, onLongTask]);
}