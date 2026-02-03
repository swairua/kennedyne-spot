// Site content that can be dynamically updated via admin import

// Resources interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  coverImage?: string;
  url?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ebook {
  id: string;
  title: string;
  description: string;
  author: string;
  pages?: number;
  tags: string[];
  coverImage?: string;
  downloadUrl: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article' | 'sheet' | 'template';
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  coverImage?: string;
  url: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  // Navigation
  navigation: {
    brand: string;
    links: Array<{ name: string; href: string }>;
  };
  
  // Resources
  resources: {
    courses: Course[];
    ebooks: Ebook[];
    materials: Material[];
  };
  
  // Hero Section
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    cta1: string;
    cta2: string;
    disclaimer: string;
    trustStrip: string;
    trustIndicators: Array<{
      value: string;
      label: string;
    }>;
  };
  
  // Services Section
  services: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  
  
  // Testimonials Section
  testimonials: {
    title: string;
    subtitle: string;
    items: Array<{
      name: string;
      role: string;
      content: string;
      rating: number;
      initials: string;
      location?: string;
    }>;
    disclaimer: string;
  };
  
  // Blog Preview Section
  blogPreview: {
    title: string;
    subtitle: string;
    posts: Array<{
      title: string;
      excerpt: string;
      image: string;
      imageAlt?: string;
      slug: string;
      category?: string;
      readTime?: number;
      level?: string;
    }>;
    categories?: Array<string>;
  };
  
  // Newsletter Section
  newsletter: {
    title: string;
    subtitle: string;
    disclaimer: string;
    placeholder: string;
    button: string;
  };
  
  // Footer
  footer: {
    brand: string;
    description: string;
    services: {
      title: string;
      items: Array<{ name: string; href: string }>;
    };
    phone: string;
    email: string;
    whatsappText: string;
    socials: Array<{
      name: string;
      href: string;
      type: string;
    }>;
    sections: Array<{
      title: string;
      links: Array<{ name: string; href: string }>;
    }>;
    legalLinks: Array<{ name: string; href: string }>;
    copyright: string;
    designCredit: { text: string; url: string };
    riskDisclaimer: string;
  };
  
  // How It Works Section
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{
      number: string;
      title: string;
      description: string;
      features?: Array<string>;
    }>;
  };

  // Transform CTA Section
  transformCTA: {
    title: string;
    subtitle: string;
    stats: Array<{ value: string; label: string }>;
    button: { text: string; href: string };
  };

  // Final CTA Section
  finalCTA: {
    title: string;
    subtitle: string;
    button: { text: string; href: string };
    benefits: Array<string>;
  };

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  
  // Page-specific content
  pages: {
    driveStrategy: {
      title: string;
      subtitle: string;
      content: string;
    };
    blog: {
      title: string;
      subtitle: string;
      posts: Array<{
        title: string;
        excerpt: string;
        date: string;
        readTime: string;
      }>;
    };
    faqs: {
      title: string;
      subtitle: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
    contact: {
      title: string;
      subtitle: string;
      phone: string;
      email: string;
      whatsapp: string;
      address: string;
      form: {
        namePlaceholder: string;
        emailPlaceholder: string;
        messagePlaceholder: string;
        button: string;
      };
    };
  };
}

