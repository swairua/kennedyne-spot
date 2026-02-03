/**
 * Utilities for diagnosing and recovering from module loading failures
 */

export interface ModuleLoadingError {
  timestamp: number;
  url: string;
  error: string;
  type: 'fetch' | 'parse' | 'execute' | 'import';
}

class ModuleLoadingDiagnostics {
  private errors: ModuleLoadingError[] = [];
  private maxErrors = 50;

  recordError(url: string, error: string, type: ModuleLoadingError['type'] = 'fetch') {
    this.errors.push({
      timestamp: Date.now(),
      url,
      error,
      type,
    });

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`[Module Loading] ${type.toUpperCase()}: ${url}`, error);
    }
  }

  getErrors(): ModuleLoadingError[] {
    return [...this.errors];
  }

  getErrorSummary(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    failedModules: string[];
    recentError?: ModuleLoadingError;
  } {
    return {
      totalErrors: this.errors.length,
      errorsByType: this.errors.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      failedModules: Array.from(new Set(this.errors.map(e => e.url))),
      recentError: this.errors[this.errors.length - 1],
    };
  }

  clearErrors() {
    this.errors = [];
  }

  /**
   * Check if a module can be loaded
   */
  async checkModuleAvailability(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
      return response.ok;
    } catch (e) {
      this.recordError(url, String(e), 'fetch');
      return false;
    }
  }

  /**
   * Get diagnostic information for debugging
   */
  getDiagnosticInfo(): {
    summary: ReturnType<typeof this.getErrorSummary>;
    cacheInfo: {
      caches: string[];
      serviceWorkerActive: boolean;
    };
    navigationTiming: {
      pageLoadTime: number;
      resourceLoadTime: number;
    };
  } {
    const cacheNames: string[] = [];
    let serviceWorkerActive = false;

    try {
      if ('caches' in window) {
        // Can't enumerate cache contents without async, so just flag existence
        cacheNames.push('caches available');
      }
    } catch (e) {
      console.warn('Failed to check caches', e);
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        serviceWorkerActive = true;
      }
    } catch (e) {
      console.warn('Failed to check service worker', e);
    }

    const timing = window.performance?.timing;
    const navigationTiming = {
      pageLoadTime: timing ? timing.loadEventEnd - timing.navigationStart : 0,
      resourceLoadTime: timing ? timing.responseEnd - timing.requestStart : 0,
    };

    return {
      summary: this.getErrorSummary(),
      cacheInfo: {
        caches: cacheNames,
        serviceWorkerActive,
      },
      navigationTiming,
    };
  }
}

export const moduleLoadingDiagnostics = new ModuleLoadingDiagnostics();

/**
 * Install global error listeners to track module loading failures
 */
export function installModuleLoadingDiagnostics() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event: ErrorEvent) => {
    if (event.message?.includes('Failed to fetch dynamically imported module')) {
      const currentScript = document.currentScript as HTMLScriptElement | null;
      moduleLoadingDiagnostics.recordError(
        currentScript?.src || 'unknown',
        event.message,
        'import'
      );
    }
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const message = event.reason?.message || String(event.reason);
    if (message?.includes('Failed to fetch dynamically imported module')) {
      moduleLoadingDiagnostics.recordError(
        'unknown',
        message,
        'fetch'
      );
    }
  });

  // Make diagnostics available globally for debugging
  (window as any).__moduleLoadingDiagnostics = moduleLoadingDiagnostics;
}
