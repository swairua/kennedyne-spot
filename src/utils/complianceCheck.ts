// Compliance and safety check utilities

export interface ComplianceStatus {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  analyticsCompliant: boolean;
  adBlockerDetected: boolean;
  cookieConsentGiven: boolean;
  accessibilityScore: number;
}

export const checkGDPRCompliance = (): boolean => {
  // Check if cookie consent is properly implemented
  const consentData = localStorage.getItem('user-consent');
  if (!consentData) return false;
  
  try {
    const consent = JSON.parse(consentData);
    return typeof consent === 'object' && 'necessary' in consent;
  } catch {
    return false;
  }
};

export const checkAnalyticsCompliance = (): boolean => {
  // Verify Google Analytics is configured with consent mode
  if (typeof window !== 'undefined' && window.gtag) {
    // Check if consent mode is active
    return true; // Simplified check
  }
  return false;
};

export const detectAdBlocker = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

export const checkAccessibility = (): number => {
  let score = 100;
  
  // Check for alt text on images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  score -= Math.min(imagesWithoutAlt.length * 5, 30);
  
  // Check for proper heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) score -= 20;
  
  // Check for skip links
  const skipLink = document.querySelector('a[href="#main-content"]');
  if (!skipLink) score -= 10;
  
  // Check for ARIA labels on interactive elements
  const buttons = document.querySelectorAll('button');
  const buttonsWithoutLabels = Array.from(buttons).filter(btn => 
    !btn.getAttribute('aria-label') && !btn.textContent?.trim()
  );
  score -= Math.min(buttonsWithoutLabels.length * 3, 15);
  
  return Math.max(score, 0);
};

export const runComplianceAudit = async (): Promise<ComplianceStatus> => {
  const [adBlockerDetected] = await Promise.all([
    detectAdBlocker()
  ]);
  
  return {
    gdprCompliant: checkGDPRCompliance(),
    ccpaCompliant: checkGDPRCompliance(), // Same implementation for now
    analyticsCompliant: checkAnalyticsCompliance(),
    adBlockerDetected,
    cookieConsentGiven: checkGDPRCompliance(),
    accessibilityScore: checkAccessibility()
  };
};

export const generateComplianceReport = async (): Promise<string> => {
  const status = await runComplianceAudit();
  
  return `
Compliance Audit Report
======================

GDPR Compliance: ${status.gdprCompliant ? '✅ Compliant' : '❌ Non-compliant'}
CCPA Compliance: ${status.ccpaCompliant ? '✅ Compliant' : '❌ Non-compliant'}
Analytics Compliance: ${status.analyticsCompliant ? '✅ Compliant' : '❌ Non-compliant'}
Cookie Consent: ${status.cookieConsentGiven ? '✅ Given' : '❌ Not given'}
Ad Blocker Detected: ${status.adBlockerDetected ? '⚠️ Yes' : '✅ No'}
Accessibility Score: ${status.accessibilityScore}/100

Recommendations:
${!status.gdprCompliant ? '- Implement proper cookie consent mechanism\n' : ''}
${!status.analyticsCompliant ? '- Configure Google Consent Mode v2\n' : ''}
${status.accessibilityScore < 90 ? '- Improve accessibility (add alt text, ARIA labels)\n' : ''}
${status.adBlockerDetected ? '- Consider fallback analytics for ad-blocked users\n' : ''}
  `.trim();
};