// Default content (current content as fallback)
export const defaultContent: SiteContent = {
  navigation: {
    brand: "KenneDyne spot",
    links: [
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
      { name: "DRIVE Strategy", href: "/strategy" },
      { name: "About", href: "/about" },
      { name: "Resources", href: "/resources" },
      { name: "Blog", href: "/blog" },
      { name: "FAQs", href: "/faqs" },
      { name: "Contact", href: "/contact" }
    ]
  },
  
  resources: {
    courses: [
      {
        id: "1",
        title: "DRIVE Trading Fundamentals",
        description: "Master the core principles of the DRIVE trading strategy with our comprehensive fundamentals course.",
        level: "Beginner" as const,
        tags: ["DRIVE", "Trading", "Fundamentals"],
        coverImage: "/lovable-uploads/trading-strategy.jpg",
        url: "/courses/drive-fundamentals",
        slug: "drive-fundamentals",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    ebooks: [
      {
        id: "1",
        title: "Risk Management Essentials",
        description: "A comprehensive guide to protecting your capital and managing risk in forex trading.",
        author: "KenneDyne spot",
        pages: 45,
        tags: ["Risk Management", "Capital Protection"],
        coverImage: "/lovable-uploads/risk-management.jpg",
        downloadUrl: "/downloads/risk-management-essentials.pdf",
        slug: "risk-management-essentials",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    materials: [
      {
        id: "1",
        title: "Market Psychology Cheat Sheet",
        description: "Quick reference guide for understanding market psychology and trader behavior patterns.",
        type: "sheet" as const,
        topic: "Psychology",
        level: "Intermediate" as const,
        tags: ["Psychology", "Reference", "Quick Guide"],
        coverImage: "/lovable-uploads/market-psychology.jpg",
        url: "/materials/market-psychology-sheet.pdf",
        slug: "market-psychology-cheat-sheet",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  hero: {
    badge: "EDUCATION-FIRST FOREX TRADING",
    headline: "Learn Institutional Trading Concepts with Structured <span class=\"text-primary\">DRIVE</span> Strategy",
    subheadline: "Access educational trading resources, market analysis training, and our institutional-based strategies when you sign up with our recommended broker through our partner <a href=\"https://one.exnesstrack.org/a/17eqnrbs54\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline text-primary font-semibold\">exness</a>.",
    cta1: "Start Learning",
    cta2: "See How DRIVE Works",
    disclaimer: "",
    trustStrip: "Proven methodology | Real education | No false promises",
    trustIndicators: [
      { value: "5+", label: "Years Experience" },
      { value: "Premium", label: "Content" },
      { value: "10K+", label: "Students" }
    ]
  },
  services: {
    title: "Our Educational Services",
    subtitle: "Comprehensive trading education focused on building real skills, not false promises",
    items: [
      {
        title: "DRIVE Strategy Training",
        description: "Learn our systematic 5-step approach to market analysis and trade execution with proper risk management."
      },
      {
        title: "1-on-1 Mentorship",
        description: "Personal guidance to develop your trading psychology, discipline, and understanding of market structure."
      },
      {
        title: "Risk Management Focus",
        description: "Master position sizing, stop losses, and capital preservation—the foundation of sustainable trading."
      }
    ]
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Get started in minutes and unlock institutional-level trading benefits completely free.",
    steps: [
      {
        number: "1",
        title: "Sign up with Exness",
        description: "Click our button below to create your free Exness account through our affiliate link. It only takes 2 minutes. Also, complete identity and residential verification."
      },
      {
        number: "2",
        title: "Fund Your Account",
        description: "Make your initial deposit to activate your account. Choose any amount that fits your trading capital goals."
      },
      {
        number: "3",
        title: "Send Your Account ID",
        description: "Once registered, send us your Exness account ID so we can verify your registration and activate your benefits."
      },
      {
        number: "4",
        title: "Unlock Everything Free",
        description: "Instantly receive access to premium signals, 1-on-1 mentorship, and complete DRIVE strategy training."
      }
    ]
  },
  testimonials: {
    title: "What Learners Say?",
    subtitle: "Feedback from our community of dedicated learners",
    items: [
      {
        name: "James M.",
        role: "Nairobi, Kenya",
        content: "The structured lessons helped me understand trading concepts more clearly. The mentorship sessions explained the reasoning behind different market setups.",
        rating: 5,
        initials: "JM"
      },
      {
        name: "Lerato P.",
        role: "Johannesburg, South Africa",
        content: "Being part of the Traders in the Zone community keeps me motivated. The discussions encourage collaboration and shared learning.",
        rating: 5,
        initials: "LP"
      },
      {
        name: "Emeka O.",
        role: "Lagos, Nigeria",
        content: "I appreciate the balance between guidance and education. It's helping me build confidence in developing my own trading approach.",
        rating: 5,
        initials: "EO"
      }
    ],
    disclaimer: "These testimonials reflect individual learning experiences. Trading results vary and past performance doesn't guarantee future success."
  },
  blogPreview: {
    title: "Trading Education Blog",
    subtitle: "Learn institutional trading concepts through our structured educational content",
    posts: [
      {
        title: "How DRIVE Strategy Transforms Trading",
        excerpt: "Discover how our systematic 5-step framework helps traders make disciplined, profitable decisions in any market condition.",
        image: "/lovable-uploads/trading-strategy.jpg",
        imageAlt: "Professional trader analyzing charts using the DRIVE strategy framework for systematic trading decisions",
        slug: "drive-strategy-framework",
        category: "Strategy",
        readTime: 6,
        level: "Beginner"
      },
      {
        title: "Risk Management Fundamentals", 
        excerpt: "Master the essential principles of capital preservation and position sizing that separate professional traders from retail gamblers.",
        image: "/lovable-uploads/risk-management.jpg",
        imageAlt: "Risk management dashboard showing position sizing calculations and capital preservation strategies",
        slug: "risk-management-basics",
        category: "Risk Management",
        readTime: 8,
        level: "Essential"
      },
      {
        title: "Building Trading Discipline",
        excerpt: "Learn practical techniques to develop the mental fortitude and emotional control required for consistent trading success.",
        image: "/lovable-uploads/market-psychology.jpg",
        imageAlt: "Professional trading workspace demonstrating disciplined trading psychology and systematic approach",
        slug: "trading-psychology-discipline",
        category: "Psychology",
        readTime: 5,
        level: "Intermediate"
      }
    ],
    categories: ["All", "Strategy", "Risk Management", "Psychology"]
  },
  newsletter: {
    title: "Weekly Market Notes",
    subtitle: "Setups, mistakes we're learning from, and checklists delivered to your inbox every Sunday",
    disclaimer: "Weekly insights. No spam. Unsubscribe anytime.",
    placeholder: "your.email@example.com",
    button: "Get the Notes"
  },
  footer: {
    brand: "Professional Smart Money Trading Education",
    description: "Transforming retail traders into institutional-level professionals through proven methodologies and mentorship",
    services: {
      title: "Services",
      items: [
        { name: "Daily Premium Signals", href: "/signals-tools" },
        { name: "1-on-1 Mentorship", href: "/mentorship" },
        { name: "DRIVE Strategy Training", href: "/services/learn" }
      ]
    },
    phone: "+254 726 529 166",
    email: "info@kennedynespot.com",
    whatsappText: "Get Support",
    socials: [
      { name: "Telegram Channel", href: "https://t.me/KenneDynespot", type: "telegram" },
      { name: "WhatsApp Channel", href: "https://whatsapp.com/channel/0029Vb7Ar5L3gvWZhG2xc43h", type: "whatsapp" },
      { name: "YouTube", href: "https://www.youtube.com/c/KenneDynespot", type: "youtube" },
      { name: "Twitter", href: "https://x.com/KenneDynespot?t=Yld3WlrnnLsLX425C1Ap4VA&s=09", type: "x" },
      { name: "Instagram", href: "https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDQzMTY4Njg1MzQ3ODI3?story_media_id=3713797231770477934_48486444646?igh=MXQ3MG00NWIjglyy==", type: "instagram" }
    ],
    sections: [
      {
        title: "Education",
        links: [
          { name: "DRIVE Strategy", href: "/strategy" },
          { name: "Risk Management", href: "/services/learn" },
          { name: "Trading Psychology", href: "/services/learn" },
          { name: "Market Analysis", href: "/blog" }
        ]
      },
      {
        title: "Support",
        links: [
          { name: "FAQs", href: "/faqs" },
          { name: "Contact Us", href: "/contact" },
          { name: "Mentorship", href: "/mentorship" },
          { name: "Community", href: "https://t.me/KenneDynespot" }
        ]
      },
      {
        title: "Company",
        links: [
          { name: "About Us", href: "/about" },
          { name: "Our Approach", href: "/strategy" },
          { name: "Testimonials", href: "/#testimonials" },
          { name: "Blog", href: "/blog" }
        ]
      }
    ],
    legalLinks: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Use", href: "/terms-of-use" },
      { name: "Risk Disclaimer", href: "/risk-disclaimer" },
      { name: "Affiliate Disclosure", href: "/affiliate-disclosure" }
    ],
    copyright: "© 2025 KenneDyne spot. All rights reserved.",
    designCredit: { text: "Designed by Zira Technologies", url: "https://www.zira-tech.com" },
    riskDisclaimer: "Trading involves substantial risk and is not suitable for all investors."
  },
  transformCTA: {
    title: "Ready to Transform Your Trading?",
    subtitle: "Join hundreds of traders building real skills through systematic education and proper risk management principles.",
    stats: [
      { value: "500+", label: "Students Educated" },
      { value: "200+", label: "Lessons Taught" },
      { value: "24/7", label: "Educational Support" }
    ],
    button: { text: "Begin Education", href: "/services/learn" }
  },
  finalCTA: {
    title: "Ready to Learn Professional Trading?",
    subtitle: "Start your systematic trading education with proven methods and realistic expectations.",
    button: { text: "Start Learning", href: "/services/learn" },
    benefits: [
      "Education-first approach",
      "Structured learning path", 
      "Complete DRIVE methodology",
      "Risk management focus",
      "Ongoing mentorship support"
    ]
  },
  seo: {
    title: "KenneDyne spot | Forex Education & DRIVE Strategy",
    description: "Master professional trading with education-first forex programs, systematic DRIVE strategy, risk management, and expert mentorship. No hype—just education and discipline.",
    keywords: "forex education, trading education, DRIVE strategy, risk management, trading mentorship, professional trading"
  },
  pages: {
    driveStrategy: {
      title: "The DRIVE Strategy",
      subtitle: "Our systematic approach to forex market analysis and trading decisions",
      content: "Learn our comprehensive DRIVE methodology for consistent market analysis."
    },
    blog: {
      title: "Trading Education Blog",
      subtitle: "Educational articles to improve your trading knowledge and skills",
      posts: [
        {
          title: "Understanding Market Structure",
          excerpt: "Learn to identify key market levels and structure for better trading decisions.",
          date: "2024-01-15",
          readTime: "5 min read"
        },
        {
          title: "Risk Management Fundamentals", 
          excerpt: "Master position sizing and capital preservation strategies.",
          date: "2024-01-10",
          readTime: "7 min read"
        },
        {
          title: "Trading Psychology Basics",
          excerpt: "Develop the mental discipline needed for consistent trading performance.",
          date: "2024-01-05",
          readTime: "6 min read"
        }
      ]
    },
    faqs: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about our educational approach and trading methodology",
      items: [
        {
          question: "What is the D.R.I.V.E strategy?",
          answer: "D.R.I.V.E is our systematic 5-step approach to market analysis covering Direction, Range, Interest Point (POI), Value of Risk, and Entry. It provides a structured framework for making trading decisions based on technical analysis and risk management principles."
        },
        {
          question: "Do you guarantee trading profits?",
          answer: "No. We are an educational platform focused on teaching proper trading concepts and risk management. Trading involves substantial risk, and most traders lose money. We emphasize education and realistic expectations."
        },
        {
          question: "Is this suitable for beginners?",
          answer: "Yes. Our education starts with fundamentals and builds systematically. We emphasize learning proper concepts before considering any live trading, with extensive focus on risk management and realistic expectations."
        },
        {
          question: "What makes your approach different?",
          answer: "We focus on education over promises. No 'get rich quick' schemes, no guaranteed returns. Just systematic education in market analysis, risk management, and trading psychology with realistic expectations about trading outcomes."
        },
        {
          question: "How long does it take to learn?",
          answer: "Learning proper trading concepts takes months of dedicated study and practice. We emphasize building solid foundations rather than rushing into live trading. Most successful traders spend significant time learning before seeing consistent results."
        }
      ]
    },
    contact: {
      title: "Contact Us",
      subtitle: "Get in touch for educational inquiries and mentorship opportunities",
      phone: "+254 726 529 166",
      email: "info@kennedynespot.com",
      whatsapp: "https://whatsapp.com/channel/0029Vb7Ar5L3gvWZhG2xc43h",
      address: "Nairobi, Kenya",
      form: {
        namePlaceholder: "Your Name",
        emailPlaceholder: "Your Email",
        messagePlaceholder: "Your Message",
        button: "Send Message"
      }
    }
  }
};

// Content management
let currentContent: SiteContent = { ...defaultContent };

export const getSiteContent = (): SiteContent => currentContent;

export const updateSiteContent = (newContent: Partial<SiteContent>): void => {
  // Save current content as backup before updating
  saveBackup();
  
  currentContent = { ...currentContent, ...newContent };
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('siteContent', JSON.stringify(currentContent));
  }
};

export const loadSiteContent = (): void => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('siteContent');
    if (saved) {
      try {
        currentContent = { ...defaultContent, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading saved content:', error);
        currentContent = defaultContent;
      }
    } else {
      currentContent = defaultContent;
    }
  }
};

export const resetSiteContent = (): void => {
  // Save current content as backup before resetting
  saveBackup();
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('siteContent');
  }
  currentContent = { ...defaultContent };
};

// Force reset navigation content specifically
export const updateNavigationContent = (): void => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('siteContent');
    if (saved) {
      try {
        const parsedContent = JSON.parse(saved);
        // Force update navigation with latest defaultContent
        parsedContent.navigation = { ...defaultContent.navigation };
        localStorage.setItem('siteContent', JSON.stringify(parsedContent));
        currentContent = { ...defaultContent, ...parsedContent };
      } catch (error) {
        console.error('Error updating navigation content:', error);
        resetSiteContent();
      }
    }
  }
};

// Backup and history management
interface ContentBackup {
  content: SiteContent;
  timestamp: string;
  description: string;
}

const saveBackup = (): void => {
  if (typeof window !== 'undefined') {
    const backup: ContentBackup = {
      content: { ...currentContent },
      timestamp: new Date().toISOString(),
      description: 'Auto-backup before change'
    };
    
    const history = getBackupHistory();
    history.unshift(backup);
    
    // Keep only last 10 backups
    const trimmedHistory = history.slice(0, 10);
    localStorage.setItem('siteContent_history', JSON.stringify(trimmedHistory));
  }
};

export const getBackupHistory = (): ContentBackup[] => {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem('siteContent_history');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading backup history:', error);
      return [];
    }
  }
  return [];
};

export const restoreBackup = (index: number): boolean => {
  const history = getBackupHistory();
  if (index >= 0 && index < history.length) {
    const backup = history[index];
    currentContent = { ...backup.content };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteContent', JSON.stringify(currentContent));
    }
    return true;
  }
  return false;
};

export const undoLastChange = (): boolean => {
  return restoreBackup(0);
};

export const clearBackupHistory = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('siteContent_history');
  }
};

// Initialize content on import
if (typeof window !== 'undefined') {
  loadSiteContent();
}
