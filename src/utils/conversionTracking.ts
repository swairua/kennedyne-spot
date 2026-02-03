// Conversion tracking utilities for Google Ads

export const trackConversion = (conversionId: string, value?: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency,
    });
  }
};

// Predefined conversion events
export const conversions = {
  // Education funnel conversions
  EDUCATION_STARTED: 'education_started',
  EDUCATION_COMPLETED: 'education_completed',
  
  // Mentorship funnel conversions  
  MENTORSHIP_APPLICATION: 'mentorship_application',
  MENTORSHIP_ENROLLED: 'mentorship_enrolled',
  
  // Contact conversions
  CONTACT_FORM: 'contact_form_submitted',
  WHATSAPP_CLICK: 'whatsapp_clicked',
  
  // Resource downloads
  RESOURCE_DOWNLOADED: 'resource_downloaded',
  
  // Newsletter signups
  NEWSLETTER_SIGNUP: 'newsletter_signup',
} as const;

export const trackEducationStart = () => {
  trackConversion(conversions.EDUCATION_STARTED);
  
  // Track as custom event for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.EDUCATION_STARTED, {
      event_category: 'education',
      event_label: 'drive_framework',
    });
  }
};

export const trackEducationComplete = () => {
  trackConversion(conversions.EDUCATION_COMPLETED);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.EDUCATION_COMPLETED, {
      event_category: 'education',
      event_label: 'drive_framework',
    });
  }
};

export const trackMentorshipApplication = () => {
  trackConversion(conversions.MENTORSHIP_APPLICATION);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.MENTORSHIP_APPLICATION, {
      event_category: 'mentorship',
      event_label: 'application_submitted',
    });
  }
};

export const trackContactForm = (source = 'general') => {
  trackConversion(conversions.CONTACT_FORM);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.CONTACT_FORM, {
      event_category: 'contact',
      event_label: source,
    });
  }
};

export const trackWhatsAppClick = (source = 'general') => {
  trackConversion(conversions.WHATSAPP_CLICK);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.WHATSAPP_CLICK, {
      event_category: 'contact',
      event_label: `whatsapp_${source}`,
    });
  }
};

export const trackResourceDownload = (resourceName: string) => {
  trackConversion(conversions.RESOURCE_DOWNLOADED);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.RESOURCE_DOWNLOADED, {
      event_category: 'resources',
      event_label: resourceName,
    });
  }
};

export const trackNewsletterSignup = () => {
  trackConversion(conversions.NEWSLETTER_SIGNUP);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversions.NEWSLETTER_SIGNUP, {
      event_category: 'newsletter',
      event_label: 'signup',
    });
  }
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}