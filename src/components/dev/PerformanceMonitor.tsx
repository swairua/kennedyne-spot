import { useEffect, useState } from 'react';
import { useFreezeWatchdog } from '@/hooks/useFreezeWatchdog';

interface PerformanceStats {
  memory?: number;
  freezeCount: number;
  lastFreezeMs?: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    freezeCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // Monitor main thread freezes
  useFreezeWatchdog({
    threshold: 150, // 150ms freeze threshold (more lenient for dev)
    onFreeze: (duration) => {
      setStats(prev => ({
        ...prev,
        freezeCount: prev.freezeCount + 1,
        lastFreezeMs: duration
      }));
    }
  });

  // Update memory usage
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setStats(prev => ({
          ...prev,
          memory: Math.round(memInfo.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);

    return () => clearInterval(interval);
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/90 text-white p-3 rounded-lg text-xs font-mono border border-white/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-bold">Performance Monitor</span>
      </div>
      
      <div className="space-y-1">
        {stats.memory && (
          <div>Memory: {stats.memory}MB</div>
        )}
        <div>Freezes: {stats.freezeCount}</div>
        {stats.lastFreezeMs && (
          <div className="text-red-400">
            Last freeze: {stats.lastFreezeMs}ms
          </div>
        )}
      </div>
      
      <div className="text-gray-400 mt-2 text-[10px]">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}