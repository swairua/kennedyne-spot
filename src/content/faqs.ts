import { driveFullName } from "./drive";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  { id: "general", label: "General", icon: "📋" },
  { id: "strategy", label: "Strategy", icon: "📈" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "risk", label: "Risk & Legal", icon: "⚠️" },
  { id: "support", label: "Support", icon: "💬" }
];

export const faqs: FAQ[] = [
  // General
  {
    id: "what-is-kennedyne-spot",
    question: "Are you a broker or financial institution?",
    answer: "No, we are an education company only. We do not execute trades, hold client funds, or act as a broker. We provide educational content and mentorship to help traders develop their skills and knowledge.",
    category: "general"
  },
  {
    id: "what-markets-focus",
    question: "What markets do you focus on?",
    answer: "Our educational content primarily focuses on forex markets, but many principles apply to other financial markets. We emphasize understanding market structure and institutional behavior across various timeframes.",
    category: "general"
  },
  {
    id: "suitable-for-beginners",
    question: "Is your content suitable for beginners?",
    answer: "Yes, we design our educational content for all levels. However, we strongly recommend that beginners start with paper trading and focus on education before risking any real capital.",
    category: "general"
  },

  // Strategy
  {
    id: "what-is-drive-strategy",
    question: "What is the DRIVE Strategy?",
    answer: `DRIVE is our systematic trading framework: ${driveFullName}. It's a comprehensive approach that teaches traders to analyze market direction through multiple timeframes, define trading ranges, identify high-probability interest points, apply proper risk management, and execute trades with institutional precision.`,
    category: "strategy"
  },
  {
    id: "signals-alone",
    question: "Can I rely on signals alone for trading?",
    answer: "No. Any signals or trade ideas we share are for educational purposes only. They are meant to be studied and understood, not blindly followed. Always develop your own analysis skills and risk management plan.",
    category: "strategy"
  },
  {
    id: "how-long-progress",
    question: "How long does it take to see progress in trading?",
    answer: "This varies greatly depending on individual effort, discipline, and time commitment. Most traders need months or years of consistent practice and study. There are no shortcuts to developing proper trading skills.",
    category: "strategy"
  },

  // Education
  {
    id: "personal-mentorship",
    question: "Do you offer personal mentorship or coaching?",
    answer: "We offer group mentorship sessions and community support. For personal mentorship inquiries, please contact us directly. Remember, no mentor can guarantee your trading success - the work must come from you.",
    category: "education"
  },
  {
    id: "money-to-start",
    question: "How much money do I need to start trading?",
    answer: "You should never risk money you cannot afford to lose. We recommend starting with paper trading (demo accounts) to practice without risk. When you do trade live, start with small amounts you can afford to lose completely.",
    category: "education"
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: "We accept M-Pesa, bank transfers, and major credit/debit cards. All payments are processed securely and receipts are provided for educational services.",
    category: "education"
  },

  // Risk & Legal
  {
    id: "guarantee-profits",
    question: "Do you guarantee trading profits or returns?",
    answer: "Absolutely not. We do not guarantee profits, returns, or trading success. Trading involves significant risk and potential loss of capital. Past performance is not indicative of future results. Our focus is on education, not profit promises.",
    category: "risk"
  },
  {
    id: "trading-suitable-everyone",
    question: "Is trading suitable for everyone?",
    answer: "No. Trading involves significant risk and is not suitable for everyone. You should carefully consider your financial situation, risk tolerance, and investment objectives before trading. Never trade with money you need for essential expenses.",
    category: "risk"
  },
  {
    id: "teach-profitable-trading",
    question: "Can you teach me to trade profitably?",
    answer: "We can teach you market analysis, risk management, and trading discipline. However, profitable trading depends on many factors including your psychology, risk tolerance, capital management, and market conditions. We focus on education, not profit promises.",
    category: "risk"
  },
  {
    id: "affiliate-relationships",
    question: "Do you have affiliate relationships with brokers?",
    answer: "We may have affiliate relationships with educational platforms or brokers. If we earn commissions from referrals, this will be clearly disclosed. Our educational content is not influenced by these relationships.",
    category: "risk"
  },

  // Support
  {
    id: "contact-support",
    question: "How can I contact support?",
    answer: "You can reach us via email at info@kennedynespot.com or WhatsApp. We aim to respond within 24-48 hours during business days. For urgent educational questions, WhatsApp is usually the fastest.",
    category: "support"
  }
];

// Generate schema for SEO
export const generateFAQSchema = (selectedCategory?: string) => {
  const filteredFAQs = selectedCategory && selectedCategory !== 'all' 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};
