import { useState, useEffect } from 'react';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
}

const CONSENT_KEY = 'user-consent';
const CONSENT_STATE_KEY = 'consent_state'; // Used by GA initialization in main.tsx

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConsent(parsed);
        updateGoogleConsent(parsed);
        console.debug('[Consent] Loaded saved consent state', parsed);
      } catch (error) {
        console.error('[Consent] Failed to parse consent:', error);
        setShowBanner(true);
      }
    } else {
      console.debug('[Consent] No saved consent found, showing banner');
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: ConsentState) => {
    try {
      setConsent(newConsent);
      setShowBanner(false);
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      localStorage.setItem(CONSENT_STATE_KEY, JSON.stringify({
        analytics: newConsent.analytics,
        marketing: newConsent.marketing
      }));
      updateGoogleConsent(newConsent);
      console.debug('[Consent] Consent saved and updated', newConsent);
    } catch (error) {
      console.error('[Consent] Failed to save consent:', error);
    }
  };

  const acceptAll = () => {
    const allConsent: ConsentState = {
      analytics: true,
      marketing: true,
      functional: true,
      necessary: true,
    };
    saveConsent(allConsent);
  };

  const rejectAll = () => {
    const minimalConsent: ConsentState = {
      analytics: false,
      marketing: false,
      functional: false,
      necessary: true,
    };
    saveConsent(minimalConsent);
  };

  return {
    consent,
    showBanner,
    saveConsent,
    acceptAll,
    rejectAll,
    hideBanner: () => setShowBanner(false),
  };
}

// Update Google Consent Mode v2
export function updateGoogleConsent(consent: ConsentState) {
  if (typeof window === 'undefined') return;

  const payload = {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.marketing ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  try {
    console.debug('[GA Consent] Updating consent mode v2', payload);

    // Prefer using gtag if available
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', payload);
      console.debug('[GA Consent] Consent updated via gtag function');
    } else {
      // Fallback: push the consent update to dataLayer so GTM/gtag can pick it up when it loads
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['consent', 'update', payload]);
      console.debug('[GA Consent] Consent queued in dataLayer (gtag not ready yet)');
    }

    // Push a tracking event for consent change
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_changed',
      consent_state: payload,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('[GA Consent] Failed to update consent:', e);
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
