import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Extract the hash part (everything after #)
    const hash = location.hash.slice(1);

    if (!hash) return;

    // Scroll to element with retry logic for slower DOM rendering
    const scrollToElement = () => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    // Try immediately
    if (scrollToElement()) return;

    // If not found, retry with increasing delays
    let retries = 0;
    const maxRetries = 5;

    const timer = setInterval(() => {
      if (scrollToElement() || retries >= maxRetries) {
        clearInterval(timer);
      }
      retries++;
    }, 100);

    return () => clearInterval(timer);
  }, [location.hash]);
}
