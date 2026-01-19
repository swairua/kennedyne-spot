import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const NAIROBI_TZ = 'Africa/Nairobi';

// Typographic cleanup functions
export const formatTypography = (content: string): string => {
  let formatted = content;

  // Convert straight quotes to smart quotes
  formatted = formatted
    // Opening double quotes
    .replace(/(\s|^|>)"([^\s"])/g, '$1\u201C$2')
    // Closing double quotes
    .replace(/([^\s"])"(\s|$|<|[.,;:!?])/g, '$1\u201D$2')
    // Opening single quotes (including apostrophes at start of words)
    .replace(/(\s|^|>)'([^\s'])/g, '$1\u2018$2')
    // Closing single quotes
    .replace(/([^\s'])'(\s|$|<|[.,;:!?])/g, '$1\u2019$2');

  // Fix ellipses
  formatted = formatted.replace(/\.{3}/g, '…');

  // Fix em dashes
  formatted = formatted.replace(/--/g, '—');

  // Fix en dashes for ranges
  formatted = formatted.replace(/(\d+)\s*-\s*(\d+)/g, '$1–$2');

  // Add non-breaking spaces
  formatted = formatted
    // Between numbers and currency
    .replace(/(\d+)\s+(KES|USD|EUR|GBP)/g, '$1\u00A0$2')
    // Between numbers and units
    .replace(/(\d+)\s+(kg|km|m|cm|mm|kW|MW|%)/g, '$1\u00A0$2')
    // Between numbers and symbols (degree symbol is U+00B0)
    .replace(/(\d+)\s*([\u00B0%])/g, '$1\u00A0$2');

  return formatted;
};

// Title case conversion
export const toTitleCase = (str: string): string => {
  const articles = ['a', 'an', 'the'];
  const conjunctions = ['and', 'but', 'or', 'nor', 'for', 'so', 'yet'];
  const prepositions = ['at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'as'];
  const lowercaseWords = [...articles, ...conjunctions, ...prepositions];

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === str.split(' ').length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Don't capitalize articles, conjunctions, or short prepositions
      if (lowercaseWords.includes(word)) {
        return word;
      }
      
      // Capitalize everything else
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Generate clean slugs
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Extract and format headings for TOC
export const extractHeadings = (markdown: string): Array<{ id: string; text: string; level: number }> => {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: Array<{ id: string; text: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text);
    
    headings.push({ id, text, level });
  }

  return headings;
};

// Format numbers for Kenya locale
export const formatNumber = (num: number, style: 'decimal' | 'currency' | 'compact' = 'decimal'): string => {
  const formatter = new Intl.NumberFormat('en-KE', {
    style: style === 'currency' ? 'currency' : 'decimal',
    currency: style === 'currency' ? 'KES' : undefined,
    notation: style === 'compact' ? 'compact' : 'standard',
    compactDisplay: 'short'
  });

  return formatter.format(num);
};

// Format dates for Kenya timezone
export const formatDate = (date: Date | string, formatStr: string = 'd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, NAIROBI_TZ);
  return format(zonedDate, formatStr);
};

// Reading time calculation
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Word and sentence count for analysis
export const analyzeContent = (content: string) => {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() && !p.match(/^#{1,6}\s/));
  
  const analysis = {
    wordCount: content.trim().split(/\s+/).length,
    paragraphCount: paragraphs.length,
    avgWordsPerParagraph: paragraphs.length > 0 ? 
      Math.round(paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0) / paragraphs.length) : 0,
    longParagraphs: paragraphs.filter(p => p.split(/\s+/).length > 140).length,
    headingCount: (content.match(/^#{1,6}\s/gm) || []).length,
    internalLinks: (content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || []).length,
    externalLinks: (content.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g) || []).length,
    images: (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length,
    imagesWithoutAlt: (content.match(/!\[\s*\]\([^)]+\)/g) || []).length
  };

  return analysis;
};

// Clean pasted content from Word/Google Docs
export const cleanPastedContent = (html: string): string => {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove all style attributes
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');
  });

  // Convert common elements to markdown
  let cleaned = temp.innerHTML;

  // Convert headings
  cleaned = cleaned.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(Math.max(2, parseInt(level))); // Start from H2
    return `\n\n${hashes} ${content.trim()}\n\n`;
  });

  // Convert paragraphs
  cleaned = cleaned.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n');

  // Convert lists
  cleaned = cleaned.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });

  cleaned = cleaned.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
  });

  // Convert emphasis
  cleaned = cleaned.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  cleaned = cleaned.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  cleaned = cleaned.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  cleaned = cleaned.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Convert links
  cleaned = cleaned.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');

  return cleaned;
};

// Generate JSON-LD structured data
export const generateStructuredData = (type: string, data: any) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type
  };

  switch (type) {
    case 'Article':
      return {
        ...baseData,
        headline: data.title,
        description: data.excerpt,
        image: data.featuredImage,
        datePublished: data.publishedAt,
        dateModified: data.updatedAt,
        author: {
          '@type': 'Person',
          name: data.authorName
        },
        publisher: {
          '@type': 'Organization',
          name: 'KenneDyne spot',
          logo: {
            '@type': 'ImageObject',
            url: 'https://kennedynespot.com/logo.png'
          }
        }
      };

    case 'FAQPage':
      return {
        ...baseData,
        mainEntity: data.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };

    case 'HowTo':
      return {
        ...baseData,
        name: data.title,
        description: data.description,
        step: data.steps.map((step: any, index: number) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.text,
          image: step.image
        }))
      };

    default:
      return baseData;
  }
};
