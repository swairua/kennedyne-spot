import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from '@/i18n';
import { QueryProvider } from './providers/QueryProvider';
import './index.css';
import { preloadCriticalResources, enableServiceWorker } from './utils/performanceOptimization';
import { initializeConversionTracking } from './utils/enhancedConversionTracking';
import { initializeAnimationDeferral } from './utils/deferredCSS';
import { installModuleLoadingDiagnostics } from './utils/moduleLoadingDiagnostics';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Install module loading diagnostics first
installModuleLoadingDiagnostics();

// Enhanced error handling for dynamic import failures
if (typeof window !== 'undefined') {
  let recoveryAttempts = 0;
  const MAX_RECOVERY_ATTEMPTS = 3;
  const RECOVERY_COOLDOWN_MS = 1000;
  let lastRecoveryTime = 0;

  const handleDynamicImportFailure = async (reasonMsg?: string) => {
    const now = Date.now();

    // Prevent rapid recovery attempts (cooldown)
    if (now - lastRecoveryTime < RECOVERY_COOLDOWN_MS) {
      console.debug('[Dynamic Import] Recovery cooldown active, skipping');
      return;
    }

    recoveryAttempts++;

    if (recoveryAttempts > MAX_RECOVERY_ATTEMPTS) {
      console.error('[Dynamic Import] Max recovery attempts exceeded. Manual reload required.');
      return;
    }

    lastRecoveryTime = now;
    console.warn(`[Dynamic Import] Recovery attempt ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}:`, reasonMsg);

    try {
      // Clear service worker cache and unregister to fetch fresh bundles
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
          console.debug('[Dynamic Import] Service workers unregistered');
        } catch (swError) {
          console.warn('[Dynamic Import] Service worker cleanup failed:', swError);
        }
      }

      // Clear browser caches
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
          console.debug('[Dynamic Import] Browser caches cleared');
        } catch (cacheError) {
          console.warn('[Dynamic Import] Cache cleanup failed:', cacheError);
        }
      }
    } catch (e) {
      console.warn('[Dynamic Import] Cleanup failed:', e);
    } finally {
      // Force reload with cache-busting parameter
      const reloadUrl = new URL(window.location.href);
      reloadUrl.searchParams.set('_recovery_attempt', String(recoveryAttempts));

      // Add delay before reload to ensure cleanup completes
      setTimeout(() => {
        try {
          window.location.replace(reloadUrl.toString());
        } catch (e) {
          console.error('[Dynamic Import] Reload failed:', e);
        }
      }, RECOVERY_COOLDOWN_MS);
    }
  };

  window.addEventListener('error', (evt: ErrorEvent) => {
    try {
      const message = (evt && (evt as any).message) || '';
      if (typeof message === 'string') {
        if (message.includes('Failed to fetch dynamically imported module')) {
          console.error('[Dynamic Import Error]', message);
          evt.preventDefault();
          handleDynamicImportFailure(message);
          return;
        }
      }
    } catch (e) {
      console.error('[Error Handler] Unexpected error:', e);
    }
  });

  window.addEventListener('unhandledrejection', (evt: PromiseRejectionEvent) => {
    try {
      const reason = (evt && (evt as any).reason) || {};
      const msg = reason && reason.message ? reason.message : String(reason);
      if (typeof msg === 'string') {
        if (msg.includes('Failed to fetch dynamically imported module')) {
          console.error('[Dynamic Import Rejection]', msg);
          evt.preventDefault();
          handleDynamicImportFailure(msg);
          return;
        }
      }
    } catch (e) {
      console.error('[Rejection Handler] Unexpected error:', e);
    }
  });

  // Intercept noisy third-party fetch failures and stabilize Vite HMR ping in dev
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let urlStr = '';
    try {
      if (typeof input === 'string') urlStr = input;
      else if (input instanceof Request) urlStr = input.url;
      else if (input instanceof URL) urlStr = input.toString();
      else urlStr = String(input);
    } catch (e) {
      urlStr = '';
    }

    // Short-circuit Vite DEV pings/HMR fetches to avoid noisy errors in constrained envs
    if (import.meta.env.DEV) {
      const isVitePing = urlStr.includes('/__vite_ping');
      const isViteClient = urlStr.includes('/@vite/') || urlStr.includes('/@react-refresh') || urlStr.includes('@vite/client');
      const isHmrAsset = urlStr.includes('hot-update') || urlStr.includes('__open-in-editor');
      if (isVitePing) {
        return new Response('pong', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      if (isViteClient || isHmrAsset) {
        try {
          return await originalFetch(input as any, init);
        } catch {
          return new Response(null, { status: 204 });
        }
      }
    }

    try {
      return await originalFetch(input as any, init);
    } catch (err: any) {
      const msg = err && (err.message || String(err)) || '';

      // Parse hostname/path safely to decide whether to silence
      let host = '';
      let path = '';
      try {
        const u = new URL(urlStr, typeof location !== 'undefined' ? location.origin : 'http://localhost');
        host = u.hostname || '';
        path = u.pathname || '';
      } catch (e) {
        host = '';
        path = urlStr || '';
      }

      // Silence fetch noise from analytics SDKs (e.g., FullStory), HMR-related assets, and optional translation endpoints
      if (typeof msg === 'string' && msg.toLowerCase().includes('failed to fetch')) {
        const isAnalytics = /fullstory|edge\.fullstory\.com/.test(host) || /\/s\/fs\.js/.test(path);
        const isHmr = /@vite|hot-update|__open-in-editor/.test(urlStr);
        const isTranslation = /libretranslate\.de|libretranslate\.com|translate\.argosopentech\.com/.test(host);
        if (isAnalytics || isHmr || isTranslation) {
          return new Response(null, { status: 204 });
        }
      }

      // For other networks errors, rethrow so application logic can handle them
      throw err;
    }
  };
}

