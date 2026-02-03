// Performance optimization utilities

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    { href: '/fonts/inter-regular.woff2', as: 'font', type: 'font/woff2' },
    { href: '/fonts/inter-medium.woff2', as: 'font', type: 'font/woff2' },
    { href: '/fonts/inter-semibold.woff2', as: 'font', type: 'font/woff2' },
  ];

  fontLinks.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export const optimizeImages = () => {
  // Lazy load images below the fold
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

export const deferNonCriticalScripts = () => {
  // Defer non-critical JavaScript
  const scripts = document.querySelectorAll('script[data-defer]');
  
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.src = script.getAttribute('src') || '';
    newScript.defer = true;
    document.head.appendChild(newScript);
  });
};

// Web Vitals are now handled via dynamic import in main.tsx

export const enableServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered successfully:', registration);
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  }
};