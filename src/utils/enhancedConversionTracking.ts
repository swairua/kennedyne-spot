// Enhanced conversion tracking with compliance and validation

export interface ConversionEvent {
  eventName: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  customParameters?: Record<string, any>;
}

export interface ConversionConfig {
  googleAdsId?: string;
  ga4Id?: string;
  gtmId?: string;
  facebookPixelId?: string;
  debug?: boolean;
}

class EnhancedConversionTracker {
  private config: ConversionConfig;
  private consentGiven: boolean = false;

  constructor(config: ConversionConfig) {
    this.config = config;
    this.checkConsent();
  }

  private checkConsent(): void {
    const consentData = localStorage.getItem('user-consent');
    if (consentData) {
      try {
        const consent = JSON.parse(consentData);
        this.consentGiven = consent.analytics && consent.marketing;
      } catch {
        this.consentGiven = false;
      }
    }
  }

  trackConversion(event: ConversionEvent): void {
    if (!this.consentGiven) {
      if (this.config.debug) {
        console.log('Conversion tracking skipped - no consent');
      }
      return;
    }

    this.trackGoogleAds(event);
    this.trackGA4(event);
    this.trackGTM(event);
    this.trackFacebookPixel(event);
  }

  private trackGoogleAds(event: ConversionEvent): void {
    if (!this.config.googleAdsId || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'conversion', {
      send_to: this.config.googleAdsId,
      value: event.value,
      currency: event.currency || 'USD',
      transaction_id: this.generateTransactionId(),
      ...event.customParameters
    });

    if (this.config.debug) {
      console.log('Google Ads conversion tracked:', event);
    }
  }

  private trackGA4(event: ConversionEvent): void {
    if (!this.config.ga4Id || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', event.eventName, {
      value: event.value,
      currency: event.currency || 'USD',
      items: event.items,
      ...event.customParameters
    });

    if (this.config.debug) {
      console.log('GA4 event tracked:', event);
    }
  }

  private trackGTM(event: ConversionEvent): void {
    if (!this.config.gtmId || typeof window === 'undefined' || !window.dataLayer) return;

    window.dataLayer.push({
      event: event.eventName,
      value: event.value,
      currency: event.currency || 'USD',
      items: event.items,
      ...event.customParameters
    });

    if (this.config.debug) {
      console.log('GTM event tracked:', event);
    }
  }

  private trackFacebookPixel(event: ConversionEvent): void {
    if (!this.config.facebookPixelId || typeof window === 'undefined' || !(window as any).fbq) return;

    (window as any).fbq('track', event.eventName, {
      value: event.value,
      currency: event.currency || 'USD',
      ...event.customParameters
    });

    if (this.config.debug) {
      console.log('Facebook Pixel event tracked:', event);
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enhanced conversion events
  trackEducationStart(): void {
    this.trackConversion({
      eventName: 'education_started',
      customParameters: {
        event_category: 'education',
        event_label: 'drive_framework',
        engagement_time_msec: Date.now()
      }
    });
  }

  trackEducationComplete(): void {
    this.trackConversion({
      eventName: 'education_completed',
      value: 100, // Assign value for completed education
      customParameters: {
        event_category: 'education',
        event_label: 'drive_framework_completed',
        achievement_id: 'education_complete'
      }
    });
  }

  trackMentorshipApplication(applicationData?: any): void {
    this.trackConversion({
      eventName: 'mentorship_application',
      value: 200, // High value conversion
      customParameters: {
        event_category: 'mentorship',
        event_label: 'application_submitted',
        method: 'form_submission',
        ...applicationData
      }
    });
  }

  trackContactForm(source: string = 'general'): void {
    this.trackConversion({
      eventName: 'contact_form_submitted',
      customParameters: {
        event_category: 'contact',
        event_label: source,
        method: 'form'
      }
    });
  }

  trackResourceDownload(resourceName: string, resourceType: string = 'pdf'): void {
    this.trackConversion({
      eventName: 'resource_downloaded',
      customParameters: {
        event_category: 'resources',
        event_label: resourceName,
        content_type: resourceType,
        method: 'download'
      }
    });
  }

  trackNewsletterSignup(source: string = 'website'): void {
    this.trackConversion({
      eventName: 'newsletter_signup',
      customParameters: {
        event_category: 'newsletter',
        event_label: 'signup',
        method: source
      }
    });
  }

  trackWhatsAppClick(source: string = 'general'): void {
    this.trackConversion({
      eventName: 'whatsapp_clicked',
      customParameters: {
        event_category: 'contact',
        event_label: `whatsapp_${source}`,
        method: 'external_link'
      }
    });
  }
}

// Singleton instance
let trackerInstance: EnhancedConversionTracker | null = null;

export const initializeConversionTracking = (config: ConversionConfig): EnhancedConversionTracker => {
  if (!trackerInstance) {
    trackerInstance = new EnhancedConversionTracker(config);
  }
  return trackerInstance;
};

export const getConversionTracker = (): EnhancedConversionTracker | null => {
  return trackerInstance;
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}