// Initialize performance optimizations
preloadCriticalResources();
initializeAnimationDeferral();

if (import.meta.env.PROD) {
  enableServiceWorker();
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // In dev, only clean up service workers if doing a hard refresh
  // to avoid breaking caching benefits during development
  navigator.serviceWorker.getRegistrations().then((regs) => {
    // Only unregister if there are multiple registrations (likely stale)
    if (regs.length > 1) {
      regs.forEach((r) => r.unregister());
    }
  }).catch(() => {
    // Silently handle any service worker access errors
  });
}

// Initialize Web Vitals measurement (deferred to avoid blocking initial render)
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        onCLS(console.log);
        onFCP(console.log);
        onLCP(console.log);
        onTTFB(console.log);
      });
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        onCLS(console.log);
        onFCP(console.log);
        onLCP(console.log);
        onTTFB(console.log);
      });
    }, 1000);
  }
}

// Initialize Google Analytics early, before React render
if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  try {
    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    // Check for existing consent from localStorage
    let savedConsent = null;
    try {
      const consentData = localStorage.getItem('consent_state');
      if (consentData) {
        savedConsent = JSON.parse(consentData);
      }
    } catch (e) {
      console.debug('[GA4] Failed to retrieve saved consent:', e);
    }

    // Set up Google Consent Mode v2 before loading GA
    // Default to 'denied' for GDPR compliance, but use saved consent if available
    const analyticsConsent = savedConsent?.analytics === true ? 'granted' : 'denied';
    const adConsent = savedConsent?.marketing === true ? 'granted' : 'denied';

    gtag('consent', 'default', {
      analytics_storage: analyticsConsent,
      ad_storage: adConsent,
      functionality_storage: 'denied',
      personalization_storage: adConsent,
      security_storage: 'granted',
      wait_for_update: 2000,
    });

    console.debug('[GA4] Consent mode initialized', {
      gaId,
      analytics_storage: analyticsConsent,
      ad_storage: adConsent,
      hasSavedConsent: !!savedConsent
    });

    gtag('js', new Date());
    gtag('config', gaId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=Strict;Secure'
    });

    console.debug('[GA4] Configuration applied', { gaId });

    // Load Google Analytics script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.id = 'google-analytics-script';
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;

    // Add error and load event listeners for debugging
    gaScript.onerror = () => {
      console.error('[GA4] Failed to load GA script', { gaId });
    };
    gaScript.onload = () => {
      console.debug('[GA4] GA script loaded successfully', { gaId });
    };

    document.head.appendChild(gaScript);
    console.debug('[GA4] GA script injected into head', { gaId });
  } catch (error) {
    console.error('[GA4] Initialization failed:', error);
  }
}

// Defer conversion tracking initialization
if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  const initTracking = () => {
    try {
      initializeConversionTracking({
        ga4Id: import.meta.env.VITE_GA_MEASUREMENT_ID,
        gtmId: import.meta.env.VITE_GTM_ID || undefined,
        debug: import.meta.env.DEV
      });
      console.debug('[Conversion Tracking] Initialized', {
        ga4Id: import.meta.env.VITE_GA_MEASUREMENT_ID,
        gtmId: import.meta.env.VITE_GTM_ID
      });
    } catch (error) {
      console.error('[Conversion Tracking] Initialization failed:', error);
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initTracking, { timeout: 3000 });
  } else {
    setTimeout(initTracking, 1000);
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </QueryProvider>
  </StrictMode>
);
