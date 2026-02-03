// Centralized links configuration for all CTAs
export const LINKS = {
  // Telegram links
  telegram: {
    channel: "https://t.me/KenneDynespot",
    community: "https://t.me/KenneDynespot",
    support: "https://t.me/KenneDynespot",
    kenneDynespot: "https://t.me/KenneDynespot",
  },
  
  // Exness links (affiliate)
  exness: {
    signup: "https://one.exnesstrack.org/a/17eqnrbs54",
    demo: "https://one.exnesstrack.org/a/17eqnrbs54",
    account: "https://one.exnesstrack.org/a/17eqnrbs54",
  },

  // WhatsApp (use whatsapp.ts utility for dynamic links)
  whatsapp: {
    contact: "https://wa.me/254726529166",
    support: "https://wa.me/254726529166?text=Hi%21%20I%20am%20interested%20in%20learning%20more%20about%20your%20trading%20education%20programs.",
    channel: "https://whatsapp.com/channel/0029Vb7Ar5L3gvWZhG2xc43h"
  },
  instagram: "https://www.instagram.com/kennedyne_spot?igsh=NnVoeXJoZ2dmemF5",
  youtube: "https://www.youtube.com/c/KenneDynespot",
  twitter: "https://x.com/KenneDynespot?t=Yld3WlrnnLsLX425C1Ap4VA&s=09",

  // Internal links
  internal: {
    strategy: "/strategy",
    learn: "/services/learn",
    mentorship: "/mentorship",
    blog: "/blog",
    contact: "/contact",
    resources: "/resources",
  }
} as const;

// Helper function to get external link props
export const getExternalLinkProps = (url: string) => ({
  href: url,
  target: "_blank",
  rel: "noopener noreferrer sponsored"
});

// Helper function to get internal link props
export const getInternalLinkProps = (url: string) => {
  // Use clean URLs with BrowserRouter for proper SPA routing
  const cleaned = url.startsWith('/') ? url : `/${url}`;
  return { href: cleaned };
};
