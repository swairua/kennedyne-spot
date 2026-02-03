import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash in the URL, let the browser handle it naturally
    if (hash) {
      return;
    }

    // Force scroll to top immediately and consistently
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior
      });
      
      // Also ensure document element is scrolled to top
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Set focus to skip-to-content link or body for accessibility
      const skipLink = document.getElementById('skip-to-content');
      if (skipLink) {
        skipLink.focus();
      } else {
        document.body.focus();
      }
    });
  }, [pathname, hash]);

  return null;
}
