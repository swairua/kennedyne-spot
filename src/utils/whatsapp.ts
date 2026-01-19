/**
 * WhatsApp utility functions for creating clean wa.me links
 */

/**
 * Sanitizes phone number to digits only (removes +, spaces, hyphens, etc.)
 * Also normalizes Kenyan numbers that start with 0 to international format
 */
export const sanitizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  
  // If it's a Kenyan number starting with 0 and is 10 digits, convert to 254
  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return '254' + digitsOnly.slice(1);
  }
  
  return digitsOnly;
};

/**
 * Normalizes message text by replacing curly quotes with straight quotes
 */
const normalizeMessage = (message: string): string => {
  return message
    .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes (U+201C, U+201D)
    .replace(/[\u2018\u2019]/g, "'"); // Replace curly single quotes (U+2018, U+2019)
};

/**
 * Validates a WhatsApp URL format
 */
const validateWhatsAppUrl = (url: string): boolean => {
  // Check for spaces in URL
  if (url.includes(' ')) return false;
  
  // Check that % only appears in valid encodings (followed by 2 hex digits)
  const invalidPercent = /%(?![0-9A-Fa-f]{2})/;
  if (invalidPercent.test(url)) return false;
  
  // Extract phone from URL and validate it's digits only
  const phoneMatch = url.match(/wa\.me\/(\d+)/);
  if (phoneMatch) {
    const phone = phoneMatch[1];
    return /^\d+$/.test(phone);
  }
  
  return true;
};

/**
 * Creates a properly formatted WhatsApp link using wa.me
 * @param phone - Phone number with or without country code
 * @param message - Message to pre-fill (curly quotes will be normalized)
 * @returns Clean wa.me URL
 */
export const createWhatsAppLink = (phone: string | null | undefined, message?: string): string => {
  const cleanPhone = sanitizePhoneNumber(phone);
  
  if (!cleanPhone) {
    // Fallback to generic WhatsApp if no phone provided
    if (message) {
      const normalizedMessage = normalizeMessage(message);
      const url = `https://wa.me/?text=${encodeURIComponent(normalizedMessage)}`;
      return validateWhatsAppUrl(url) ? url : 'https://wa.me/';
    }
    return 'https://wa.me/';
  }
  
  const baseUrl = `https://wa.me/${cleanPhone}`;
  
  if (message) {
    const normalizedMessage = normalizeMessage(message);
    const url = `${baseUrl}?text=${encodeURIComponent(normalizedMessage)}`;
    return validateWhatsAppUrl(url) ? url : baseUrl;
  }
  
  return baseUrl;
};

/**
 * Pre-defined clean messages for different use cases
 * Note: These avoid apostrophes and quotes to prevent encoding issues
 */
export const WHATSAPP_MESSAGES = {
  support: "Hi! I am interested in learning more about your trading education programs.",
  contact: "Hi! I would like to get in touch with your team.",
  mentorship: "Hi! I am interested in your mentorship program and would like to learn more.",
  mentorship_follow_up: "Hi! I just submitted my mentorship application. I have some questions about the program structure and next steps.",
  blogCTA: (postTitle: string) => 
    `Hi! I just read "${postTitle}" on your blog and I am interested in learning more about professional forex trading. Can you help me get started?`,
  adminReply: (name: string, type: 'mentorship' | 'contact' | 'newsletter' | 'session') => 
    `Hi ${name}! Thank you for your ${type} submission. I would like to discuss your goals and how we can help you. When would be a good time for a brief call?`,
} as const;

/**
 * Default phone number (can be overridden by site settings)
 */
export const DEFAULT_WHATSAPP_PHONE = "254726529166";
