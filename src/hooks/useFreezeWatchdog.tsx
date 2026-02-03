import { useEffect, useRef } from 'react';

interface FreezeWatchdogOptions {
  threshold?: number; // Time in ms to consider the main thread frozen
  interval?: number;  // How often to check (in ms)
  onFreeze?: (duration: number) => void;
}

/**
 * Development-only hook to detect main thread freezes
 * Helps identify performance issues that could cause freezing
 */
export function useFreezeWatchdog(options: FreezeWatchdogOptions = {}) {
  const {
    threshold = 150, // 150ms threshold (more lenient for dev)
    interval = 100,  // Check every 100ms (less frequent)
    onFreeze
  } = options;

  const lastCheckRef = useRef(Date.now());
  const watchdogRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkMainThread = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckRef.current;
      
      if (timeSinceLastCheck > threshold) {
        console.warn(`🚨 Main thread freeze detected: ${timeSinceLastCheck}ms`);
        onFreeze?.(timeSinceLastCheck);
      }
      
      lastCheckRef.current = now;
    };

    watchdogRef.current = setInterval(checkMainThread, interval);

    return () => {
      if (watchdogRef.current) {
        clearInterval(watchdogRef.current);
      }
    };
  }, [threshold, interval, onFreeze]);
}